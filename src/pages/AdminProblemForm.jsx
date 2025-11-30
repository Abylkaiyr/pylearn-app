import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Space, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getProblemById, addProblem, updateProblem, getThemes, exportProblems } from '../utils/dataManager';
import { getCurrentUser } from '../utils/auth';
import './AdminProblemForm.css';

const { Title } = Typography;
const { TextArea } = Input;

const AdminProblemForm = () => {
  const { themeId, problemId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !user.isAdmin) {
      message.error('Қол жеткізу тыйым салынған. Тек админдер үшін.');
      navigate('/');
      return;
    }

    const themes = getThemes();
    const foundTheme = themes.find(t => t.id === themeId);
    setTheme(foundTheme);

    if (problemId && problemId !== 'new') {
      setIsEdit(true);
      const problem = getProblemById(themeId, problemId);
      if (problem) {
        form.setFieldsValue(problem);
      } else {
        message.error('Есеп табылмады');
        navigate(`/problems/${themeId}`);
      }
    }
  }, [themeId, problemId, form, navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const problemData = {
        ...values,
        id: isEdit ? problemId : `${themeId}-${Date.now()}`,
        testCases: values.testCases ? JSON.parse(values.testCases) : []
      };

      if (isEdit) {
        await updateProblem(themeId, problemId, problemData);
        message.success('Есеп сәтті жаңартылды!');
      } else {
        await addProblem(themeId, problemData);
        message.success('Есеп сәтті құрылды!');
      }

      navigate(`/problems/${themeId}`);
    } catch (error) {
      message.error('Есепті сақтау кезінде қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  if (!theme) {
    return null;
  }

  return (
    <div className="admin-form-container">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/problems/${themeId}`)}
        style={{ marginBottom: 20 }}
      >
        Артқа
      </Button>

      <Card>
        <Title level={2}>
          {isEdit ? 'Есепті Өңдеу' : 'Жаңа Есеп Құру'} - {theme.name}
        </Title>
        
        <Alert
          message="Есіңізде болсын"
          description="Өзгерістерді сақтағаннан кейін 'Тақырыптарды Басқару' бетінде 'JSON Экспорттау' батырмасын басып, файлдарды жүктеп алыңыз және git-ке коммиттеңіз."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
          closable
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Тақырып"
            name="title"
            rules={[{ required: true, message: 'Есеп тақырыбын енгізіңіз!' }]}
          >
            <Input placeholder="Есеп тақырыбы" size="large" />
          </Form.Item>

          <Form.Item
            label="Есеп Мәтіні"
            name="problemText"
            rules={[{ required: true, message: 'Есеп сипаттамасын енгізіңіз!' }]}
          >
            <TextArea
              rows={6}
              placeholder="Есепті егжей-тегжейлі сипаттаңыз..."
            />
          </Form.Item>

          <Form.Item
            label="Кіру Сипаттамасы"
            name="input"
            rules={[{ required: true, message: 'Кіру форматын сипаттаңыз!' }]}
          >
            <TextArea
              rows={3}
              placeholder="Кіру форматын сипаттап, мысалдар келтіріңіз"
            />
          </Form.Item>

          <Form.Item
            label="Шығару Сипаттамасы"
            name="output"
            rules={[{ required: true, message: 'Күтілетін шығаруды сипаттаңыз!' }]}
          >
            <TextArea
              rows={3}
              placeholder="Күтілетін шығару форматын сипаттап, мысалдар келтіріңіз"
            />
          </Form.Item>

          <Form.Item
            label="YouTube Бейне Сілтемесі (міндетті емес)"
            name="videoUrl"
          >
            <Input 
              placeholder="YouTube сілтемесі (мысалы: https://www.youtube.com/watch?v=VIDEO_ID)" 
            />
          </Form.Item>

          <Form.Item
            label="Шешім Коды"
            name="solution"
            rules={[{ required: true, message: 'Шешім кодын көрсетіңіз!' }]}
          >
            <TextArea
              rows={8}
              placeholder="Шешім кодын осы жерге жазыңыз..."
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Form.Item
            label="Түсіндірме"
            name="explanation"
            rules={[{ required: true, message: 'Түсіндірме беріңіз!' }]}
          >
            <TextArea
              rows={6}
              placeholder="Шешімнің қалай жұмыс істейтінін түсіндіріңіз..."
            />
          </Form.Item>

          {/* <Form.Item
            label="Тест Кейстері (JSON форматы, міндетті емес)"
            name="testCases"
            help='Формат: [{"input": "...", "expectedOutput": "..."}]'
          >
            <TextArea
              rows={4}
              placeholder='[{"input": "5 3", "expectedOutput": "8"}]'
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item> */}

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                size="large"
              >
                {isEdit ? 'Есепті Жаңарту' : 'Есеп Құру'}
              </Button>
              <Button onClick={() => navigate(`/problems/${themeId}`)} size="large">
                Болдырмау
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminProblemForm;


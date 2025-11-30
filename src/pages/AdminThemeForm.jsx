import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Space, Select } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { 
  CodeOutlined, 
  BulbOutlined, 
  DatabaseOutlined, 
  ThunderboltOutlined,
  BookOutlined,
  ExperimentOutlined,
  RocketOutlined,
  ToolOutlined,
  ApiOutlined,
  CloudOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import { getThemeById, addTheme, updateTheme, getThemes, exportThemes } from '../utils/dataManager';
import { getCurrentUser } from '../utils/auth';
import './AdminProblemForm.css';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const iconOptions = [
  { value: 'CodeOutlined', label: 'Code', icon: CodeOutlined },
  { value: 'BulbOutlined', label: 'Bulb', icon: BulbOutlined },
  { value: 'DatabaseOutlined', label: 'Database', icon: DatabaseOutlined },
  { value: 'ThunderboltOutlined', label: 'Thunderbolt', icon: ThunderboltOutlined },
  { value: 'BookOutlined', label: 'Book', icon: BookOutlined },
  { value: 'ExperimentOutlined', label: 'Experiment', icon: ExperimentOutlined },
  { value: 'RocketOutlined', label: 'Rocket', icon: RocketOutlined },
  { value: 'ToolOutlined', label: 'Tool', icon: ToolOutlined },
  { value: 'ApiOutlined', label: 'API', icon: ApiOutlined },
  { value: 'CloudOutlined', label: 'Cloud', icon: CloudOutlined },
  { value: 'SecurityScanOutlined', label: 'Security', icon: SecurityScanOutlined },
];

// Generate a unique ID from theme name
const generateThemeId = (name, existingThemes) => {
  // Convert to lowercase and replace spaces with hyphens
  let baseId = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // If empty after processing, use a default
  if (!baseId) {
    baseId = 'theme';
  }

  // Check if ID already exists, if so append a number
  let finalId = baseId;
  let counter = 1;
  while (existingThemes.find(t => t.id === finalId)) {
    finalId = `${baseId}-${counter}`;
    counter++;
  }

  return finalId;
};

const AdminThemeForm = () => {
  const { themeId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !user.isAdmin) {
      message.error('Қол жеткізу тыйым салынған. Тек админдер үшін.');
      navigate('/');
      return;
    }

    if (themeId && themeId !== 'new') {
      setIsEdit(true);
      const theme = getThemeById(themeId);
      if (theme) {
        form.setFieldsValue(theme);
      } else {
        message.error('Тақырып табылмады');
        navigate('/admin/themes');
      }
    }
  }, [themeId, form, navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const existingThemes = getThemes();
      
      // Generate ID automatically from name for new themes
      const themeData = {
        ...values,
        id: isEdit ? themeId : generateThemeId(values.name, existingThemes),
      };

      if (isEdit) {
        await updateTheme(themeId, themeData);
        message.success('Тақырып сәтті жаңартылды!');
      } else {
        await addTheme(themeData);
        message.success('Тақырып сәтті құрылды!');
      }

      navigate('/admin/themes');
    } catch (error) {
      message.error('Тақырыпты сақтау кезінде қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/admin/themes')}
        style={{ marginBottom: 20 }}
      >
        Артқа
      </Button>

      <Card>
        <Title level={2}>
          {isEdit ? 'Тақырыпты Өңдеу' : 'Жаңа Тақырып Құру'}
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Тақырып Атауы"
            name="name"
            rules={[{ required: true, message: 'Тақырып атауын енгізіңіз!' }]}
          >
            <Input placeholder="мысалы, Кеңейтілген Python" size="large" />
          </Form.Item>

          <Form.Item
            label="Сипаттама"
            name="description"
            rules={[{ required: true, message: 'Сипаттама енгізіңіз!' }]}
          >
            <TextArea
              rows={4}
              placeholder="Бұл тақырып не қамтитынын сипаттаңыз..."
            />
          </Form.Item>

          <Form.Item
            label="Белгіше"
            name="icon"
            rules={[{ required: true, message: 'Белгішені таңдаңыз!' }]}
          >
            <Select
              size="large"
              placeholder="Белгішені таңдаңыз"
              showSearch
              optionFilterProp="children"
            >
              {iconOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  <Space>
                    <option.icon />
                    {option.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                {isEdit ? 'Тақырыпты Жаңарту' : 'Тақырып Құру'}
              </Button>
              <Button onClick={() => navigate('/admin/themes')} size="large">
                Болдырмау
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminThemeForm;


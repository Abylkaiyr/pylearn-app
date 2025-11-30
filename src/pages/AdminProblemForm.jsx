import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getProblemById, addProblem, updateProblem, getThemes } from '../utils/dataManager';
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
      message.error('Access denied. Admin only.');
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
        message.error('Problem not found');
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
        updateProblem(themeId, problemId, problemData);
        message.success('Problem updated successfully!');
      } else {
        addProblem(themeId, problemData);
        message.success('Problem created successfully!');
      }

      navigate(`/problems/${themeId}`);
    } catch (error) {
      message.error('An error occurred while saving the problem');
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
        Back
      </Button>

      <Card>
        <Title level={2}>
          {isEdit ? 'Edit Problem' : 'Create New Problem'} - {theme.name}
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter the problem title!' }]}
          >
            <Input placeholder="Problem title" size="large" />
          </Form.Item>

          <Form.Item
            label="Problem Text"
            name="problemText"
            rules={[{ required: true, message: 'Please enter the problem description!' }]}
          >
            <TextArea
              rows={6}
              placeholder="Describe the problem in detail..."
            />
          </Form.Item>

          <Form.Item
            label="Input Description"
            name="input"
            rules={[{ required: true, message: 'Please describe the input format!' }]}
          >
            <TextArea
              rows={3}
              placeholder="Describe the input format and provide examples"
            />
          </Form.Item>

          <Form.Item
            label="Output Description"
            name="output"
            rules={[{ required: true, message: 'Please describe the expected output!' }]}
          >
            <TextArea
              rows={3}
              placeholder="Describe the expected output format and provide examples"
            />
          </Form.Item>

          <Form.Item
            label="Video URL (optional)"
            name="videoUrl"
          >
            <Input placeholder="YouTube embed URL or video link" />
          </Form.Item>

          <Form.Item
            label="Solution Code"
            name="solution"
            rules={[{ required: true, message: 'Please provide the solution code!' }]}
          >
            <TextArea
              rows={8}
              placeholder="Write the solution code here..."
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Form.Item
            label="Explanation"
            name="explanation"
            rules={[{ required: true, message: 'Please provide an explanation!' }]}
          >
            <TextArea
              rows={6}
              placeholder="Explain how the solution works..."
            />
          </Form.Item>

          <Form.Item
            label="Test Cases (JSON format, optional)"
            name="testCases"
            help='Format: [{"input": "...", "expectedOutput": "..."}]'
          >
            <TextArea
              rows={4}
              placeholder='[{"input": "5 3", "expectedOutput": "8"}]'
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                {isEdit ? 'Update Problem' : 'Create Problem'}
              </Button>
              <Button onClick={() => navigate(`/problems/${themeId}`)} size="large">
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminProblemForm;


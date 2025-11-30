import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../utils/auth';
import './Login.css';

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = login(values.username, values.password);
      if (result.success) {
        message.success('Кіру сәтті болды!');
        navigate('/');
      } else {
        message.error(result.message || 'Кіру сәтсіз болды');
      }
    } catch (error) {
      message.error('Кіру кезінде қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
          Кіру
        </Title>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="Пайдаланушы аты"
            name="username"
            rules={[{ required: true, message: 'Пайдаланушы атын енгізіңіз!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Пайдаланушы аты"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Құпия сөз"
            name="password"
            rules={[{ required: true, message: 'Құпия сөзді енгізіңіз!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Құпия сөз"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Кіру
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          Тіркелгіңіз жоқ па? <Link to="/register">Мұнда тіркеліңіз</Link>
        </div>
        <div style={{ marginTop: 16, padding: 12, background: '#f0f0f0', borderRadius: 4, fontSize: '12px' }}>
          <strong>Демо Тіркелгілер:</strong><br />
          Админ: admin / admin123<br />
          Мұғалім: teacher / teacher123
        </div>
      </Card>
    </div>
  );
};

export default Login;


import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../utils/auth';
import './Login.css';

const { Title } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = register(values.username, values.email, values.password);
      if (result.success) {
        message.success('Тіркелу сәтті болды!');
        navigate('/');
      } else {
        message.error(result.message || 'Тіркелу сәтсіз болды');
      }
    } catch (error) {
      message.error('Тіркелу кезінде қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
          Тіркелу
        </Title>
        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="Пайдаланушы аты"
            name="username"
            rules={[
              { required: true, message: 'Пайдаланушы атын енгізіңіз!' },
              { min: 3, message: 'Пайдаланушы аты кемінде 3 таңбадан тұруы керек' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Пайдаланушы аты"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Электрондық пошта"
            name="email"
            rules={[
              { required: true, message: 'Электрондық поштаны енгізіңіз!' },
              { type: 'email', message: 'Дұрыс электрондық пошта енгізіңіз!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Электрондық пошта"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Құпия сөз"
            name="password"
            rules={[
              { required: true, message: 'Құпия сөзді енгізіңіз!' },
              { min: 6, message: 'Құпия сөз кемінде 6 таңбадан тұруы керек' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Құпия сөз"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Құпия сөзді растау"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Құпия сөзді растаңыз!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Құпия сөздер сәйкес келмейді!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Құпия сөзді растау"
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
              Тіркелу
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          Тіркелгіңіз бар ма? <Link to="/login">Мұнда кіріңіз</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;


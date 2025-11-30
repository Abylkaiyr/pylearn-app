import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space, Empty } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { getThemes, getProblemsByTheme } from '../utils/dataManager';
import { getCurrentUser } from '../utils/auth';
import './Problems.css';

const { Title } = Typography;

const Problems = () => {
  const { themeId } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(null);
  const [problems, setProblems] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const themes = getThemes();
    const foundTheme = themes.find(t => t.id === themeId);
    setTheme(foundTheme);
    
    const loadedProblems = getProblemsByTheme(themeId);
    setProblems(loadedProblems);
    
    setUser(getCurrentUser());
  }, [themeId]);

  const isAdmin = user?.isAdmin;

  return (
    <div className="problems-container">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/')}
        style={{ marginBottom: 20 }}
      >
        Back to Home
      </Button>

      {theme && (
        <>
          <Title level={2}>{theme.name}</Title>
          <p style={{ fontSize: 16, color: '#666', marginBottom: 30 }}>
            {theme.description}
          </p>
        </>
      )}

      {isAdmin && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(`/admin/problem/${themeId}/new`)}
          style={{ marginBottom: 20 }}
        >
          Add New Problem
        </Button>
      )}

      {problems.length === 0 ? (
        <Empty description="No problems available in this category yet" />
      ) : (
        <div className="problems-list">
          {problems.map((problem) => (
            <Card
              key={problem.id}
              hoverable
              className="problem-card"
              onClick={() => navigate(`/problem/${themeId}/${problem.id}`)}
              style={{ marginBottom: 16 }}
            >
              <Title level={4}>{problem.title}</Title>
              <p style={{ color: '#666', marginBottom: 0 }}>
                {problem.problemText.substring(0, 150)}
                {problem.problemText.length > 150 ? '...' : ''}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Problems;


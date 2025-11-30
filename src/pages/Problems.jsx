import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space, Empty } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { getThemes, getProblemsByTheme, subscribeToThemes, subscribeToProblems } from '../utils/dataManager';
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
    // Load initial data
    const initialThemes = getThemes();
    const foundTheme = initialThemes.find(t => t.id === themeId);
    const initialProblems = getProblemsByTheme(themeId);
    const initialUser = getCurrentUser();
    
    setTimeout(() => {
      setTheme(foundTheme);
      setProblems(initialProblems);
      setUser(initialUser);
    }, 0);
    
    // Set up real-time listeners
    const unsubscribeThemes = subscribeToThemes((themes) => {
      const updatedTheme = themes.find(t => t.id === themeId);
      setTheme(updatedTheme);
    });
    
    const unsubscribeProblems = subscribeToProblems((problemsData) => {
      const updatedProblems = problemsData[themeId] || [];
      setProblems(updatedProblems);
    });
    
    // Cleanup
    return () => {
      if (unsubscribeThemes) unsubscribeThemes();
      if (unsubscribeProblems) unsubscribeProblems();
    };
  }, [themeId]);

  const isAdmin = user?.isAdmin;

  return (
    <div className="problems-container">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/')}
        style={{ marginBottom: 20 }}
      >
        Басты бетке оралу
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
          Жаңа Есеп Қосу
        </Button>
      )}

      {problems.length === 0 ? (
        <Empty description="Бұл категорияда әлі есептер жоқ" />
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


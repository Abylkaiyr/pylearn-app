import { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Button, Space, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CodeOutlined, BulbOutlined, DatabaseOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { getThemes, getProblems } from '../utils/dataManager';
import siteInfo from '../data/siteInfo.json';
import './Home.css';

const { Title, Paragraph } = Typography;

const iconMap = {
  CodeOutlined: CodeOutlined,
  BulbOutlined: BulbOutlined,
  DatabaseOutlined: DatabaseOutlined,
  ThunderboltOutlined: ThunderboltOutlined
};

const Home = () => {
  const [themes, setThemes] = useState([]);
  const [problems, setProblems] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadedThemes = getThemes();
    const loadedProblems = getProblems();
    setThemes(loadedThemes);
    setProblems(loadedProblems);
  }, []);

  const getProblemCount = (themeId) => {
    return problems[themeId]?.length || 0;
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <Title level={1} className="hero-title">{siteInfo.title}</Title>
        <Paragraph className="hero-description">{siteInfo.aim}</Paragraph>
        <Paragraph>
          <strong>Creator:</strong> {siteInfo.creator}
        </Paragraph>
      </div>

      <div className="themes-section">
        <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>
          Problem Categories
        </Title>
        <Row gutter={[24, 24]}>
          {themes.map((theme) => {
            const IconComponent = iconMap[theme.icon] || CodeOutlined;
            const problemCount = getProblemCount(theme.id);
            
            return (
              <Col xs={24} sm={12} lg={6} key={theme.id}>
                <Card
                  hoverable
                  className="theme-card"
                  onClick={() => navigate(`/problems/${theme.id}`)}
                  cover={
                    <div className="theme-icon-container">
                      <IconComponent className="theme-icon" />
                    </div>
                  }
                >
                  <Card.Meta
                    title={
                      <Space>
                        <span>{theme.name}</span>
                        <Tag color="blue">{problemCount} problems</Tag>
                      </Space>
                    }
                    description={theme.description}
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};

export default Home;


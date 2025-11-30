import { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Button, Space, Tag, Carousel } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  CodeOutlined, 
  BulbOutlined, 
  DatabaseOutlined, 
  ThunderboltOutlined, 
  SettingOutlined,
  BookOutlined,
  ExperimentOutlined,
  RocketOutlined,
  ToolOutlined,
  ApiOutlined,
  CloudOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import { getThemes, getProblems, subscribeToThemes, subscribeToProblems } from '../utils/dataManager';
import { getCurrentUser } from '../utils/auth';
import siteInfo from '../data/siteInfo.json';
import gulsharatImage from '../assets/gulsharat.jpeg';
import aishaImage from '../assets/aisha.jpeg';
import './Home.css';

const { Title, Paragraph } = Typography;

const iconMap = {
  CodeOutlined: CodeOutlined,
  BulbOutlined: BulbOutlined,
  DatabaseOutlined: DatabaseOutlined,
  ThunderboltOutlined: ThunderboltOutlined,
  BookOutlined: BookOutlined,
  ExperimentOutlined: ExperimentOutlined,
  RocketOutlined: RocketOutlined,
  ToolOutlined: ToolOutlined,
  ApiOutlined: ApiOutlined,
  CloudOutlined: CloudOutlined,
  SecurityScanOutlined: SecurityScanOutlined,
};

const Home = () => {
  const [themes, setThemes] = useState([]);
  const [problems, setProblems] = useState({});
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load initial data
    const initialThemes = getThemes();
    const initialProblems = getProblems();
    const initialUser = getCurrentUser();
    
    // Use setTimeout to avoid synchronous setState warning
    setTimeout(() => {
      setThemes(initialThemes);
      setProblems(initialProblems);
      setUser(initialUser);
    }, 0);
    
    // Set up real-time listeners for Firebase
    const unsubscribeThemes = subscribeToThemes((data) => {
      setThemes(data);
    });
    
    const unsubscribeProblems = subscribeToProblems((data) => {
      setProblems(data);
    });
    
    // Cleanup listeners on unmount
    return () => {
      if (unsubscribeThemes) unsubscribeThemes();
      if (unsubscribeProblems) unsubscribeProblems();
    };
  }, []);

  const getProblemCount = (themeId) => {
    return problems[themeId]?.length || 0;
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        {/* Floating coding icons */}
        <div className="hero-background-icons">
          <CodeOutlined className="floating-icon icon-1" />
          <DatabaseOutlined className="floating-icon icon-2" />
          <ThunderboltOutlined className="floating-icon icon-3" />
          <ApiOutlined className="floating-icon icon-4" />
          <CloudOutlined className="floating-icon icon-5" />
          <RocketOutlined className="floating-icon icon-6" />
          <ToolOutlined className="floating-icon icon-7" />
          <SecurityScanOutlined className="floating-icon icon-8" />
        </div>
        
        {/* Code snippets overlay */}
        <div className="code-snippets-overlay">
          <div className="code-snippet snippet-1">{'<div className="code">'}</div>
          <div className="code-snippet snippet-2">{'def main():'}</div>
          <div className="code-snippet snippet-3">{'import React'}</div>
          <div className="code-snippet snippet-4">{'const app = {}'}</div>
          <div className="code-snippet snippet-5">{'function solve() {'}</div>
          <div className="code-snippet snippet-6">{'return true'}</div>
        </div>

        <Title level={1} className="hero-main-title">{siteInfo.title}</Title>
        <Carousel autoplay effect="fade" className="hero-carousel">
          <div className="hero-slide">
            <div className="hero-slide-content">
              <Title level={2} className="hero-slide-title">
                Python программалау тілінде олимпиадаға дайындалу жолдарының электрондық нұсқасы.
              </Title>
              <Paragraph className="hero-slide-description">
                Бұл оқушылар мен ұстаздарға өз бетінше дайындалуға және өздерін шыңдауға арналған ашық түрдегі платформа.
              </Paragraph>
            </div>
          </div>
          <div className="hero-slide">
            <div className="hero-slide-content">
              <Title level={2} className="hero-slide-title">
                Біздің мақсатымыз:
              </Title>
              <Paragraph className="hero-slide-description">
                Біздің бұл платформаны жасаудағы басты мақсатымыз және ұстанымымыз - Қазақ тілінде сөйлестін оқушылардың өз бетінше программалаудан дайындық дайындық жүргізуіне және түрлі деңгейдегі олимпиадаларға шыңдалуына мүмкіндік жасау.
              </Paragraph>
            </div>
          </div>
          <div className="hero-slide">
            <div className="hero-slide-content">
              <Title level={2} className="hero-slide-title">
                Сайт сипаттамасы:
              </Title>
              <Paragraph className="hero-slide-description">
                Оқушылар базалық және күрделі есептерді, топталған жиынтықтар арқылы таба алады. Сонымен қатар, әрбір есепке талдау жасалынып жіті түсіндірме жасалған. Бұл келешекте Қазақстанды көркейтетін мықты IT мамандарын дайындауға жасалған керемет құрал!
              </Paragraph>
            </div>
          </div>
        </Carousel>
      </div>

      <div className="themes-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <Title level={2} style={{ textAlign: 'center', margin: '0 auto' }}>
            Есептер топтамасы
          </Title>
          {user?.isAdmin && (
            <Button
              type="primary"
              icon={<SettingOutlined />}
              onClick={() => navigate('/admin/themes')}
              style={{ marginLeft: 'auto' }}
            >
              Тақырыптарды Басқару
            </Button>
          )}
        </div>
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
                        <Tag color="blue">{problemCount} есеп</Tag>
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

      <div className="creators-section">
        <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>
          Жоба Тобы
        </Title>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="creator-card" hoverable>
              <div className="creator-image-container">
                <img 
                  src={gulsharatImage} 
                  alt="Гүлшарат Сейдахметова" 
                  className="creator-image"
                />
              </div>
              <Card.Meta
                title="Сейдахметова Гүлшарат"
                description="Жоба жетекшісі"
                style={{ textAlign: 'center', marginTop: 16 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="creator-card" hoverable>
              <div className="creator-image-container">
                <img 
                  src={aishaImage} 
                  alt="Айша Арапбай" 
                  className="creator-image"
                />
              </div>
              <Card.Meta
                title="Арапбай Айша"
                description="оқушы"
                style={{ textAlign: 'center', marginTop: 16 }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Home;


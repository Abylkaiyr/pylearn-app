import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Collapse, Button, Space, Tag, Empty } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { getProblemById, deleteProblem } from '../utils/dataManager';
import { getCurrentUser } from '../utils/auth';
import PythonCompiler from '../components/PythonCompiler';
import { convertYouTubeToEmbed, isFirebaseStorageUrl } from '../utils/videoUtils';
import './ProblemDetail.css';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const ProblemDetail = () => {
  const { themeId, problemId } = useParams();
  const navigate = useNavigate();
  
  const problem = useMemo(() => getProblemById(themeId, problemId), [themeId, problemId]);
  const user = useMemo(() => getCurrentUser(), []);

  const isAdmin = user?.isAdmin;

  const handleDelete = () => {
    if (window.confirm('Бұл есепті жоюға сенімдісіз бе?')) {
      if (deleteProblem(themeId, problemId)) {
        navigate(`/problems/${themeId}`);
      }
    }
  };

  if (!problem) {
    return (
      <div className="problem-detail-container">
        <Empty description="Есеп табылмады" />
      </div>
    );
  }

  return (
    <div className="problem-detail-container">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/problems/${themeId}`)}
        style={{ marginBottom: 20 }}
      >
        Есептерге оралу
      </Button>

      <div className="problem-header">
        <Title level={2}>{problem.title}</Title>
        {isAdmin && (
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/problem/${themeId}/${problemId}`)}
            >
              Өңдеу
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              Жою
            </Button>
          </Space>
        )}
      </div>

      <Collapse defaultActiveKey={['1']} className="problem-collapse">
        <Panel header="Берілгені" key="1">
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {problem.problemText}
          </Paragraph>
        </Panel>

        <Panel header="input/output" key="2">
          <div className="io-section">
            <div>
              <Title level={5}>Кіру:</Title>
              <div className="io-box">
                <pre>{problem.input}</pre>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Title level={5}>Күтілетін Шығару:</Title>
              <div className="io-box">
                <pre>{problem.output}</pre>
              </div>
            </div>
          </div>
        </Panel>

        {problem.videoUrl && (
          <Panel header="Бейне талдау" key="3">
            <div className="video-container">
              {(() => {
                const embedUrl = convertYouTubeToEmbed(problem.videoUrl);
                if (embedUrl) {
                  return (
                    <iframe
                      width="100%"
                      height="400"
                      src={embedUrl}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                } else if (isFirebaseStorageUrl(problem.videoUrl)) {
                  return (
                    <video
                      width="100%"
                      height="400"
                      controls
                      style={{ maxWidth: '100%' }}
                    >
                      <source src={problem.videoUrl} type="video/mp4" />
                      Сіздің браузеріңіз бейне форматын қолдамайды.
                    </video>
                  );
                } else {
                  return <Paragraph>Video URL: {problem.videoUrl}</Paragraph>;
                }
              })()}
            </div>
          </Panel>
        )}

        <Panel header="Есептің шешімі" key="4">
          <div className="solution-box">
            <pre>{problem.solution}</pre>
          </div>
        </Panel>

        <Panel header="Талдау" key="5">
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {problem.explanation}
          </Paragraph>
        </Panel>

        <Panel header="Онлайн компилятор" key="6">
          <PythonCompiler problem={problem} />
        </Panel>
      </Collapse>
    </div>
  );
};

export default ProblemDetail;


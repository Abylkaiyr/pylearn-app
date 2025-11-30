import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Collapse, Button, Space, Tag, Empty } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { getProblemById, deleteProblem } from '../utils/dataManager';
import { getCurrentUser } from '../utils/auth';
import PythonCompiler from '../components/PythonCompiler';
import './ProblemDetail.css';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const ProblemDetail = () => {
  const { themeId, problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadedProblem = getProblemById(themeId, problemId);
    setProblem(loadedProblem);
    setUser(getCurrentUser());
  }, [themeId, problemId]);

  const isAdmin = user?.isAdmin;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      if (deleteProblem(themeId, problemId)) {
        navigate(`/problems/${themeId}`);
      }
    }
  };

  if (!problem) {
    return (
      <div className="problem-detail-container">
        <Empty description="Problem not found" />
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
        Back to Problems
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
              Edit
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Space>
        )}
      </div>

      <Collapse defaultActiveKey={['1']} className="problem-collapse">
        <Panel header="Problem Description" key="1">
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {problem.problemText}
          </Paragraph>
        </Panel>

        <Panel header="Input & Output" key="2">
          <div className="io-section">
            <div>
              <Title level={5}>Input:</Title>
              <div className="io-box">
                <pre>{problem.input}</pre>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Title level={5}>Expected Output:</Title>
              <div className="io-box">
                <pre>{problem.output}</pre>
              </div>
            </div>
          </div>
        </Panel>

        {problem.videoUrl && (
          <Panel header="Video Tutorial" key="3">
            <div className="video-container">
              {problem.videoUrl.startsWith('http') ? (
                <iframe
                  width="100%"
                  height="400"
                  src={problem.videoUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <Paragraph>Video URL: {problem.videoUrl}</Paragraph>
              )}
            </div>
          </Panel>
        )}

        <Panel header="Solution" key="4">
          <div className="solution-box">
            <pre>{problem.solution}</pre>
          </div>
        </Panel>

        <Panel header="Explanation" key="5">
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {problem.explanation}
          </Paragraph>
        </Panel>

        <Panel header="Try It Yourself" key="6">
          <PythonCompiler problem={problem} />
        </Panel>
      </Collapse>
    </div>
  );
};

export default ProblemDetail;


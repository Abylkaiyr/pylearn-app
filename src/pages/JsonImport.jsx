import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Input, message, Space, Alert, Spin } from 'antd';
import { ArrowLeftOutlined, FileTextOutlined } from '@ant-design/icons';
import { addTheme, addProblem, getThemes } from '../utils/dataManager';
import { getCurrentUser } from '../utils/auth';
import './AdminProblemForm.css';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const JsonImport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !user.isAdmin) {
      message.error('Қол жеткізу тыйым салынған. Тек админдер үшін.');
      navigate('/');
    }
  }, [navigate]);

  const validateJson = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Expected format: { theme: {...}, problems: [...] }
      if (!parsed.theme || !parsed.problems) {
        throw new Error('JSON форматы дұрыс емес. Күтілетін формат: { "theme": {...}, "problems": [...] }');
      }
      
      if (!parsed.theme.name) {
        throw new Error('Тақырып атауы (theme.name) міндетті!');
      }
      
      if (!Array.isArray(parsed.problems)) {
        throw new Error('Есептер (problems) массив болуы керек!');
      }
      
      return parsed;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`JSON синтаксис қатесі: ${error.message}`);
      }
      throw error;
    }
  };

  const handlePreview = () => {
    if (!jsonContent.trim()) {
      message.warning('JSON мазмұнын енгізіңіз!');
      return;
    }

    try {
      const parsed = validateJson(jsonContent);
      setPreviewData(parsed);
      message.success('JSON дұрыс форматталған!');
    } catch (error) {
      message.error(error.message);
      setPreviewData(null);
    }
  };

  const handleImportToFirebase = async () => {
    if (!jsonContent.trim()) {
      message.error('JSON мазмұнын енгізіңіз!');
      return;
    }

    setLoading(true);
    try {
      const parsed = validateJson(jsonContent);
      const existingThemes = getThemes();
      
      // Generate unique theme ID
      let themeId = generateThemeId(parsed.theme.name);
      let counter = 1;
      while (existingThemes.find(t => t.id === themeId)) {
        themeId = `${generateThemeId(parsed.theme.name)}-${counter}`;
        counter++;
      }
      
      // Create theme object
      const themeObj = {
        id: themeId,
        name: parsed.theme.name,
        description: parsed.theme.description || 'Сипаттама жоқ',
        icon: parsed.theme.icon || 'CodeOutlined'
      };
      
      // Add theme
      await addTheme(themeObj);
      message.success(`Тақырып "${themeObj.name}" қосылды!`);
      
      // Add problems
      if (parsed.problems && parsed.problems.length > 0) {
        for (let i = 0; i < parsed.problems.length; i++) {
          const problem = parsed.problems[i];
          const problemData = {
            id: problem.id || `${themeId}-${i + 1}`,
            title: problem.title || `Есеп ${i + 1}`,
            problemText: problem.problemText || problem.title || '',
            input: problem.input || 'Кіру сипаттамасы жоқ',
            output: problem.output || 'Шығару сипаттамасы жоқ',
            solution: problem.solution || '# Шешім коды жоқ',
            explanation: problem.explanation || 'Талдау жоқ',
            videoUrl: problem.videoUrl || '',
            testCases: problem.testCases || []
          };
          
          await addProblem(themeId, problemData);
        }
        message.success(`${parsed.problems.length} есеп қосылды!`);
      }
      
      message.success('Барлық деректер Firebase-ке сәтті импортталды!');
      
      // Clear form
      setJsonContent('');
      setPreviewData(null);
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/admin/themes');
      }, 1500);
    } catch (error) {
      message.error(`Firebase-ке импорттау қатесі: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateThemeId = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'theme';
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
        <Title level={2}>JSON Деректерді Импорттау</Title>
        
        <Alert
          message="JSON Форматы"
          description={
            <div>
              <p><strong>Күтілетін JSON форматы:</strong></p>
              <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`{
  "theme": {
    "name": "Тақырып атауы",
    "description": "Тақырып сипаттамасы",
    "icon": "CodeOutlined"
  },
  "problems": [
    {
      "title": "Есеп тақырыбы",
      "problemText": "Есеп мәтіні",
      "input": "Кіру сипаттамасы",
      "output": "Шығару сипаттамасы",
      "solution": "Шешім коды",
      "explanation": "Талдау",
      "videoUrl": "",
      "testCases": []
    }
  ]
}`}
              </pre>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>JSON Мазмұнын Енгізіңіз</Title>
            <TextArea
              rows={15}
              value={jsonContent}
              onChange={(e) => {
                setJsonContent(e.target.value);
                setPreviewData(null);
              }}
              placeholder='{"theme": {...}, "problems": [...]}'
              style={{ fontFamily: 'monospace' }}
            />
          </div>

          <Space>
            <Button
              onClick={handlePreview}
              disabled={!jsonContent.trim()}
            >
              Тексеру
            </Button>
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={handleImportToFirebase}
              loading={loading}
              disabled={!jsonContent.trim() || !previewData}
            >
              Firebase-ке Импорттау
            </Button>
          </Space>

          {previewData && (
            <Alert
              message="Парсингтелген Деректер"
              description={
                <div>
                  <Paragraph>
                    <strong>Тақырып:</strong> {previewData.theme.name}
                  </Paragraph>
                  <Paragraph>
                    <strong>Сипаттама:</strong> {previewData.theme.description || 'Жоқ'}
                  </Paragraph>
                  <Paragraph>
                    <strong>Есептер саны:</strong> {previewData.problems?.length || 0}
                  </Paragraph>
                </div>
              }
              type="success"
              showIcon
            />
          )}
        </Space>
      </Card>
    </div>
  );
};

export default JsonImport;


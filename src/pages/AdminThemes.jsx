import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Table, 
  Popconfirm, 
  message,
  Empty,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ArrowLeftOutlined 
} from '@ant-design/icons';
import { getThemes, deleteTheme, getProblems, exportThemes, exportProblems, subscribeToThemes, subscribeToProblems } from '../utils/dataManager';
import { getCurrentUser } from '../utils/auth';
import { checkFirebaseStatus } from '../utils/firebaseDebug';
import { isFirebaseConfigured } from '../utils/firebase';
import { 
  CodeOutlined, 
  BulbOutlined, 
  DatabaseOutlined, 
  ThunderboltOutlined,
  BookOutlined,
  ExperimentOutlined,
  RocketOutlined,
  ToolOutlined,
  ApiOutlined,
  CloudOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import './AdminProblemForm.css';

const { Title } = Typography;

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

const AdminThemes = () => {
  const navigate = useNavigate();
  const [themes, setThemes] = useState([]);
  const [problems, setProblems] = useState({});

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !user.isAdmin) {
      message.error('Қол жеткізу тыйым салынған. Тек админдер үшін.');
      navigate('/');
      return;
    }

    // Initial load
    const loadedThemes = getThemes();
    const loadedProblems = getProblems();
    setThemes(loadedThemes);
    setProblems(loadedProblems);
    
    // Set up real-time listeners
    const unsubscribeThemes = subscribeToThemes((data) => {
      setThemes(data);
    });
    
    const unsubscribeProblems = subscribeToProblems((data) => {
      setProblems(data);
    });
    
    // Cleanup
    return () => {
      if (unsubscribeThemes) unsubscribeThemes();
      if (unsubscribeProblems) unsubscribeProblems();
    };
  }, [navigate]);

  const handleDelete = async (themeId) => {
    const success = await deleteTheme(themeId);
    if (success) {
      message.success('Тақырып сәтті жойылды!');
      // Data will update automatically via real-time listeners
    } else {
      message.error('Тақырыпты жою сәтсіз болды. Firestore рұқсаттарын тексеріңіз.');
    }
  };

  const getProblemCount = (themeId) => {
    return problems[themeId]?.length || 0;
  };

  const columns = [
    {
      title: 'Белгіше',
      dataIndex: 'icon',
      key: 'icon',
      width: 80,
      render: (icon) => {
        const IconComponent = iconMap[icon] || CodeOutlined;
        return <IconComponent style={{ fontSize: 24 }} />;
      },
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
    },
    {
      title: 'Атауы',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Сипаттама',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Есептер',
      key: 'problems',
      width: 100,
      render: (_, record) => getProblemCount(record.id),
    },
    {
      title: 'Әрекеттер',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/theme/${record.id}`)}
          >
            Өңдеу
          </Button>
          <Popconfirm
            title="Тақырыпты жою"
            description={`"${record.name}" тақырыбын жоюға сенімдісіз бе? Бұл осы тақырыптағы барлық есептерді де жояды.`}
            onConfirm={() => handleDelete(record.id)}
            okText="Иә"
            cancelText="Жоқ"
            okType="danger"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Жою
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-form-container">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/')}
        style={{ marginBottom: 20 }}
      >
        Басты бетке оралу
      </Button>

      <Card>
        <Alert
          type={isFirebaseConfigured() ? "success" : "info"}
          message={
            isFirebaseConfigured() 
              ? "✅ Firebase қосылған - өзгерістер барлық пайдаланушыларға лезде көрінеді! Браузер консолінде (F12) Firebase статусын тексеру үшін: window.checkFirebase()"
              : "⚠️ Firebase қосылмаған - JSON файлдары пайдаланылады. Өзгерістерді сақтағаннан кейін 'JSON Экспорттау' батырмасын басып, файлдарды жүктеп алыңыз. Содан кейін оларды git-ке коммиттеңіз."
          }
          showIcon
          style={{ marginBottom: 24 }}
          closable
          action={
            <Button size="small" onClick={() => checkFirebaseStatus().then(status => {
              message.info(`Firebase: ${status.configured ? '✅ Қосылған' : '❌ Қосылмаған'} | Дерек көзі: ${status.source}`, 5);
              console.log('Firebase Status:', status);
            })}>
              Статусты Тексеру
            </Button>
          }
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>Тақырыптарды Басқару</Title>
          <Space>
            <Button
              onClick={() => {
                exportThemes();
                exportProblems();
                message.success('JSON файлдары экспортталды! Оларды git-ке коммиттеңіз.');
              }}
            >
              JSON Экспорттау
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/theme/new')}
              size="large"
            >
              Жаңа Тақырып Қосу
            </Button>
          </Space>
        </div>

        {themes.length === 0 ? (
          <Empty description="Тақырыптар жоқ" />
        ) : (
          <Table
            columns={columns}
            dataSource={themes}
            rowKey="id"
            pagination={false}
          />
        )}
      </Card>
    </div>
  );
};

export default AdminThemes;


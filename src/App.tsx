
import AppRouter from '@/router';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#0A2463',
          colorInfo: '#3E92CC',
          colorSuccess: '#2EC4B6',
          colorWarning: '#FF6B35',
          colorError: '#EF4444',
          borderRadius: 8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <AppRouter />
    </ConfigProvider>
  );
}

export default App;

import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.jsx';
import SessionManager from './components/common/SessionManager.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <SessionManager />
      <AppRoutes />
    </BrowserRouter>
  );
}

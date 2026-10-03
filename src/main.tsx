import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { notificationService } from './utils/notifications';

// Pre-initialize background Service Worker for background notifications
notificationService.initServiceWorker().catch(() => {});

createRoot(document.getElementById('root')!).render(<App />);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import './i18n.js';
import store from './Store/store.js';
import ThemeAndRtlProvider from './components/common/ThemeAndRtlProvider.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeAndRtlProvider>
        <App />
      </ThemeAndRtlProvider>
    </Provider>
  </StrictMode>
);

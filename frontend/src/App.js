import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Fab } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import Dashboard from './components/Dashboard';
import Tenants from './components/Tenants';
import Properties from './components/Properties';
import Transactions from './components/Transactions';
import Navigation from './components/Navigation';
import ChatPage from './components/ChatPage';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const showFab = location.pathname !== '/chat';

  return (
    <div className="App">
      <Navigation />
      <main className={location.pathname === '/chat' ? 'chat-content' : 'main-content'}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </main>
      <Toaster position="top-right" />
      {showFab && (
        <Fab
          color="primary"
          aria-label="chat"
          sx={{ position: 'fixed', bottom: 32, right: 32 }}
          onClick={() => navigate('/chat')}
        >
          <ChatIcon />
        </Fab>
      )}
    </div>
  );
}



function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;

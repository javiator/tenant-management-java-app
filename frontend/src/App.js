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
import About from './components/About';
import Footer from './components/Footer';
import { ChatProvider } from './context/ChatContext';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const showFab = location.pathname !== '/chat';

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      <main className={location.pathname === '/chat' ? 'chat-content' : 'main-content'}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      {location.pathname !== '/chat' && <Footer />}
      <Toaster position="top-right" />
      {showFab && (
        <Fab
          color="primary"
          variant="extended"
          aria-label="chat"
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 32,
            animation: 'pulse 2s infinite',
            fontWeight: 'bold',
            px: 3
          }}
          onClick={() => navigate('/chat')}
        >
          <ChatIcon sx={{ mr: 1 }} />
          Ask AI Assistant
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
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

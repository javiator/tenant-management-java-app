import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import ApartmentIcon from '@mui/icons-material/Apartment';

const Navigation = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Tenants', path: '/tenants' },
    { label: 'Properties', path: '/properties' },
    { label: 'Transactions', path: '/transactions' },
    { label: 'Chat', path: '/chat' },
    { label: 'About', path: '/about' },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Property Management
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem button key={item.label} component={Link} to={item.path} selected={isActive(item.path)}>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          height: 48, // Reduced height
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 48 }}>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: '#f5f5f7' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <Link to="/" style={{ color: '#f5f5f7', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ApartmentIcon sx={{ fontSize: 20, opacity: 0.8 }} /> Property Management
            </Link>
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: '#f5f5f7',
                    opacity: isActive(item.path) ? 1 : 0.8,
                    fontSize: '12px',
                    fontWeight: 400,
                    letterSpacing: '0.02em',
                    minWidth: 'auto',
                    padding: '6px 12px',
                    transition: 'opacity 0.2s',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      opacity: 1,
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, backgroundColor: '#f5f5f7' },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Navigation;

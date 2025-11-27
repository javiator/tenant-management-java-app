
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Box, Typography, Grid, Card, CardContent, CardHeader, Avatar, Button, Stack } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const Dashboard = () => {
  const [stats, setStats] = useState({
    tenants: 0,
    properties: 0,
    transactions: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const enableBackup = params.get('download') === 'true';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [tenantsRes, propertiesRes, transactionsRes, recentTransactionsRes] = await Promise.all([
        axios.get('/api/tenants'),
        axios.get('/api/properties'),
        axios.get('/api/transactions'),
        axios.get('/api/transactions?page=1&per_page=5')
      ]);

      setStats({
        tenants: tenantsRes.data.total || 0,
        properties: propertiesRes.data.total || 0,
        transactions: transactionsRes.data.total || 0
      });
      setRecentTransactions(recentTransactionsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch dashboard statistics');
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>Dashboard</Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
        gridTemplateRows: 'auto',
        gap: 3
      }}>
        {/* Main Metric - Tenants (Large) */}
        <Card sx={{
          gridColumn: { xs: '1 / -1', md: '1 / 3' },
          gridRow: { md: 'span 2' },
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}><PeopleIcon /></Avatar>}
            title={<Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>Total Tenants</Typography>}
          />
          <CardContent>
            <Typography variant="h1" sx={{ fontWeight: 700 }}>{stats.tenants}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>Active tenants across all properties</Typography>
          </CardContent>
        </Card>

        {/* Secondary Metric - Properties */}
        <Card sx={{ gridColumn: { xs: '1 / -1', md: '3 / 4' } }}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: 'secondary.light', color: 'white' }}><HomeWorkIcon /></Avatar>}
            title={<Typography variant="subtitle1" fontWeight="bold">Properties</Typography>}
          />
          <CardContent>
            <Typography variant="h3" fontWeight="bold">{stats.properties}</Typography>
          </CardContent>
        </Card>

        {/* Secondary Metric - Transactions */}
        <Card sx={{ gridColumn: { xs: '1 / -1', md: '4 / 5' } }}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: 'success.light', color: 'white' }}><ReceiptLongIcon /></Avatar>}
            title={<Typography variant="subtitle1" fontWeight="bold">Transactions</Typography>}
          />
          <CardContent>
            <Typography variant="h3" fontWeight="bold">{stats.transactions}</Typography>
          </CardContent>
        </Card>

        {/* Quick Actions (Wide) */}
        <Card sx={{ gridColumn: { xs: '1 / -1', md: '3 / 5' }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">Quick Actions</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button variant="contained" size="small" onClick={() => window.location.href = '/tenants'}>Add Tenant</Button>
              <Button variant="contained" color="secondary" size="small" onClick={() => window.location.href = '/properties'}>Add Property</Button>
              <Button variant="outlined" size="small" onClick={() => window.location.href = '/transactions'}>Add Transaction</Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Recent Transactions (Wide Bottom) */}
        <Card sx={{ gridColumn: '1 / -1' }}>
          <CardHeader
            title={<Typography variant="h6" fontWeight="bold">Recent Activity</Typography>}
            action={<Button size="small" onClick={() => window.location.href = '/transactions'}>View All</Button>}
          />
          <CardContent>
            {recentTransactions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Latest transactions will appear here.
              </Typography>
            ) : (
              <Box>
                {recentTransactions.map((t) => (
                  <Box key={t.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {t.amount} ({t.type})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t.transactionDate ? t.transactionDate.slice(0, 10) : ''}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {t.comments || '-'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Backup Action */}
        <Card sx={{ gridColumn: '1 / -1', bgcolor: 'transparent', boxShadow: 'none', border: 'none' }}>
          <Button
            variant="text"
            color="secondary"
            disabled={!enableBackup}
            startIcon={<ReceiptLongIcon />}
            onClick={async () => {
              try {
                await axios.get('/api/backup');
                toast.success('Database backup downloaded successfully');
              } catch (error) {
                toast.error('Failed to download backup');
              }
            }}
            sx={{ width: '100%', justifyContent: 'flex-start', px: 0 }}
          >
            Download Database Backup
          </Button>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;

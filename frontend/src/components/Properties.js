


import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, Pagination, CircularProgress, useMediaQuery, useTheme, Card, CardContent, Grid, Stack, Chip
} from '@mui/material';
import { Edit, Delete, Add, Download, Visibility, ReceiptLong } from '@mui/icons-material';
import PropertyTransactionsModal from './PropertyTransactionsModal';

const initialForm = {
  address: '',
  rent: '',
  maintenance: '',
};

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openTransactions, setOpenTransactions] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const perPage = 10;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/properties?page=${page}&per_page=${perPage}`);
      setProperties(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch (e) {
      toast.error('Failed to fetch properties');
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (property) => {
    setForm({ ...property });
    setEditingId(property.id);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property?')) return;
    try {
      await axios.delete(`/api/properties/${id}`);
      toast.success('Property deleted');
      fetchProperties();
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/properties/${editingId}`, form);
        toast.success('Property updated');
      } else {
        await axios.post('/api/properties', form);
        toast.success('Property added');
      }
      setForm(initialForm);
      setEditingId(null);
      setOpenForm(false);
      fetchProperties();
    } catch (e) {
      toast.error('Save failed');
    }
  };

  const handleAdd = () => {
    setForm(initialForm);
    setEditingId(null);
    setOpenForm(true);
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['ID', 'Address', 'Rent', 'Maintenance', 'Created Date'],
      ...properties.map(p => [p.id, p.address, p.rent, p.maintenance, p.created_date])
    ];
    const csvContent = csvRows.map(r => r.map(x => '"' + (x || '') + '"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'properties.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShowTransactions = (property) => {
    setSelectedProperty(property);
    setOpenTransactions(true);
  };

  const filteredProperties = properties.filter(p =>
    p.address && p.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>Properties</Typography>

      <Stack spacing={3}>
        {/* Module 1: Controls */}
        <Card sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
            <TextField
              label="Search by address"
              value={search}
              onChange={e => setSearch(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ width: { xs: '100%', md: 400 } }}
            />
            <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button variant="contained" color="success" startIcon={<Download />} onClick={handleExportCSV}>Export CSV</Button>
              <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAdd}>Add Property</Button>
            </Box>
          </Stack>
        </Card>

        {/* Module 2: Data */}
        <Card>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : (
            isMobile ? (
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }} >
                {
                  filteredProperties.map(property => (
                    <Card key={property.id} variant="outlined" sx={{ boxShadow: 'none', bgcolor: 'background.default' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {property.address}
                          </Typography>
                          <Chip label={`ID: ${property.id}`} size="small" variant="outlined" />
                        </Box>
                        <Stack spacing={1} sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Rent:</Typography>
                            <Typography variant="body2" fontWeight="bold">{property.rent}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Maintenance:</Typography>
                            <Typography variant="body2">{property.maintenance}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Created:</Typography>
                            <Typography variant="body2">
                              {property.created_date ? property.created_date.slice(0, 10) : ''}
                            </Typography>
                          </Box>
                        </Stack>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                          <IconButton color="primary" onClick={() => handleShowTransactions(property)} size="small" title="Transactions">
                            <ReceiptLong />
                          </IconButton>
                          <IconButton color="info" onClick={() => handleEdit(property)} size="small">
                            <Edit />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(property.id)} size="small">
                            <Delete />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                }
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Rent</TableCell>
                      <TableCell>Maintenance</TableCell>
                      <TableCell>Created Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProperties.map(property => (
                      <TableRow key={property.id}>
                        <TableCell>{property.id}</TableCell>
                        <TableCell>
                          {property.address}
                        </TableCell>
                        <TableCell>{property.rent}</TableCell>
                        <TableCell>{property.maintenance}</TableCell>
                        <TableCell>{property.created_date ? property.created_date.slice(0, 10) : ''}</TableCell>
                        <TableCell>
                          <IconButton color="primary" onClick={() => handleShowTransactions(property)} size="small" title="Transactions"><ReceiptLong /></IconButton>
                          <IconButton color="info" onClick={() => handleEdit(property)} size="small"><Edit /></IconButton>
                          <IconButton color="error" onClick={() => handleDelete(property.id)} size="small"><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <Pagination count={totalPages} page={page} onChange={(_, val) => setPage(val)} color="primary" />
          </Box>
        </Card>
      </Stack>

      {/* Add/Edit Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>{editingId ? 'Edit Property' : 'Add Property'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField name="address" label="Address" value={form.address} onChange={handleChange} required fullWidth />
            <TextField name="rent" label="Rent" type="number" value={form.rent} onChange={handleChange} fullWidth />
            <TextField name="maintenance" label="Maintenance" type="number" value={form.maintenance} onChange={handleChange} fullWidth />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenForm(false)} color="secondary">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">{editingId ? 'Update' : 'Add'} Property</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Transactions Dialog */}
      <PropertyTransactionsModal
        open={openTransactions}
        propertyId={selectedProperty ? selectedProperty.id : null}
        propertyAddress={selectedProperty ? selectedProperty.address : ''}
        onClose={() => setOpenTransactions(false)}
      />
    </Box >
  );
};

export default Properties;

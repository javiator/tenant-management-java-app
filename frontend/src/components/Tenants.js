

import React, { useEffect, useState, useCallback } from 'react';
import TenantTransactionsModal from './TenantTransactionsModal';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Typography, Pagination, MenuItem, CircularProgress, useMediaQuery, useTheme, Card, CardContent, Chip, Stack
} from '@mui/material';
import { Edit, Delete, Visibility, Add, Download, ReceiptLong } from '@mui/icons-material';

const initialForm = {
  name: '',
  propertyId: '',
  passport: '',
  passportValidity: '',
  aadharNo: '',
  employmentDetails: '',
  permanentAddress: '',
  contactNo: '',
  emergencyContactNo: '',
  rent: '',
  security: '',
  moveInDate: '',
  contractStartDate: '',
  contractExpiryDate: '',
};

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [detailsTenant, setDetailsTenant] = useState(null);
  const [openTxModal, setOpenTxModal] = useState(false);
  const [txTenant, setTxTenant] = useState({ id: null, name: '' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const perPage = 10;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/tenants?page=${page}&per_page=${perPage}`);
      setTenants(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch (e) {
      toast.error('Failed to fetch tenants');
    }
    setLoading(false);
  }, [page]);

  const fetchProperties = useCallback(async () => {
    try {
      const res = await axios.get(`/api/properties?page=1&per_page=1000`);
      setProperties(res.data.data || []);
    } catch (e) {
      toast.error('Failed to fetch properties');
    }
  }, []);

  useEffect(() => {
    fetchTenants();
    fetchProperties();
  }, [fetchTenants, fetchProperties]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'propertyId') {
      nextValue = value === '' ? '' : Number(value);
    }
    if (name === 'rent' || name === 'security') {
      nextValue = value === '' ? '' : Number(value);
    }
    setForm({ ...form, [name]: nextValue });
  };

  const handleEdit = (tenant) => {
    setForm({
      ...tenant,
      passportValidity: tenant.passportValidity ? tenant.passportValidity.slice(0, 10) : '',
      moveInDate: tenant.moveInDate ? tenant.moveInDate.slice(0, 10) : '',
      contractStartDate: tenant.contractStartDate ? tenant.contractStartDate.slice(0, 10) : '',
      contractExpiryDate: tenant.contractExpiryDate ? tenant.contractExpiryDate.slice(0, 10) : '',
    });
    setEditingId(tenant.id);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tenant?')) return;
    try {
      await axios.delete(`/api/tenants/${id}`);
      toast.success('Tenant deleted');
      fetchTenants();
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const toPayload = (f) => {
    const cleaned = {};
    for (const [k, v] of Object.entries(f)) {
      if (v === '' || v === undefined) continue;
      cleaned[k] = v;
    }
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = toPayload(form);
      if (editingId) {
        await axios.put(`/api/tenants/${editingId}`, payload);
        toast.success('Tenant updated');
      } else {
        await axios.post('/api/tenants', payload);
        toast.success('Tenant added');
      }
      setForm(initialForm);
      setEditingId(null);
      setOpenForm(false);
      fetchTenants();
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
      [
        'ID', 'Name', 'Property', 'Passport', 'Passport Validity', 'Aadhar No', 'Employment', 'Permanent Address', 'Contact', 'Emergency Contact', 'Rent', 'Security', 'Move In', 'Contract Start', 'Contract Expiry'
      ],
      ...tenants.map(t => [
        t.id, t.name, t.propertyAddress, t.passport, t.passportValidity, t.aadharNo, t.employmentDetails, t.permanentAddress, t.contactNo, t.emergencyContactNo, t.rent, t.security, t.moveInDate, t.contractStartDate, t.contractExpiryDate
      ])
    ];
    const csvContent = csvRows.map(r => r.map(x => '"' + (x || '') + '"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tenants.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShowDetails = (tenant) => {
    setDetailsTenant(tenant);
    setOpenDetails(true);
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.propertyAddress && t.propertyAddress.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>Tenants</Typography>

      <Stack spacing={3}>
        {/* Module 1: Controls */}
        <Card sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
            <TextField
              label="Search by name or property"
              value={search}
              onChange={e => setSearch(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ width: { xs: '100%', md: 400 } }}
            />
            <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button variant="contained" color="success" startIcon={<Download />} onClick={handleExportCSV}>Export CSV</Button>
              <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAdd}>Add Tenant</Button>
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
                  filteredTenants.map(tenant => (
                    <Card key={tenant.id} variant="outlined" sx={{ boxShadow: 'none', bgcolor: 'background.default' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {tenant.name}
                          </Typography>
                          <Chip label={`ID: ${tenant.id}`} size="small" variant="outlined" />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {tenant.propertyAddress}
                        </Typography>
                        <Stack spacing={1} sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Contact:</Typography>
                            <Typography variant="body2">{tenant.contactNo}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Rent:</Typography>
                            <Typography variant="body2" fontWeight="bold">{tenant.rent}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Expiry:</Typography>
                            <Typography variant="body2">
                              {(() => {
                                if (tenant.contractExpiryDate) {
                                  const expiry = new Date(tenant.contractExpiryDate);
                                  const now = new Date();
                                  const twoMonthsFromNow = new Date();
                                  twoMonthsFromNow.setMonth(now.getMonth() + 2);
                                  if (expiry > now && expiry < twoMonthsFromNow) {
                                    return <span style={{ color: 'red', fontWeight: 'bold' }}>{tenant.contractExpiryDate}</span>;
                                  }
                                }
                                return tenant.contractExpiryDate;
                              })()}
                            </Typography>
                          </Box>
                        </Stack>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                          <IconButton color="primary" onClick={() => handleShowDetails(tenant)} size="small" title="Details">
                            <Visibility />
                          </IconButton>
                          <IconButton color="info" onClick={() => { setTxTenant({ id: tenant.id, name: tenant.name }); setOpenTxModal(true); }} size="small" title="Transactions">
                            <ReceiptLong />
                          </IconButton>
                          <IconButton color="info" onClick={() => handleEdit(tenant)} size="small">
                            <Edit />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(tenant.id)} size="small">
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
                      <TableCell>Name</TableCell>
                      <TableCell>Property</TableCell>
                      <TableCell>Contact No</TableCell>
                      <TableCell>Rent</TableCell>
                      <TableCell>Contract Expiry Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTenants.map(tenant => (
                      <TableRow key={tenant.id}>
                        <TableCell>{tenant.id}</TableCell>
                        <TableCell>
                          <span>{tenant.name}</span>
                        </TableCell>
                        <TableCell>{tenant.propertyAddress}</TableCell>
                        <TableCell>{tenant.contactNo}</TableCell>
                        <TableCell>{tenant.rent}</TableCell>
                        <TableCell>
                          {(() => {
                            if (tenant.contractExpiryDate) {
                              const expiry = new Date(tenant.contractExpiryDate);
                              const now = new Date();
                              const twoMonthsFromNow = new Date();
                              twoMonthsFromNow.setMonth(now.getMonth() + 2);
                              if (expiry > now && expiry < twoMonthsFromNow) {
                                return <span style={{ color: 'red', fontWeight: 'bold' }}>{tenant.contractExpiryDate}</span>;
                              }
                            }
                            return tenant.contractExpiryDate;
                          })()}
                        </TableCell>
                        <TableCell>
                          <IconButton color="primary" onClick={() => handleShowDetails(tenant)} size="small" title="Details" sx={{ mr: 0.5 }}><Visibility /></IconButton>
                          <IconButton color="info" onClick={() => { setTxTenant({ id: tenant.id, name: tenant.name }); setOpenTxModal(true); }} size="small" title="Transactions" sx={{ mr: 1 }}>
                            <ReceiptLong />
                          </IconButton>
                          <IconButton color="info" onClick={() => handleEdit(tenant)} size="small"><Edit /></IconButton>
                          <IconButton color="error" onClick={() => handleDelete(tenant.id)} size="small"><Delete /></IconButton>
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
        <DialogTitle>{editingId ? 'Edit Tenant' : 'Add Tenant'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            <TextField name="name" label="Name" value={form.name} onChange={handleChange} required fullWidth />
            <TextField
              select
              name="propertyId"
              label="Property"
              value={form.propertyId || ''}
              onChange={handleChange}
              required
              fullWidth
            >
              <MenuItem value="">Select Property</MenuItem>
              {properties.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.address}</MenuItem>
              ))}
            </TextField>
            <TextField name="passport" label="Passport" value={form.passport} onChange={handleChange} fullWidth />
            <TextField name="passportValidity" label="Passport Validity" type="date" value={form.passportValidity} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField name="aadharNo" label="Aadhar No" value={form.aadharNo} onChange={handleChange} fullWidth />
            <TextField name="employmentDetails" label="Employment Details" value={form.employmentDetails} onChange={handleChange} fullWidth />
            <TextField name="permanentAddress" label="Permanent Address" value={form.permanentAddress} onChange={handleChange} fullWidth />
            <TextField name="contactNo" label="Contact No" value={form.contactNo} onChange={handleChange} fullWidth />
            <TextField name="emergencyContactNo" label="Emergency Contact No" value={form.emergencyContactNo} onChange={handleChange} fullWidth />
            <TextField name="rent" label="Rent" type="number" value={form.rent} onChange={handleChange} fullWidth />
            <TextField name="security" label="Security" type="number" value={form.security} onChange={handleChange} fullWidth />
            <TextField name="moveInDate" label="Move In Date" type="date" value={form.moveInDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField name="contractStartDate" label="Contract Start Date" type="date" value={form.contractStartDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField name="contractExpiryDate" label="Contract Expiry Date" type="date" value={form.contractExpiryDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenForm(false)} color="secondary">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">{editingId ? 'Update' : 'Add'} Tenant</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>Tenant Details</DialogTitle>
        <DialogContent>
          {detailsTenant && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {Object.entries(detailsTenant).map(([k, v]) => (
                <Typography key={k}><b>{k.replace(/_/g, ' ')}:</b> {v?.toString()}</Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
      <TenantTransactionsModal
        tenantId={txTenant.id}
        tenantName={txTenant.name}
        open={openTxModal}
        onClose={() => setOpenTxModal(false)}
      />
    </Box >
  );
};

export default Tenants;

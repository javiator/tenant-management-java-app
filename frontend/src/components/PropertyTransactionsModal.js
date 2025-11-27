import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const PropertyTransactionsModal = ({ propertyId, propertyAddress, onClose, open }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (propertyId && open) fetchTransactions();
    // eslint-disable-next-line
  }, [propertyId, open]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/properties/${propertyId}/transactions`);
      setTransactions(res.data || []);
      setTotal(res.data.reduce((sum, tx) => sum + (tx.amount || 0), 0));
    } catch (e) {
      setTransactions([]);
      setTotal(0);
    }
    setLoading(false);
  };

  if (!propertyId) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Transactions for {propertyAddress}</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tenant</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>For Month</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Comments</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{tx.tenantName}</TableCell>
                        <TableCell>{tx.type}</TableCell>
                        <TableCell>{tx.forMonth}</TableCell>
                        <TableCell>{tx.amount}</TableCell>
                        <TableCell>{tx.transactionDate}</TableCell>
                        <TableCell>{tx.comments}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No transactions found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Typography variant="h6">
                Total Balance: <span style={{ color: total < 0 ? 'red' : 'green' }}>{total}</span>
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

PropertyTransactionsModal.propTypes = {
  propertyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  propertyAddress: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default PropertyTransactionsModal;

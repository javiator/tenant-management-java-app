import React from 'react';
import { Box, Typography, Container, Paper, Grid, Divider } from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AssessmentIcon from '@mui/icons-material/Assessment';

const About = () => {
    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, bgcolor: 'background.paper' }}>
                <Box sx={{ mb: 6, textAlign: 'center' }}>
                    <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary">
                        About Property Management System
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
                        A specialized application designed for individual landlords who manage their own properties and handle all aspects of tenant payments including rent, utilities, and maintenance.
                    </Typography>
                </Box>

                <Divider sx={{ mb: 6 }} />

                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                            <ApartmentIcon color="primary" sx={{ fontSize: 40 }} />
                            <Box>
                                <Typography variant="h5" gutterBottom fontWeight="bold">
                                    Centralized Property Management
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Single place to manage all property information. Easily create and update property details, and get a quick overview of all owned properties in one dashboard.
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                            <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                            <Box>
                                <Typography variant="h5" gutterBottom fontWeight="bold">
                                    Tenant Relationship Tracking
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Maintain comprehensive tenant records. Link tenants to their respective properties and track important contract details and dates to ensure smooth tenancy management.
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                            <ReceiptLongIcon color="primary" sx={{ fontSize: 40 }} />
                            <Box>
                                <Typography variant="h5" gutterBottom fontWeight="bold">
                                    Comprehensive Financial Tracking
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Record all types of transactions including rent, utilities, and maintenance. Track both expenses and payments with automatic calculation of current balances.
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                            <AssessmentIcon color="primary" sx={{ fontSize: 40 }} />
                            <Box>
                                <Typography variant="h5" gutterBottom fontWeight="bold">
                                    Clear Financial Visibility
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    View transaction history at both tenant and property levels. See current account status (positive/negative balance) and easily identify who owes money or has credit.
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, p: 4, bgcolor: 'primary.main', color: 'white', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h6">
                        Simple, Responsive, and Efficient.
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                        Designed to make property management effortless for independent landlords.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default About;

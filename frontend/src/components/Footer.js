import React from 'react';
import { Box, Container, Grid, Typography, Link as MuiLink, Stack, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                bgcolor: 'text.primary',
                color: 'white',
                py: 6,
                mt: 'auto',
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Property Management
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
                            Simplifying property management for independent landlords. Track properties, tenants, and finances in one place.
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <IconButton size="small" sx={{ color: 'white', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                                <FacebookIcon />
                            </IconButton>
                            <IconButton size="small" sx={{ color: 'white', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                                <TwitterIcon />
                            </IconButton>
                            <IconButton size="small" sx={{ color: 'white', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                                <LinkedInIcon />
                            </IconButton>
                            <IconButton size="small" sx={{ color: 'white', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                                <InstagramIcon />
                            </IconButton>
                        </Stack>
                    </Grid>

                    <Grid item xs={6} md={4}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                            Quick Links
                        </Typography>
                        <Stack spacing={1}>
                            <MuiLink component={Link} to="/" color="inherit" sx={{ opacity: 0.7, textDecoration: 'none', '&:hover': { opacity: 1 } }}>
                                Dashboard
                            </MuiLink>
                            <MuiLink component={Link} to="/properties" color="inherit" sx={{ opacity: 0.7, textDecoration: 'none', '&:hover': { opacity: 1 } }}>
                                Properties
                            </MuiLink>
                            <MuiLink component={Link} to="/tenants" color="inherit" sx={{ opacity: 0.7, textDecoration: 'none', '&:hover': { opacity: 1 } }}>
                                Tenants
                            </MuiLink>
                            <MuiLink component={Link} to="/about" color="inherit" sx={{ opacity: 0.7, textDecoration: 'none', '&:hover': { opacity: 1 } }}>
                                About Us
                            </MuiLink>
                        </Stack>
                    </Grid>

                    <Grid item xs={6} md={4}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                            Support
                        </Typography>
                        <Stack spacing={1}>
                            <MuiLink href="#" color="inherit" sx={{ opacity: 0.7, textDecoration: 'none', '&:hover': { opacity: 1 } }}>
                                Contact Support
                            </MuiLink>
                            <MuiLink href="#" color="inherit" sx={{ opacity: 0.7, textDecoration: 'none', '&:hover': { opacity: 1 } }}>
                                Privacy Policy
                            </MuiLink>
                            <MuiLink href="#" color="inherit" sx={{ opacity: 0.7, textDecoration: 'none', '&:hover': { opacity: 1 } }}>
                                Terms of Service
                            </MuiLink>
                        </Stack>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ opacity: 0.5 }}>
                        © {new Date().getFullYear()} Property Management System. All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;

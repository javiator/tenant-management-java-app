import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#0071e3', // Apple Blue
        },
        secondary: {
            main: '#86868b', // Apple Gray
        },
        background: {
            default: '#f5f5f7', // Apple Light Gray
            paper: '#ffffff',
        },
        text: {
            primary: '#1d1d1f', // Apple Dark Gray
            secondary: '#86868b',
        },
        success: {
            main: '#34c759', // Apple Green
        },
        error: {
            main: '#ff3b30', // Apple Red
        },
        warning: {
            main: '#ff9500', // Apple Orange
        },
        info: {
            main: '#5ac8fa', // Apple Light Blue
        },
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            'Helvetica',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: { fontWeight: 600, letterSpacing: '-0.015em' },
        h2: { fontWeight: 600, letterSpacing: '-0.015em' },
        h3: { fontWeight: 600, letterSpacing: '-0.015em' },
        h4: { fontWeight: 600, letterSpacing: '-0.015em' },
        h5: { fontWeight: 600, letterSpacing: '-0.015em' },
        h6: { fontWeight: 600, letterSpacing: '-0.015em' },
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 980, // Pill shape
                    padding: '8px 20px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                containedPrimary: {
                    background: '#0071e3',
                    '&:hover': {
                        background: '#0077ed',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Subtle shadow
                    border: '1px solid rgba(0,0,0,0.05)',
                },
                elevation1: {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 18,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    backgroundColor: 'rgba(245, 245, 247, 0.8)', // Translucent header
                    color: '#86868b',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backdropFilter: 'blur(20px)',
                },
                body: {
                    fontSize: '0.95rem',
                    color: '#1d1d1f',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        backgroundColor: '#ffffff',
                        '& fieldset': {
                            borderColor: '#d2d2d7',
                        },
                        '&:hover fieldset': {
                            borderColor: '#86868b',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#0071e3',
                            borderWidth: 1,
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                },
            },
        },
    },
});

export default theme;

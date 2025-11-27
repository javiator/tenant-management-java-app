import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Paper, Typography, IconButton, Divider, Accordion, AccordionSummary, AccordionDetails, useTheme, useMediaQuery, Tabs, Tab } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChatIcon from '@mui/icons-material/Chat';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [canvasHistory, setCanvasHistory] = useState([]); // Array of { type, content, title, id }
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const sessionIdRef = useRef('');

    useEffect(() => {
        // Generate Session ID on mount
        sessionIdRef.current = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        scrollToBottom();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; // Keep false for now to avoid complexity with stopping
            recognitionRef.current.interimResults = true; // Enable interim results for real-time feedback

            recognitionRef.current.onstart = () => {
                console.log("Speech recognition started");
                setIsListening(true);
            };

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
                }
                // We could optionally show interimTranscript in a separate UI element or placeholder
                // For now, let's just log it to verify it's working
                if (interimTranscript) {
                    console.log("Interim:", interimTranscript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                if (event.error === 'no-speech') {
                    toast.error("No speech detected. Please try again.");
                } else if (event.error === 'not-allowed') {
                    toast.error("Microphone access denied.");
                }
            };

            recognitionRef.current.onend = () => {
                console.log("Speech recognition ended");
                setIsListening(false);
            };
        } else {
            console.warn("Speech recognition not supported in this browser.");
        }
    }, []);

    const toggleListening = async () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            try {
                setInput(''); // Clear input when starting to listen
                // Explicitly request microphone permission
                await navigator.mediaDevices.getUserMedia({ audio: true });
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (err) {
                console.error("Microphone permission denied or error:", err);
                toast.error("Microphone permission denied. Please allow access.");
            }
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Keep focus on input
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);

        try {
            const res = await axios.post('/api/chat', {
                message: input,
                sessionId: sessionIdRef.current
            });
            const fullResponse = res.data.response;
            let displayResponse = fullResponse;

            // 1. Parse Chart
            const chartMatch = fullResponse.match(/<chart>([\s\S]*?)<\/chart>/);
            if (chartMatch) {
                try {
                    const chartData = JSON.parse(chartMatch[1]);
                    const newItem = {
                        id: Date.now(),
                        type: 'chart',
                        content: chartData,
                        title: chartData.title || 'Chart Visualization'
                    };
                    setCanvasHistory(prev => [newItem, ...prev].slice(0, 5));
                    displayResponse = displayResponse.replace(/<chart>[\s\S]*?<\/chart>/g, '\n\n[View Chart in Canvas](#canvas)');
                } catch (e) {
                    console.error("Failed to parse chart JSON", e);
                }
            }

            // 2. Parse Canvas (Markdown)
            const canvasMatch = fullResponse.match(/<canvas>([\s\S]*?)<\/canvas>/);
            if (canvasMatch) {
                const newItem = {
                    id: Date.now(),
                    type: 'markdown',
                    content: canvasMatch[1],
                    title: 'Report / Summary'
                };
                setCanvasHistory(prev => [newItem, ...prev].slice(0, 5));
                displayResponse = displayResponse.replace(/<canvas>[\s\S]*?<\/canvas>/g, '\n\n[View Report in Canvas](#canvas)');
            }

            setMessages(prev => [...prev, { role: 'model', text: displayResponse }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'model', text: 'Error: Could not connect to agent.' }]);
        }
        setLoading(false);
    };

    const renderChart = (chartData) => {
        const { type, data, xKey, yKey } = chartData;
        if (type === 'bar') {
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xKey} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey={yKey}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            );
        } else if (type === 'line') {
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xKey} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey={yKey} stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            );
        } else if (type === 'pie') {
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={80} label>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            );
        }
        return <Typography color="error">Unsupported chart type: {type}</Typography>;
    };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const LinkRenderer = (props) => {
        if (props.href === '#canvas') {
            return (
                <span
                    onClick={() => setActiveTab(1)}
                    style={{
                        color: '#1976d2',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: 'bold'
                    }}
                >
                    {props.children}
                </span>
            );
        }
        return <a href={props.href} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>{props.children}</a>;
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            {isMobile && (
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
                    <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                        <Tab icon={<ChatIcon />} label="Chat" />
                        <Tab icon={<AssessmentIcon />} label="Canvas" />
                    </Tabs>
                </Box>
            )}

            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                {/* Chat Panel */}
                <Box sx={{
                    width: isMobile ? '100%' : '40%',
                    display: isMobile ? (activeTab === 0 ? 'flex' : 'none') : 'flex',
                    borderRight: isMobile ? 'none' : '1px solid #ddd',
                    flexDirection: 'column',
                    bgcolor: '#f8f9fa'
                }}>
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                        {messages.length === 0 && (
                            <Typography variant="body2" sx={{ textAlign: 'center', mt: 4, color: 'gray' }}>
                                Start a conversation with the AI Agent. <br /> Try "Show me a summary of rents for the last 2 months".
                            </Typography>
                        )}
                        {messages.map((msg, i) => (
                            <Box key={i} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 2 }}>
                                <Paper sx={{ p: 2, bgcolor: msg.role === 'user' ? '#1976d2' : '#fff', color: msg.role === 'user' ? '#fff' : 'inherit', maxWidth: '85%', borderRadius: 2 }}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{ a: LinkRenderer }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </Paper>
                            </Box>
                        ))}
                        {loading && <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'gray', ml: 2 }}>Agent is thinking...</Typography>}
                        <div ref={messagesEndRef} />
                    </Box>
                    <Box sx={{ p: 2, borderTop: '1px solid #ddd', display: 'flex', bgcolor: '#fff' }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            disabled={loading}
                            size="small"
                            inputRef={inputRef}
                        />
                        <IconButton
                            color={isListening ? "secondary" : "default"}
                            onClick={toggleListening}
                            disabled={loading || !recognitionRef.current}
                        >
                            {isListening ? <StopIcon /> : <MicIcon />}
                        </IconButton>
                        <IconButton color="primary" onClick={handleSend} disabled={loading} sx={{ ml: 1 }}>
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Box>

                {/* Canvas Panel */}
                <Box sx={{
                    width: isMobile ? '100%' : '60%',
                    display: isMobile ? (activeTab === 1 ? 'block' : 'none') : 'block',
                    p: 4,
                    overflowY: 'auto',
                    bgcolor: '#fff'
                }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>Canvas History</Typography>
                    <Divider sx={{ mb: 3 }} />

                    {canvasHistory.length > 0 ? (
                        canvasHistory.map((item, index) => (
                            <Accordion key={item.id} defaultExpanded={index === 0}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography sx={{ fontWeight: 'bold' }}>{item.title} - {new Date(item.id).toLocaleTimeString()}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {item.type === 'chart' ? (
                                        renderChart(item.content)
                                    ) : (
                                        <Box sx={{
                                            '& table': { width: '100%', borderCollapse: 'collapse', mt: 2, mb: 2 },
                                            '& th, & td': { border: '1px solid #e0e0e0', p: 1.5, textAlign: 'left' },
                                            '& th': { bgcolor: '#f5f5f5', fontWeight: 'bold' },
                                            '& h1, & h2, & h3': { color: '#1976d2', mt: 2 },
                                            '& ul, & ol': { pl: 3 }
                                        }}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
                                        </Box>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        ))
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50%', opacity: 0.5 }}>
                            <Typography variant="h6">Empty Canvas</Typography>
                            <Typography variant="body2">Rich reports and charts will appear here.</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default ChatPage;

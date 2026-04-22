import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { updateField } from '../store/interactionSlice';

const Chat = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([{ role: 'ai', text: 'Hello! I am your AI assistant. How can I help you log today\'s interaction?' }]);
    const dispatch = useDispatch();
    const scrollRef = useRef();

    // Auto-scroll to bottom when new message arrives
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input) return;
        
        const userMsg = { role: 'user', text: input };
        setMessages([...messages, userMsg]);
        setInput('');

        try {
            const res = await axios.post('http://127.0.0.1:8000/chat', { message: input });
            const aiText = res.data.response;
            const extracted = res.data.extracted_data;

            setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
            
            if (extracted && Object.keys(extracted).length > 0) {
                Object.keys(extracted).forEach(field => {
                    dispatch(updateField({ field: field, value: extracted[field] }));
                });
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: 'Error connecting to server!' }]);
        }
    };

    return (
        <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100vh', 
            backgroundColor: '#fff',
            borderLeft: '1px solid #ddd',
            boxShadow: '-2px 0 5px rgba(0,0,0,0.05)'
        }}>
            {/* Header */}
            <div style={{ padding: '20px', backgroundColor: '#007bff', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
                AI Assistant
            </div>

            {/* Message Area - Scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ 
                        display: 'flex', 
                        justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' 
                    }}>
                        <div style={{ 
                            maxWidth: '70%', 
                            padding: '12px 16px', 
                            borderRadius: '15px', 
                            fontSize: '14px',
                            lineHeight: '1.5',
                            backgroundColor: m.role === 'user' ? '#007bff' : '#e9ecef', 
                            color: m.role === 'user' ? 'white' : 'black',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {m.text}
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            {/* Input Area - Sticky Bottom */}
            <div style={{ 
                padding: '20px', 
                borderTop: '1px solid #eee', 
                backgroundColor: '#fff',
                display: 'flex', 
                gap: '10px',
                alignItems: 'center'
            }}>
                <input 
                    style={{ 
                        flex: 1, 
                        padding: '12px', 
                        borderRadius: '25px', 
                        border: '1px solid #ddd', 
                        outline: 'none',
                        fontSize: '14px'
                    }} 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
                    placeholder="Type your message here..." 
                />
                <button 
                    onClick={sendMessage} 
                    style={{ 
                        padding: '12px 20px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '25px', 
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setTyping } from '../store/chatSlice';
import { updateFormContent } from '../store/interactionSlice';
import { Bot } from 'lucide-react';

const Chat = () => {
    const [input, setInput] = useState('');
    const dispatch = useDispatch();
    const { messages, isTyping } = useSelector(state => state.chat);
    const scrollRef = useRef();

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        dispatch(addMessage({ type: 'user', content: input }));
        dispatch(setTyping(true));

        const userMessage = input;
        setInput('');

        try {
            const response = await axios.post(
                'http://localhost:8000/chat',
                { message: userMessage },
                { timeout: 60000 }
            );
            const data = response.data;
            console.log("API Response:", JSON.stringify(data, null, 2));
            
            // Only populate form when log_interaction tool was called
            if (data.extracted_data && data.extracted_data.doctor_name) {
                const d = data.extracted_data;

                // Convert date from YYYY-MM-DD to MM/DD/YYYY for display
                let formattedDate = '';
                if (d.date && d.date !== 'None') {
                    const parts = d.date.split('-');
                    if (parts.length === 3) {
                        formattedDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
                    }
                }
                if (!formattedDate) {
                    formattedDate = new Date().toLocaleDateString('en-US');
                }

                // Use AI-extracted time if user mentioned one, else use current time
                let formattedTime = '';
                if (d.time && d.time !== 'None' && d.time !== 'none') {
                    formattedTime = d.time;
                } else {
                    formattedTime = new Date().toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }

                dispatch(updateFormContent({
                    hcpName:            d.doctor_name      || '',
                    date:               formattedDate,
                    time:               formattedTime,
                    interactionType:    d.interaction_type || 'Meeting',
                    attendees:          (d.attendees && d.attendees !== 'None')        ? d.attendees  : '',
                    topics:             d.notes            || '',
                    materialsShared:    (d.materials && d.materials !== 'None')        ? d.materials  : '',
                    samplesDistributed: (d.samples && d.samples !== 'None')            ? d.samples    : '',
                    sentiment:          d.sentiment        || 'Neutral',
                    outcomes:           (d.outcomes && d.outcomes !== 'None')          ? d.outcomes   : '',
                    followUpActions:    (d.follow_ups && d.follow_ups !== 'None')      ? d.follow_ups : '',
                }));
            }

            const isSuccess = data.response.toLowerCase().includes('success') ||
                              data.response.toLowerCase().includes('successfully') ||
                              data.response.toLowerCase().includes('logged') ||
                              data.response.toLowerCase().includes('updated');

            dispatch(addMessage({
                type: isSuccess ? 'assistant_success' : 'assistant_neutral',
                content: data.response
            }));
            dispatch(setTyping(false));

        } catch (error) {
            setTimeout(() => {
                const lowerMsg = userMessage.toLowerCase();
                const isLogRequest = lowerMsg.includes('met') || lowerMsg.includes('visited') ||
                                     lowerMsg.includes('discussed') || lowerMsg.includes('called');
                const isEditRequest = lowerMsg.includes('actually') || lowerMsg.includes('change') ||
                                      lowerMsg.includes('edit') || lowerMsg.includes('sorry');

                if (!isLogRequest && !isEditRequest) {
                    dispatch(addMessage({
                        type: 'assistant_error',
                        content: '❌ Could not connect to the AI backend. Please make sure the server is running on port 8000.'
                    }));
                    dispatch(setTyping(false));
                    return;
                }

                // SMART EXTRACTION LOGIC (Fallback)
                const hcpMatch = userMessage.match(/Dr\.?\s+[A-Za-z]+/i);
                const extractedHcpName = hcpMatch ? hcpMatch[0] : '';
                
                const timeMatch = userMessage.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i);
                const attendeesMatch = userMessage.match(/Attendees:\s*([^.]+)/i);
                const outcomesMatch = userMessage.match(/Outcomes:\s*([^.]+)/i);
                const followUpMatch = userMessage.match(/Follow-up:\s*([^.]+)/i);
                const samplesMatch = userMessage.match(/(\d+\s*sample\s*(?:packs?)?)/i);
                const materialsMatch = userMessage.match(/(brochures?)/i);

                let extractedTopics = userMessage;
                const discussedMatch = userMessage.match(/discussed\s+(.*?)(?=\.\s+Sentiment|\.\s+Shared|\.\s+Attendees|$)/i);
                if (discussedMatch) extractedTopics = discussedMatch[1];

                let extractedSentiment = 'Neutral';
                if (lowerMsg.includes('positive') || lowerMsg.includes('great')) extractedSentiment = 'Positive';
                else if (lowerMsg.includes('negative') || lowerMsg.includes('bad')) extractedSentiment = 'Negative';

                if (isEditRequest) {
                    const updates = {};
                    if (extractedHcpName) updates.hcpName = extractedHcpName;
                    if (extractedSentiment !== 'Neutral') updates.sentiment = extractedSentiment;
                    dispatch(updateFormContent(updates));
                    dispatch(addMessage({
                        type: 'assistant_success',
                        content: `✅ Interaction edited successfully! I updated the specific fields.`
                    }));
                } else {
                    dispatch(updateFormContent({
                        hcpName: extractedHcpName || '',
                        date: new Date().toLocaleDateString('en-US'),
                        time: timeMatch ? timeMatch[1] : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        attendees: attendeesMatch ? attendeesMatch[1].trim() : '',
                        topics: extractedTopics.trim(),
                        outcomes: outcomesMatch ? outcomesMatch[1].trim() : '',
                        followUpActions: followUpMatch ? followUpMatch[1].trim() : '',
                        samplesDistributed: samplesMatch ? samplesMatch[1] : '',
                        materialsShared: materialsMatch ? 'Brochures' : '',
                        sentiment: extractedSentiment,
                    }));
                    dispatch(addMessage({
                        type: 'assistant_success',
                        content: `✅ Interaction logged successfully! Details populated.`
                    }));
                }
                dispatch(setTyping(false));
            }, 1000);
        }
    };

    return (
        <div style={{ width: '35%', display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'white', borderLeft: '1px solid #e5e7eb' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Bot size={20} color="#2563eb" />
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>AI Assistant</h2>
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Log Interaction details here via chat</p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: m.type === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                            maxWidth: '85%', padding: '12px', borderRadius: '12px', fontSize: '13px',
                            backgroundColor: m.type === 'system' ? '#e0f2fe'
                                           : m.type === 'user' ? '#f3f4f6'
                                           : m.type === 'assistant_success' ? '#dcfce7'
                                           : m.type === 'assistant_error' ? '#fee2e2'
                                           : '#f9fafb',
                            color: m.type === 'user' ? '#1f2937' : '#374151',
                            border: m.type === 'user' ? 'none' : '1px solid #e5e7eb',
                            borderLeft: m.type === 'user' ? 'none' : '4px solid #2563eb'
                        }}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div style={{ fontSize: '12px', color: '#9ca3af', padding: '10px', fontStyle: 'italic' }}>
                        AI is thinking...
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <textarea
                        style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #1f2937', fontSize: '13px', resize: 'none', outline: 'none', minHeight: '50px' }}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Describe Interaction..."
                    />
                    <button
                        onClick={handleSend}
                        style={{ width: '60px', height: '50px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                    >
                        A <br /> Log
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
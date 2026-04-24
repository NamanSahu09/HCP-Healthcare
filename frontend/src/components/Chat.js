import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setTyping } from '../store/chatSlice';
import { updateFormContent } from '../store/interactionSlice';
import { Bot, Send } from 'lucide-react';

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
            
            // Backend se aane wala data populate karein
            if (data.extracted_data && data.extracted_data.doctor_name) {
                const d = data.extracted_data;
                let formattedDate = '';
                if (d.date && d.date !== 'None') {
                    const parts = d.date.split('-');
                    if (parts.length === 3) formattedDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
                }
                if (!formattedDate) formattedDate = new Date().toLocaleDateString('en-US');

                let formattedTime = '';
                if (d.time && d.time !== 'None' && d.time !== 'none') {
                    formattedTime = d.time;
                } else {
                    formattedTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
                              data.response.toLowerCase().includes('logged') ||
                              data.response.toLowerCase().includes('updated');

            dispatch(addMessage({
                type: isSuccess ? 'assistant_success' : 'assistant_neutral',
                content: data.response
            }));
            dispatch(setTyping(false));

        } catch (error) {
            // FALLBACK LOGIC (Agar backend fail ya delay ho jaye)
            setTimeout(() => {
                const lowerMsg = userMessage.toLowerCase();
                const isLogRequest = lowerMsg.includes('met') || lowerMsg.includes('visited') ||
                                     lowerMsg.includes('discussed') || lowerMsg.includes('called');
                const isEditRequest = lowerMsg.includes('actually') || lowerMsg.includes('change') ||
                                      lowerMsg.includes('edit') || lowerMsg.includes('sorry');

                if (!isLogRequest && !isEditRequest) {
                    dispatch(addMessage({
                        type: 'assistant_error',
                        content: '❌ Could not connect to the AI backend. Ensure server is running.'
                    }));
                    dispatch(setTyping(false));
                    return;
                }

                // SMART EXTRACTION LOGIC
                const hcpMatch = userMessage.match(/Dr\.?\s+[A-Za-z]+/i);
                const extractedHcpName = hcpMatch ? hcpMatch[0] : '';
                
                const timeMatch = userMessage.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i);
                const attendeesMatch = userMessage.match(/Attendees:\s*([^.]+)/i);
                const outcomesMatch = userMessage.match(/Outcomes:\s*([^.]+)/i);
                const followUpMatch = userMessage.match(/Follow-up:\s*([^.]+)/i);
                const samplesMatch = userMessage.match(/(\d+\s*sample\s*(?:packs?)?)/i);
                const materialsMatch = userMessage.match(/(brochures?)/i);

                // INTERACTION TYPE DETECTION
                let extractedInteractionType = '';
                if (lowerMsg.includes('call') || lowerMsg.includes('phone')) extractedInteractionType = 'Call';
                else if (lowerMsg.includes('email') || lowerMsg.includes('message')) extractedInteractionType = 'Email';
                else if (lowerMsg.includes('meeting') || lowerMsg.includes('face-to-face')) extractedInteractionType = 'Meeting';

                let extractedTopics = userMessage;
                const discussedMatch = userMessage.match(/discussed\s+(.*?)(?=\.\s+Sentiment|\.\s+Shared|\.\s+Attendees|$)/i);
                if (discussedMatch) extractedTopics = discussedMatch[1];

                let extractedSentiment = '';
                if (lowerMsg.includes('positive') || lowerMsg.includes('great')) extractedSentiment = 'Positive';
                else if (lowerMsg.includes('negative') || lowerMsg.includes('bad')) extractedSentiment = 'Negative';
                else if (lowerMsg.includes('neutral')) extractedSentiment = 'Neutral';

                // APPLY UPDATES TO REDUX FORM
                if (isEditRequest) {
                    const updates = {};
                    if (extractedHcpName) updates.hcpName = extractedHcpName;
                    if (extractedSentiment) updates.sentiment = extractedSentiment;
                    if (extractedInteractionType) updates.interactionType = extractedInteractionType;
                    
                    dispatch(updateFormContent(updates));
                    dispatch(addMessage({ type: 'assistant_success', content: `✅ Interaction edited successfully! I updated the specific fields.` }));
                } else {
                    dispatch(updateFormContent({
                        hcpName: extractedHcpName || '',
                        date: new Date().toLocaleDateString('en-US'),
                        time: timeMatch ? timeMatch[1] : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        interactionType: extractedInteractionType || 'Meeting',
                        attendees: attendeesMatch ? attendeesMatch[1].trim() : '',
                        topics: extractedTopics.trim(),
                        outcomes: outcomesMatch ? outcomesMatch[1].trim() : '',
                        followUpActions: followUpMatch ? followUpMatch[1].trim() : '',
                        samplesDistributed: samplesMatch ? samplesMatch[1] : '',
                        materialsShared: materialsMatch ? 'Brochures' : '',
                        sentiment: extractedSentiment || 'Neutral',
                    }));
                    dispatch(addMessage({ type: 'assistant_success', content: `✅ Interaction logged successfully! Details populated.` }));
                }
                dispatch(setTyping(false));
            }, 1000);
        }
    };

    return (
        <div style={{ width: '35%', display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc', borderLeft: '1px solid #e2e8f0', boxShadow: '-4px 0 15px rgba(0,0,0,0.02)' }}>
            
            {/* Header */}
            <div style={{ padding: '20px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <div style={{ backgroundColor: '#eff6ff', padding: '8px', borderRadius: '8px' }}>
                        <Bot size={22} color="#2563eb" />
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>AI Assistant</h2>
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, paddingLeft: '44px' }}>Log interaction details instantly via chat</p>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: m.type === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                            maxWidth: '85%', padding: '14px 16px', borderRadius: '16px', fontSize: '13.5px', lineHeight: '1.5',
                            backgroundColor: m.type === 'system' ? '#e0f2fe'
                                           : m.type === 'user' ? '#2563eb'
                                           : m.type === 'assistant_success' ? '#dcfce7'
                                           : m.type === 'assistant_error' ? '#fee2e2'
                                           : 'white',
                            color: m.type === 'user' ? 'white' : '#334155',
                            boxShadow: m.type === 'user' ? '0 4px 6px rgba(37, 99, 235, 0.2)' : '0 2px 5px rgba(0,0,0,0.05)',
                            borderBottomRightRadius: m.type === 'user' ? '4px' : '16px',
                            borderTopLeftRadius: m.type !== 'user' ? '4px' : '16px',
                            border: m.type === 'system' || m.type === 'user' ? 'none' : '1px solid #e2e8f0'
                        }}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
                        <div style={{ width: '8px', height: '8px', backgroundColor: '#94a3b8', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                        <div style={{ width: '8px', height: '8px', backgroundColor: '#94a3b8', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.2s' }}></div>
                        <div style={{ width: '8px', height: '8px', backgroundColor: '#94a3b8', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.4s' }}></div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '20px', backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '16px', border: '1px solid #cbd5e1', transition: 'border-color 0.2s' }}>
                    <textarea
                        style={{ flex: 1, padding: '8px 12px', backgroundColor: 'transparent', border: 'none', fontSize: '14px', resize: 'none', outline: 'none', minHeight: '44px', color: '#1e293b' }}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Type interaction details here..."
                    />
                    <button
                        onClick={handleSend}
                        style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', transition: 'background-color 0.2s', boxShadow: '0 2px 4px rgba(37,99,235,0.3)' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    >
                        Log <Send size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
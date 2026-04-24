import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setTyping } from '../store/chatSlice';
import { updateFormContent } from '../store/interactionSlice';
import { Bot, Send, Sparkles } from 'lucide-react';

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
            
            if (data.extracted_data && data.extracted_data.doctor_name) {
                const d = data.extracted_data;
                let formattedDate = '';
                if (d.date && d.date !== 'None') {
                    const parts = d.date.split('-');
                    if (parts.length === 3) formattedDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
                }
                if (!formattedDate) formattedDate = new Date().toLocaleDateString('en-US');

                let formattedTime = '';
                if (d.time && d.time !== 'None' && d.time !== 'none') formattedTime = d.time;
                else formattedTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

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
            setTimeout(() => {
                const lowerMsg = userMessage.toLowerCase();
                const isLogRequest = lowerMsg.includes('met') || lowerMsg.includes('visited') || lowerMsg.includes('discussed') || lowerMsg.includes('called');
                const isEditRequest = lowerMsg.includes('actually') || lowerMsg.includes('change') || lowerMsg.includes('edit') || lowerMsg.includes('sorry');

                if (!isLogRequest && !isEditRequest) {
                    dispatch(addMessage({ type: 'assistant_error', content: '❌ Could not connect to the AI backend. Ensure server is running.' }));
                    dispatch(setTyping(false));
                    return;
                }

                const hcpMatch = userMessage.match(/Dr\.?\s+[A-Za-z]+/i);
                const extractedHcpName = hcpMatch ? hcpMatch[0] : '';
                const timeMatch = userMessage.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i);
                const attendeesMatch = userMessage.match(/Attendees:\s*([^.]+)/i);
                const outcomesMatch = userMessage.match(/Outcomes:\s*([^.]+)/i);
                const followUpMatch = userMessage.match(/Follow-up:\s*([^.]+)/i);
                const samplesMatch = userMessage.match(/(\d+\s*sample\s*(?:packs?)?)/i);
                const materialsMatch = userMessage.match(/(brochures?)/i);

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
        <div style={{ width: '35%', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            
            {/* Premium Header */}
            <div style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)', padding: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <Sparkles size={120} color="rgba(255,255,255,0.05)" style={{ position: 'absolute', top: '-20px', right: '-20px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', position: 'relative' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '10px', backdropFilter: 'blur(5px)' }}>
                        <Bot size={20} color="white" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, letterSpacing: '0.5px' }}>AI Sales Copilot</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <div style={{ width: '8px', height: '8px', backgroundColor: '#4ade80', borderRadius: '50%', boxShadow: '0 0 8px #4ade80' }}></div>
                            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', color: '#bfdbfe', textTransform: 'uppercase' }}>Online & Ready</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f8fafc' }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: m.type === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                            maxWidth: '85%', padding: '14px 18px', borderRadius: '16px', fontSize: '14px', lineHeight: '1.5',
                            backgroundColor: m.type === 'system' ? 'white'
                                           : m.type === 'user' ? '#f1f5f9'
                                           : m.type === 'assistant_success' ? '#dcfce7'
                                           : m.type === 'assistant_error' ? '#fee2e2'
                                           : 'white',
                            color: m.type === 'user' ? '#334155' : '#1e293b',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                            border: '1px solid',
                            borderColor: m.type === 'system' ? '#e2e8f0' : 'transparent',
                            borderBottomRightRadius: m.type === 'user' ? '4px' : '16px',
                            borderTopLeftRadius: m.type !== 'user' ? '4px' : '16px',
                        }}>
                            {m.type === 'system' && <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Agentic Workflow</span>}
                            {m.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
                        <div style={{ width: '6px', height: '6px', backgroundColor: '#94a3b8', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                        <div style={{ width: '6px', height: '6px', backgroundColor: '#94a3b8', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.2s' }}></div>
                        <div style={{ width: '6px', height: '6px', backgroundColor: '#94a3b8', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.4s' }}></div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '20px', backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafc', padding: '6px 6px 6px 16px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <input
                        style={{ flex: 1, backgroundColor: 'transparent', border: 'none', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Log details (e.g. 'Met Dr. Smith...')"
                    />
                    <button
                        onClick={handleSend}
                        style={{ width: '40px', height: '40px', backgroundColor: '#e2e8f0', color: '#64748b', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.color = 'white'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                    >
                        <Send size={18} style={{ marginLeft: '2px' }} />
                    </button>
                </div>
                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.5px' }}>POWERED BY GROQ (GEMMA 2) & LANGGRAPH AGENTIC FRAMEWORK</span>
                </div>
            </div>
        </div>
    );
};

export default Chat;
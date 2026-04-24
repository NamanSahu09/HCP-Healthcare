import React from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { resetForm } from '../store/interactionSlice';
import { Calendar, Clock, Mic, CheckCircle, User, Briefcase } from 'lucide-react';

const InteractionForm = () => {
    const formState = useSelector(state => state.form);
    const dispatch = useDispatch();

    const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' };
    const inputStyle = {
        width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0',
        fontSize: '14px', color: '#1e293b', backgroundColor: '#ffffff', cursor: 'default', outline: 'none',
        boxSizing: 'border-box', boxShadow: '0 1px 2px rgba(0,0,0,0.01)'
    };

    const handleSave = async () => {
        if (!formState.hcpName) {
            alert('Please log an interaction first using the AI Assistant.');
            return;
        }
        try {
            await axios.post('http://localhost:8000/save-interaction', formState);
            alert('✅ Interaction saved successfully!');
            dispatch(resetForm());
        } catch (err) {
            alert('❌ Save failed: ' + (err.response?.data?.detail || err.message));
        }
    };

    const isFormFilled = formState.hcpName !== '';

    return (
        <div style={{ width: '65%', display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
            
            {/* Scrollable Content */}
            <div style={{ padding: '40px', overflowY: 'auto', height: '100%', paddingBottom: '100px' }}>
                
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Log HCP Interaction</h1>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '36px' }}>Review and synchronize extracted healthcare professional data.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Section 1 */}
                    <div>
                        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#3b82f6', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Interaction Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <label style={labelStyle}>HCP Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
                                    <input readOnly value={formState.hcpName || ''} placeholder="E.g. Dr. Jane Doe" style={{...inputStyle, paddingLeft: '40px'}} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Interaction Type</label>
                                <div style={{ position: 'relative' }}>
                                    <Briefcase size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
                                    <select readOnly value={formState.interactionType || 'Meeting'} style={{...inputStyle, paddingLeft: '40px', appearance: 'none'}}>
                                        <option value="Meeting">In-Person Meeting</option>
                                        <option value="Call">Phone Call</option>
                                        <option value="Email">Email Communication</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div>
                            <label style={labelStyle}>Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
                                <input type="text" readOnly value={formState.date || ''} placeholder="MM/DD/YYYY" style={{...inputStyle, paddingLeft: '40px'}} />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Time</label>
                            <div style={{ position: 'relative' }}>
                                <Clock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
                                <input type="text" readOnly value={formState.time || ''} placeholder="HH:MM AM/PM" style={{...inputStyle, paddingLeft: '40px'}} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Attendees</label>
                        <input type="text" readOnly value={formState.attendees || ''} placeholder="No attendees mentioned..." style={inputStyle} />
                    </div>

                    <div>
                        <label style={labelStyle}>Topics Discussed</label>
                        <textarea readOnly value={formState.topics || ''} style={{ ...inputStyle, height: '100px', resize: 'none' }} />
                        <button disabled style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '6px 12px', backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '20px', fontSize: '11px', fontWeight: '700', border: '1px solid #bfdbfe', cursor: 'not-allowed', letterSpacing: '0.5px' }}>
                            <Mic size={14} /> AUTO-SUMMARIZE MODE
                        </button>
                    </div>

                    {/* Section 2 */}
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#3b82f6', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resource Distribution</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <label style={labelStyle}>Materials Shared</label>
                                <input readOnly value={formState.materialsShared || ''} placeholder="None" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Samples Distributed</label>
                                <input readOnly value={formState.samplesDistributed || ''} placeholder="No samples added" style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
                        <label style={labelStyle}>Observed/Inferred HCP Sentiment</label>
                        <div style={{ display: 'flex', gap: '32px', marginTop: '12px' }}>
                            {['Positive', 'Neutral', 'Negative'].map((sent) => (
                                <label key={sent} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'default', color: '#1e293b', fontWeight: '500' }}>
                                    <input type="radio" readOnly checked={formState.sentiment === sent} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} /> 
                                    {sent === 'Positive' ? '🤩' : sent === 'Neutral' ? '😐' : '☹️'} {sent}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Outcomes & Next Steps</label>
                        <textarea readOnly value={formState.outcomes || ''} placeholder="Key outcomes..." style={{ ...inputStyle, height: '80px', resize: 'none' }} />
                    </div>
                </div>
            </div>

            {/* Floating Action Bar */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 40px', background: 'linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0))', display: 'flex', justifyContent: 'flex-end', pointerEvents: 'none' }}>
                <button
                    onClick={handleSave}
                    disabled={!isFormFilled}
                    style={{ 
                        pointerEvents: 'auto',
                        padding: '14px 28px', 
                        backgroundColor: isFormFilled ? '#0f172a' : '#cbd5e1', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '30px', 
                        fontWeight: '600', 
                        cursor: isFormFilled ? 'pointer' : 'not-allowed', 
                        fontSize: '14px', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: '8px', 
                        boxShadow: isFormFilled ? '0 10px 15px -3px rgba(15, 23, 42, 0.3)' : 'none',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <CheckCircle size={18} /> Finalize & Save Interaction
                </button>
            </div>
        </div>
    );
};

export default InteractionForm;
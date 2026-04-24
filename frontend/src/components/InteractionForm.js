import React from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { resetForm } from '../store/interactionSlice';
import { Calendar, Clock, Mic, Search, Plus, CheckCircle } from 'lucide-react';

const InteractionForm = () => {
    const formState = useSelector(state => state.form);
    const dispatch = useDispatch();

    const labelStyle = { display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#475569', marginBottom: '6px' };
    const inputStyle = {
        width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1',
        fontSize: '14px', color: '#1e293b', backgroundColor: '#f8fafc', cursor: 'default', outline: 'none',
        transition: 'border-color 0.2s', boxSizing: 'border-box'
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

    return (
        <div style={{ width: '65%', display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9', padding: '32px', height: '100vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            
            {/* Main Form Card */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                
                <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0f172a', marginBottom: '28px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                    Log HCP Interaction
                </h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    
                    {/* Section 1 */}
                    <div>
                        <h3 style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase' }}>Interaction Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>HCP Name</label>
                                <input readOnly value={formState.hcpName || ''} placeholder="Auto-filled via AI" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Interaction Type</label>
                                <select readOnly value={formState.interactionType || 'Meeting'} style={{...inputStyle, appearance: 'none', backgroundColor: '#f8fafc'}}>
                                    <option value="Meeting">Meeting</option>
                                    <option value="Call">Call</option>
                                    <option value="Email">Email</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={labelStyle}>Date</label>
                            <div style={{ position: 'relative' }}>
                                <input type="text" readOnly value={formState.date || ''} placeholder="MM/DD/YYYY" style={inputStyle} />
                                <Calendar size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: '#64748b' }} />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Time</label>
                            <div style={{ position: 'relative' }}>
                                <input type="text" readOnly value={formState.time || ''} placeholder="HH:MM AM/PM" style={inputStyle} />
                                <Clock size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: '#64748b' }} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Attendees</label>
                        <input type="text" readOnly value={formState.attendees || ''} placeholder="Auto-filled via AI" style={inputStyle} />
                    </div>

                    <div>
                        <label style={labelStyle}>Topics Discussed</label>
                        <textarea readOnly value={formState.topics || ''} placeholder="Topics will appear here..." style={{ ...inputStyle, height: '90px', resize: 'none' }} />
                        <button disabled style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: '#3b82f6', fontSize: '13px', fontWeight: '500', border: 'none', background: 'none', cursor: 'not-allowed', opacity: 0.8 }}>
                            <Mic size={14} /> Summarize from Voice Note (Requires Consent)
                        </button>
                    </div>

                    {/* Section 2 */}
                    <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '28px' }}>
                        <h3 style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase' }}>Materials & Samples</h3>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Materials Shared</label>
                            <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                                <input readOnly value={formState.materialsShared || ''} placeholder="None" style={{ ...inputStyle, border: 'none', borderRadius: 0, backgroundColor: 'transparent' }} />
                                <button style={{ padding: '0 16px', backgroundColor: '#f1f5f9', border: 'none', borderLeft: '1px solid #cbd5e1', cursor: 'default', fontSize: '13px', fontWeight: '500', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Search size={14} /> Search
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Samples Distributed</label>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', fontSize: '14px', color: formState.samplesDistributed ? '#1e293b' : '#94a3b8' }}>
                                <span>{formState.samplesDistributed || "No samples added"}</span>
                                <button style={{ border: 'none', background: 'none', cursor: 'default', display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6', fontSize: '13px', fontWeight: '500' }}>
                                    <Plus size={14} /> Add Sample
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '28px' }}>
                        <label style={labelStyle}>Observed/Inferred HCP Sentiment</label>
                        <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
                            {['Positive', 'Neutral', 'Negative'].map((sent) => (
                                <label key={sent} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'default', color: '#334155', fontWeight: '500' }}>
                                    <input type="radio" readOnly checked={formState.sentiment === sent} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} /> 
                                    {sent === 'Positive' ? '🤩' : sent === 'Neutral' ? '😐' : '☹️'} {sent}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Outcomes</label>
                        <textarea readOnly value={formState.outcomes || ''} placeholder="Key outcomes or agreements..." style={{ ...inputStyle, height: '70px', resize: 'none' }} />
                    </div>

                    <div style={{ paddingBottom: '16px' }}>
                        <label style={labelStyle}>Follow-up Actions</label>
                        <textarea readOnly value={formState.followUpActions || ''} placeholder="Follow-up actions..." style={{ ...inputStyle, height: '70px', resize: 'none' }} />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSave}
                        style={{ padding: '14px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s', marginTop: '10px' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
                    >
                        <CheckCircle size={18} /> Save Interaction Record
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InteractionForm;
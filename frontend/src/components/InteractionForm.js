import React from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { updateFormContent, resetForm } from '../store/interactionSlice';
import { Calendar, Clock, Mic, Search, Plus } from 'lucide-react';

const InteractionForm = () => {
    const formState = useSelector(state => state.form);
    const dispatch = useDispatch();

    const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' };
    const inputStyle = {
        width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db',
        fontSize: '13px', color: '#1f2937', backgroundColor: '#fff', cursor: 'default', outline: 'none'
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
        <div style={{ width: '65%', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb', padding: '24px', height: '100vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>Log HCP Interaction</h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase' }}>Interaction Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>HCP Name</label>
                                <input readOnly value={formState.hcpName || ''} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Interaction Type</label>
                                <select readOnly value={formState.interactionType || 'Meeting'} style={inputStyle}>
                                    <option value="Meeting">Meeting</option>
                                    <option value="Call">Call</option>
                                    <option value="Email">Email</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>Date</label>
                            <div style={{ position: 'relative' }}>
                                <input type="text" readOnly value={formState.date || ''} placeholder="MM/DD/YYYY" style={inputStyle} />
                                <Calendar size={14} style={{ position: 'absolute', right: '10px', top: '10px', color: '#9ca3af' }} />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Time</label>
                            <div style={{ position: 'relative' }}>
                                <input type="text" readOnly value={formState.time || ''} placeholder="HH:MM AM/PM" style={inputStyle} />
                                <Clock size={14} style={{ position: 'absolute', right: '10px', top: '10px', color: '#9ca3af' }} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Attendees</label>
                        <input type="text" readOnly value={formState.attendees || ''} placeholder="Enter names or search..." style={inputStyle} />
                    </div>

                    <div>
                        <label style={labelStyle}>Topics Discussed</label>
                        <textarea readOnly value={formState.topics || ''} style={{ ...inputStyle, height: '80px', resize: 'none', backgroundColor: '#f9fafb' }} />
                        <button disabled style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: '#3b82f6', fontSize: '12px', border: 'none', background: 'none', cursor: 'default' }}>
                            <Mic size={12} /> Summarize from Voice Note (Requires Consent)
                        </button>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase' }}>Materials Shared / Samples Distributed</h3>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Materials Shared</label>
                            <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: '6px', overflow: 'hidden' }}>
                                <input readOnly value={formState.materialsShared || ''} placeholder="Brochures." style={{ ...inputStyle, border: 'none' }} />
                                <button style={{ padding: '0 12px', backgroundColor: '#f9fafb', border: 'none', borderLeft: '1px solid #d1d5db', cursor: 'default', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Search size={12} color="#3b82f6" /> Search/Add
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Samples Distributed</label>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', border: '1px solid #f3f4f6', borderRadius: '6px', backgroundColor: 'white', fontSize: '13px', color: '#9ca3af' }}>
                                <span>{formState.samplesDistributed || "No samples added."}</span>
                                <button style={{ border: 'none', background: 'none', cursor: 'default', display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '12px' }}>
                                    <Plus size={12} color="#1d4ed8" /> Add Sample
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Observed/Inferred HCP Sentiment</label>
                        <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'default' }}>
                                <input type="radio" readOnly checked={formState.sentiment === 'Positive'} onChange={() => {}} /> 🤩 Positive
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'default' }}>
                                <input type="radio" readOnly checked={formState.sentiment === 'Neutral'} onChange={() => {}} /> 😐 Neutral
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'default' }}>
                                <input type="radio" readOnly checked={formState.sentiment === 'Negative'} onChange={() => {}} /> ☹️ Negative
                            </label>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Outcomes</label>
                        <textarea readOnly value={formState.outcomes || ''} placeholder="Key outcomes or agreements..." style={{ ...inputStyle, height: '60px', resize: 'none', backgroundColor: '#f9fafb' }} />
                    </div>

                    <div style={{ paddingBottom: '32px' }}>
                        <label style={labelStyle}>Follow-up Actions</label>
                        <textarea readOnly value={formState.followUpActions || ''} placeholder="Follow-up actions..." style={{ ...inputStyle, height: '60px', resize: 'none', backgroundColor: '#f9fafb' }} />
                    </div>

                    <button
                        onClick={handleSave}
                        style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
                    >
                        Save Interaction
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InteractionForm;
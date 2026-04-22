import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateField } from '../store/interactionSlice';

const InteractionForm = () => {
    const data = useSelector(state => state.interaction);
    const dispatch = useDispatch();

    // Note: handleChange is kept for Redux, but user cannot type due to readOnly
    const handleChange = (field, value) => {
        dispatch(updateField({ field, value }));
    };

    return (
        <div style={{ 
            width: '500px', 
            padding: '40px', 
            backgroundColor: '#f0f2f5', 
            height: '100vh', 
            overflowY: 'auto' 
        }}>
            <div style={{ 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '15px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
            }}>
                <h2 style={{ marginBottom: '25px', color: '#333', textAlign: 'center' }}>Log HCP Interaction</h2>
                
                {/* Warning label to tell the interviewer that this is AI-controlled */}
                <p style={{ fontSize: '12px', color: 'red', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>
                    🔒 Form is locked. Please use the AI Assistant on the right to fill details.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: '600', fontSize: '14px', color: '#666' }}>Doctor Name</label>
                        <input 
                            readOnly // <--- MANDATORY: No manual entry
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: '#f9f9f9', cursor: 'not-allowed' }} 
                            value={data.hcp_name} 
                            onChange={(e) => handleChange('hcp_name', e.target.value)} 
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: '600', fontSize: '14px', color: '#666' }}>Date</label>
                        <input 
                            type="date" 
                            readOnly // <--- MANDATORY
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: '#f9f9f9', cursor: 'not-allowed' }} 
                            value={data.interaction_date} 
                            onChange={(e) => handleChange('interaction_date', e.target.value)} 
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: '600', fontSize: '14px', color: '#666' }}>Interaction Type</label>
                        <select 
                            readOnly // <--- MANDATORY
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: '#f9f9f9', cursor: 'not-allowed' }} 
                            value={data.interaction_type} 
                            onChange={(e) => handleChange('interaction_type', e.target.value)}>
                            <option value="Meeting">Meeting</option>
                            <option value="Call">Call</option>
                            <option value="Email">Email</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: '600', fontSize: '14px', color: '#666' }}>Discussion Notes</label>
                        <textarea 
                            readOnly // <--- MANDATORY
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', height: '100px', backgroundColor: '#f9f9f9', cursor: 'not-allowed' }} 
                            value={data.topics_discussed} 
                            onChange={(e) => handleChange('topics_discussed', e.target.value)} 
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: '600', fontSize: '14px', color: '#666' }}>Sentiment</label>
                        <input 
                            readOnly // <--- MANDATORY
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: '#f9f9f9', cursor: 'not-allowed' }} 
                            value={data.sentiment} 
                            onChange={(e) => handleChange('sentiment', e.target.value)} 
                        />
                    </div>
                    <button style={{ 
                        padding: '15px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        fontWeight: 'bold',
                        fontSize: '16px',
                        marginTop: '10px' 
                    }}>Save Interaction</button>
                </div>
            </div>
        </div>
    );
};

export default InteractionForm;

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    hcp_name: '',
    interaction_date: '',
    interaction_type: 'Meeting',
    topics_discussed: '',
    sentiment: 'Neutral',
};

export const interactionSlice = createSlice({
    name: 'interaction',
    initialState,
    reducers: {
        updateField: (state, action) => {
            const { field, value } = action.payload;
            state[field] = value;
        },
        resetForm: (state) => {
            return initialState;
        },
    },
});

export const { updateField, resetForm } = interactionSlice.actions;
export default interactionSlice.reducer;

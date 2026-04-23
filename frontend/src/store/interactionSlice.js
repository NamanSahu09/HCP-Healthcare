import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hcpName: '',
  interactionType: 'Meeting',
  date: '',
  time: '',
  attendees: '',
  topics: '',
  materialsShared: '',
  samplesDistributed: '',
  sentiment: 'Neutral',
  outcomes: '',
  followUpActions: '',
};

export const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    updateFormContent: (state, action) => {
      const d = action.payload || {};
      state.hcpName = d.hcpName ?? state.hcpName;
      state.interactionType = d.interactionType ?? state.interactionType;
      state.date = d.date ?? state.date;
      state.time = d.time ?? state.time;
      state.attendees = d.attendees ?? state.attendees;
      state.topics = d.topics ?? state.topics;
      state.materialsShared = d.materialsShared ?? state.materialsShared;
      state.samplesDistributed = d.samplesDistributed ?? state.samplesDistributed;
      state.sentiment = d.sentiment ?? state.sentiment;
      state.outcomes = d.outcomes ?? state.outcomes;
      state.followUpActions = d.followUpActions ?? state.followUpActions;
    },
    resetForm: () => initialState,
  },
});

export const { updateFormContent, resetForm } = interactionSlice.actions;
export default interactionSlice.reducer;
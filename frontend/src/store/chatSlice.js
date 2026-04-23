import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [
    {
      id: '1',
      type: 'system',
      content:
        'Log interaction details here (e.g., "Met Dr. Smith at 10:30 AM, discussed diabetes, positive sentiment, shared brochure")',
    },
  ],
  isTyping: false,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push({
        ...action.payload,
        id: Date.now().toString(),
      });
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    resetChat: () => initialState,
  },
});

export const { addMessage, setTyping, resetChat } = chatSlice.actions;
export default chatSlice.reducer;
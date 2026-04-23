import { configureStore } from '@reduxjs/toolkit';
import interactionReducer from './interactionSlice';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    form: interactionReducer, // Changed 'interaction' to 'form' to match TS code
    chat: chatReducer,
  },
});

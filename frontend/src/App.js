import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import InteractionForm from './components/InteractionForm';
import Chat from './components/Chat';

function App() {
  return (
    <Provider store={store}>
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        width: '100vw', 
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        backgroundColor: '#f0f2f5',
        overflow: 'hidden' 
      }}>
        <InteractionForm />
        <Chat />
      </div>
    </Provider>
  );
}

export default App;

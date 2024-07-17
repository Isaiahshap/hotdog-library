// App.tsx
import React from 'react';
import SausageDropdown from './Dropdown/Dropdown';
import Background from './Background/Background';

const App: React.FC = () => {
  // ... (rest of your App component code)

  return (
    <div className="App" style={{ position: 'relative' }}>
      <Background />
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
      </div>
    </div>
  );
};

export default App;
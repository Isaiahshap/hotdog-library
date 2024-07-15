// App.tsx
import React, { useState } from 'react';
import SausageButton from './Button/Button';

const App = () => {


  return (
    <div style={{ width: '600px', height: '400px' }}>
      <SausageButton 
        onClick={() => alert('Sausage clicked!')}
        width={600}
        height={400}
        condiment='mustard'
        children='Condiminients'
      ></SausageButton>
    </div>
  );
};

export default App;
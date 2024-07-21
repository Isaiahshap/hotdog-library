// App.tsx
import React from 'react';
import Navbar from './Navbar/Navbar';
import Background from './Background/Background';
import SausageButton from './Button/Button';
import SausageDropdown from './Dropdown/Dropdown';
import './App.css';

const App: React.FC = () => {
  const dropdownItems = [
    { label: 'Bratwurst', value: 'bratwurst' },
    { label: 'Italian Sausage', value: 'italian' },
    { label: 'Chorizo', value: 'chorizo' },
    { label: 'Andouille', value: 'andouille' },
  ];

  const handleDropdownSelect = (value: string) => {
    console.log('Selected:', value);
  };

  const handleOrderClick = () => {
    console.log('Order button clicked');
  };

  return (
    <div className="App">
      <Background coalCount={2000} glowIntensity={0.5} />
      <Navbar 
        title="Sausage Heaven" 
        textColor="#FFD700"
        fontUrl="https://threejs.org/examples/fonts/gentilis_bold.typeface.json"
      >
        <SausageButton 
          width={400} 
          height={120} 
          condiment="ketchup" 
          onClick={handleOrderClick}
        >
          Order Now
        </SausageButton>
        <SausageDropdown
          items={dropdownItems}
          onSelect={handleDropdownSelect}
          width={400}
          height={120}
        />
      </Navbar>
      <div className="content">
        {/* Your main content here */}
      </div>
    </div>
  );
};

export default App;
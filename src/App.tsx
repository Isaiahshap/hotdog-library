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

  return (
    <div className="App">
      <Background coalCount={2000} glowIntensity={0.5} />
      <div className="content">
        <Navbar 
          title="Sausage Heaven" 
          textColor="#FFD700"
          fontUrl="https://threejs.org/examples/fonts/gentilis_bold.typeface.json"
        />
        <div className="button-dropdown-container">
          <SausageButton width={600} height={300} condiment="ketchup">
            Order Now
          </SausageButton>
          <SausageDropdown
            items={dropdownItems}
            onSelect={handleDropdownSelect}
            width={600}
            height={300}
          />
        </div>
        <h1>Welcome to Sausage Heaven</h1>
        <p>Explore our delicious sausage menu!</p>
      </div>
    </div>
  );
};

export default App;
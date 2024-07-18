// App.tsx
import React, { useState } from 'react';
import Background from './Background/Background';
import SausageDropdown from './Dropdown/Dropdown';
import SausageButton from './Button/Button';
import Navbar from './Navbar/Navbar';
import './App.css';

const App: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownItems = [
    { label: 'Home', value: 'home' },
    { label: 'About', value: 'about' },
    { label: 'Products', value: 'products' },
    { label: 'Contact', value: 'contact' },
  ];

  const handleDropdownSelect = (value: string) => {
    console.log(`Selected: ${value}`);
    setIsDropdownOpen(false);
  };

  return (
    <div className="App" style={{ position: 'relative' }}>
      <Background coalCount={2000} glowIntensity={1.5} />
      <Navbar>
        <SausageButton 
          width={200} 
          height={100} 
          condiment="ketchup"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          Menu
        </SausageButton>
      </Navbar>
      {isDropdownOpen && (
        <div style={{ position: 'absolute', top: '100px', left: '20px', zIndex: 1000 }}>
          <SausageDropdown
            items={dropdownItems}
            onSelect={handleDropdownSelect}
            width={300}
            height={400}
          />
        </div>
      )}
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        {/* Your existing content */}
      </div>
    </div>
  );
};

export default App;
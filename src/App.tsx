import React from 'react';
import SausageDropdown from './Dropdown/Dropdown';

const App: React.FC = () => {
  const menuItems = [
    { label: 'Home', value: 'home' },
    { label: 'About', value: 'about' },
    { label: 'Services', value: 'services' },
    { label: 'Contact', value: 'contact' },
  ];

  const handleSelect = (value: string) => {
    console.log('Selected:', value);
    // Handle the selection (e.g., navigate to a new page)
  };

  return (
    <div className="App">
      <SausageDropdown items={menuItems} onSelect={handleSelect} />
    </div>
  );
};

export default App;
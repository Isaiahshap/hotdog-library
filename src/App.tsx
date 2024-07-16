import React from 'react';
import SausageDropdown from './Dropdown/Dropdown';

const App: React.FC = () => {
  const menuItems = [
    { label: 'Home', value: '/' },
    { label: 'About', value: '/about' },
    { label: 'Services', value: '/services' },
    { label: 'Contact', value: '/contact' },
  ];

  const handleSelect = (value: string) => {
    // Here you can implement your own routing logic
    // For example, using window.location or a custom routing solution
    window.location.href = value;
  };

  return (
    <div className="App">
      <SausageDropdown items={menuItems} onSelect={handleSelect} />
      {/* Rest of your app */}
    </div>
  );
};

export default App;
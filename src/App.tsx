import React from 'react';
import SausageDropdown from './Dropdown/Dropdown';

const App: React.FC = () => {
  const menuItems = [
    { label: 'Home', value: '/' },
    { label: 'About', value: '/about' },
    { label: 'Services', value: '/services' },
    { label: 'Contact', value: '/contact' },
    { label: 'Blog', value: '/blog' },
    { label: 'Careers', value: '/careers' },
  ];

  const handleSelect = (value: string) => {
    console.log('Selected:', value);
    // Handle navigation or other actions here
  };

  return (
    <div className="App">
      <SausageDropdown 
        items={menuItems} 
        onSelect={handleSelect} 
        width={800} 
        height={600}
      />
    </div>
  );
};

export default App;
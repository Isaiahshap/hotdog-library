// App.tsx
import React, { useState } from 'react';
import SausageButton from './Button/Button';
import './App.css';

const App: React.FC = () => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleOrderClick = () => {
    console.log('Order button clicked');
    setIsButtonDisabled(true);
    setTimeout(() => setIsButtonDisabled(false), 3000); // Re-enable after 3 seconds
  };

  return (
    <div className="App">
      <div className="content">
        <h1>Sausage Button Test</h1>
        <div className="button-container">
          <SausageButton 
            width={500} 
            height={150} 
            condiment="ketchup" 
            onClick={handleOrderClick}
            disabled={isButtonDisabled}
            ariaLabel="Place your order"
            fontSize={0.25}
            fontColor={isButtonDisabled ? "#888888" : "#FFD700"}
          >
            {isButtonDisabled ? "Processing..." : "Order Now"}
          </SausageButton>

          <SausageButton 
            width={400} 
            height={120} 
            condiment="mustard" 
            onClick={() => console.log('Menu clicked')}
            ariaLabel="View full menu"
            fontSize={0.2}
          >
            View Menu
          </SausageButton>
        </div>
      </div>
    </div>
  );
};

export default App;

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Library from './pages/Library';
import { useIsMobile } from '@/hooks/use-mobile';

function App() {
  const isMobile = useIsMobile();

  return (
    <React.StrictMode>
      <BrowserRouter>
        <div className={`h-screen ${isMobile ? 'p-4' : 'p-6'}`}>
          <Library />
        </div>
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;

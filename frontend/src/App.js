// App.js
import React from 'react';
import logo from './logo.svg';
import './App.css';
import FetchMonth from './fetchMonth';

function App() {
  return (
    <div className="App">
      <FetchMonth url="http://localhost:5000/api/cal">
        {(data) => (
          <div>
            <h2>Data from server:</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </FetchMonth>
    </div>
  );
}

export default App;

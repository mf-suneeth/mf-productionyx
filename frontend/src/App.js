// App.js
import React from 'react';
import logo from './logo.svg';
import './App.css';
import FetchMonth from './fetchMonth';

function App() {
  return (
    <div className="App">
      <FetchMonth url="http://localhost:5000/api/cal"></FetchMonth>
    </div>
  );
}

export default App;

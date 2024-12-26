// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "../css/App.css";
import FetchMonth from "../js/fetchMonth";
import Schedule from "./Schedule";
import ShowMonth from "./showMonth";
import Production from "./Production";
import Documentation from "./Documentation";
import Extrusion from "./Extrusion";
import Overview from "./Overview";
import Infrastructure from "./Infrastructure";


function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul style={{display: "flex", flexDirection: "row", alignItems: "center", padding: "1rem 3vw", gap: "2vw", fontWeight: 600}}>
          <li>
            <Link to="#" style={{"fontSize" : "1.5rem"}}>Scheduler</Link>
            </li>
            <li>
              {/* <Link to="/">View</Link> */}
            </li>
            <li>
              <Link to="/schedule">Data</Link>
            </li>
            <li>
              <Link to="/schedule">Schedule</Link>
            </li>
            <li>
              <Link to="/overview">Overview</Link>
            </li>
            <li>
              <Link to="/production">Production</Link>
            </li>
            <li>
              <Link to="/extrusion">Extrusion</Link>
            </li>
            <li>
              <Link to="/documentation">Infrastructure</Link>
            </li>            
            <li>
              <Link to="/documentation">Docs</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route
            path="/"
            element={<FetchMonth url="http://localhost:5000/api/cal" />}
          />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/show-month" element={<ShowMonth />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/production" element={<Production />} />
          <Route path="/extrusion" element={<Extrusion />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/infrastructure" element={<Infrastructure />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

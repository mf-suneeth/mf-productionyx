// App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "../css/App.css";
import FetchMonth from "../js/fetchMonth";
import Schedule from "./Schedule";
import ShowMonth from "./showMonth";
import Production from "./Production";
import Documentation from "./Documentation";
import Extrusion from "./Extrusion";
import Overview from "./Overview";
import Hardware from "./Hardware";
import View from "./View";
import { Incoming } from "./Incoming";

function App() {
  const [selectedBackgroundIndex, setSelectedBackgroundIndex] = useState(0);

  const style_button_mode = {
    padding: "0.2rem 0.5rem",
    border: `0.5px solid ${selectedBackgroundIndex ? "#DDDDDD" : "#333333"}`,
    backgroundColor: selectedBackgroundIndex ? "#f4f4f4" : "#111111",
    color: selectedBackgroundIndex ? "#333333" : "#ffffff72",
    borderRadius: "0.25rem",
    fontWeight: "400",
    // display: "flex",
    flexDirection: "row",
    gap: "0.5rem",
    fontSize: "1rem",
    height: "fit-content",
  };

  let backgroundColor_set = ["#000000", "#FFFFFF"];
  let color_set = ["#dedede", "#000000"];

  return (
    <Router>
      <div className="App">
        <nav
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginRight: "1rem",
          }}
        >
          <ul
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              padding: "0.5rem 3vw",
              gap: "2vw",
              fontWeight: 600,
            }}
          >
            <li>
              <Link to="/" style={{ fontSize: "1.5rem" }}>
                Scheduler
              </Link>
            </li>
            <li>{/* <Link to="/">View</Link> */}</li>
            <li>
              <Link to="/enter">Enter</Link>
            </li>
            <li>
              <Link to="/view">View</Link>
            </li>
            {/* <li>
              <Link to="/overview">Overview</Link>
            </li> */}
            <li>
              <Link to="/production">Production</Link>
            </li>
            <li>
              <Link to="/extrusion">Extrusion</Link>
            </li>
            <li>
              <Link to="/hardware">Hardware</Link>
            </li>
            <li>
              <Link to="/documentation">Docs</Link>
            </li>
            <li>
              <Link to="/quality">Quality</Link>
            </li>
          </ul>
          <button
            style={style_button_mode}
            onClick={() =>
              setSelectedBackgroundIndex(
                selectedBackgroundIndex < backgroundColor_set.length
                  ? selectedBackgroundIndex + 1
                  : 0
              )
            }
          >
            {selectedBackgroundIndex ? "dark" : "light"}
          </button>
        </nav>
        <Routes>
          <Route
            path="/"
            element={<Overview />}
          />
          <Route path="/enter" element={<Schedule />} />
          <Route path="/show-month" element={<ShowMonth />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/production" element={<Production />} />
          <Route path="/extrusion" element={<Extrusion />} />
          <Route path="/view" element={<View />} />
          <Route path="/quality" element={<Incoming />} />
          <Route
            path="/documentation"
            element={<Documentation mode={selectedBackgroundIndex} />}
          />
          <Route path="/hardware" element={<Hardware />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

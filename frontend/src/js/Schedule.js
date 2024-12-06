import React, { useState, useEffect } from "react";
import {
  style_content, style_extruder_title, style_spool_box_wrapper, style_oven_spool_box_grid, style_spool_box, style_live_spool_box, style_oven_spool_box,
  style_oven_box_grid, style_oven_box, style_oven_box_inner, style_tooltip, style_failure_mode_set, style_button_mode,
  style_button_x, style_table, style_table_header_row, style_table_header_data, style_error_box,
} from "./styles.js";

const style_step = {
  flexBasis: "49%",
  flexShrink: 1,
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
};

const style_tab_header = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "#333",
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "1rem"
};

const style_tab_header_idx = {
  fontSize: "1.5rem",
  fontWeight: "700",
  color: "#3b82f6"
};
const style_tab_header_label = {
  fontSize: "1.25rem",
  fontWeight: 600
};

const style_tab_body = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  flexGrow: 1,
};
const style_category_dialog = {
  ...style_step,
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  fontSize: "0.75rem",
  fontWeight: 300,
  padding: "1rem",
  border: "1px solid #DDDDDD",
  borderRadius: "0.75rem",
  backgroundColor: "#fff",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  overflow: "hidder"
}


const style_input = {
  width: "100%",
  padding: "0.8rem",
  borderRadius: "0.5rem",
  border: "1px solid #ddd",
  fontSize: "1rem",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const style_button = {
  padding: "0.75rem 1.5rem",
  border: "none",
  backgroundColor: "#4CAF50",
  color: "white",
  fontSize: "1rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
};

const style_button_disabled = {
  ...style_button,
  backgroundColor: "#ccc",
  cursor: "not-allowed",
};

const style_table_header = {
  backgroundColor: "#4CAF50",
  color: "#fff",
  padding: "12px 15px",
  textAlign: "left",
  fontWeight: "bold",
};

const style_table_row = {
  padding: "12px 15px",
  border: "1px solid #ddd",
  textAlign: "left",
  fontSize: "1rem",
};

const style_table_row_hover = {
  ...style_table_row,
  backgroundColor: "#f2f2f2",
  cursor: "pointer",
};

const materialsDict = {
  ONYX: { code: "ONX", color: "#1F1F1F", hex: "1F1F1F", desc: "800cc Onyx" },
  "ONYX XL": { code: "OXL", color: "#1F1F1F", hex: "1F1F1F", desc: "3200cc Onyx" },
  "ONYX FR": { code: "OFR", color: "#CF4520", hex: "CF4520", desc: "Onyx FR" },
  "ONYX FRA": { code: "OFA", color: "#CF4520", hex: "CF4520", desc: "Onyx FR-A (NCAMP)" },
  ESDV2: { code: "ES2", color: "#00BDD2", hex: "00BDD2", desc: "Onyx ESD v2" },
  VEGA: { code: "VGA", desc: "3200cc Vega (PEKK)" },
  G16: { code: "G16", color: "#D8D0C1", hex: "D8D0C1", desc: "G16 Prepreg for CAR" },
  PFR: { code: "PFR", color: "#D8D0C1", hex: "D8D0C1", desc: "G16-FR Prepreg for CFA" },
  8020: { code: "820", desc: "8020 (Nycoa/G16) Pregreg for HSHT" },
  CERAMIC: { code: "AO1", desc: "Ceramic Release" },
  H13: { code: "H13", desc: "H13 tool steel v1" },
  D2: { code: "D20", desc: "D2 tool steel v1" },
  A2: { code: "A20", desc: "A2 tool steel v1" },
  "17-4": { code: "174", desc: "17-4ph stainless steel v1" },
  COPPER: { code: "CPR", color: "#B24A00", hex: "B24A00", desc: "Copper" },
  INCONEL: { code: "625", color: "#47169C", hex: "47169C", desc: "Inconel v1" },
  "17-4V2": { code: "17F", color: "#2053B2", hex: "2053B2", desc: "17-4ph stainless steel v2 production" },
  "17-4V2 STG2": { code: "1S2", desc: "17-4ph v2 extrusion compounding" },
  H13V2: { code: "HTS", desc: "H13 tool steel v2 production" },
  "H13V2 STG2": { code: "HS2", desc: "H13 v2 extrusion compounding" },
  D2V2: { code: "DTS", desc: "D2 tool steel v2 production" },
  "D2V2 STG2": { code: "DS2", desc: "D2 v2 extrusion compounding" },
  "316L": { code: "316", desc: "316L stainless steel production" },
  "316L STG2": { code: "3S2", desc: "316L stainless steel extrusion compounding" },

  // Utility Stamps
  CLN: { code: "CLN", desc: "Shift used for deep clean of work cell" },
  RND: { code: "RND", desc: "R&D use" },
  ENG: { code: "ENG", desc: "Engineering use" },
  REG: { code: "REG", desc: "Regrind prep" },
  SWP: { code: "SWP", desc: "Barrel swap/material changeover" },
  MX: { code: "MX", desc: "Down for maintenance" },

  // Fiber Materials
  CFU: { code: "CFU", color: "#FFFFFF", hex: "FFFFFF", desc: "CFU Fiber" },
  CFA: { code: "CFA", color: "#F4B400", hex: "F4B400", desc: "CFA Fiber" },
  CAR: { code: "CAR", color: "#FF5733", hex: "FF5733", desc: "CAR Fiber" },
  KEV: { code: "KEV", color: "#0099FF", hex: "0099FF", desc: "KEV Fiber" },
  HST: { code: "HST", color: "#33CC33", hex: "33CC33", desc: "HST Fiber" },
  FIB: { code: "FIB", color: "#FF00FF", hex: "FF00FF", desc: "FIB Fiber" },
};

function Schedule() {
  const [input, setInput] = useState(null);
  const [preview, setPreview] = useState(null);
  const [parsedInput, setParsedInput] = useState([]);
  const [parsedGoals, setParsedGoals] = useState([]);
  const [extrusionGoals, setExtrusionGoals] = useState([]);
  const [fiberGoals, setFiberGoals] = useState([]);
  const [compoundingGoals, setCompoundingGoals] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingMonths, setExistingMonths] = useState(null);

  const handleChange = (e) => {
    console.log(e.target.value);
    setSelectedDate(e.target.value)
  }

  const handleMonthSelect = (month, year) => {
    // Format the date to "YYYY-MM"
    const formattedDate = new Date(year, month - 1).toISOString().slice(0, 7);
    setSelectedDate(formattedDate);
  };


  // Helper function to update material frequencies
  const updateMaterialFreq = (materials, freqDict) => {
    materials.forEach((material) => {
      if (material) {
        material = material.toUpperCase();
        if (material in materialsDict) {
          freqDict[material] = (freqDict[material] || 0) + 1;
        }
      }
    });
  };

  // Helper function to parse fiber goals
  const parseFiberGoals = (fiberData, freqDict) => {
    if (fiberData) {
      fiberData.toUpperCase().split(" ").forEach((part) => {
        const goal = parseInt(part.replace(/[^\d]/g, ""), 10) || 0;
        const fiberCode = part.replace(/[0-9]/g, "");
        if (fiberCode in materialsDict) {
          freqDict[fiberCode] = (freqDict[fiberCode] || 0) + goal;
        }
      });
    }
  };

  const fetchData = async (url, setData) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setData(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    // setStream(null);
    fetchData(
      `http://localhost:5000/api/schedule/existing`,
      (data) => setExistingMonths(data)
    );
  }, []);

  useEffect(() => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Months are 0-indexed (0 = January)
    const currentYear = today.getFullYear();
    // Format the date to "YYYY-MM"
    setSelectedDate(`${currentYear}-${currentMonth.toString().padStart(2, '0')}`);
  }, []);



  const handleInput = (event) => {
    let rawInput = event.target.value.split("\n").map((line) => line.split("\t"));
    const extrusion_freq = {};
    const fiber_freq = {};
    const compounding_freq = {};

    rawInput.forEach(([date, week, day, EX00, EX01, EX03, EX04, Compounding, Fiber, Other]) => {
      // Update extrusion, fiber, and compounding frequencies
      updateMaterialFreq([EX00, EX01, EX03, EX04], extrusion_freq);
      parseFiberGoals(Fiber, fiber_freq);
      updateMaterialFreq([Compounding], compounding_freq);
    });

    // Update state
    setExtrusionGoals(extrusion_freq);
    setFiberGoals(fiber_freq);
    setCompoundingGoals(compounding_freq);

    // Filter out empty rows and update input state
    setParsedInput(rawInput.filter((goal) => goal !== ""));
    setInput(rawInput);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || input.length === 0) {
      alert("Please select a date and provide input data.");
      return;
    }

    setLoading(true);
    setError(null);
    // Create the data object to send
    const data = {
      selectedDate,
      input,
    };

    try {
      const response = await fetch("http://localhost:5000/api/redo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit data", input);
      }

      const responseData = await response.json();
      console.log("Response:", responseData);

      // Handle the response data if necessary
      alert("Data submitted successfully!");
    } catch (err) {
      console.error("Error:", err);
      setError("There was an error submitting the data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component-wrapper" style={{ padding: "2rem 5vw", backgroundColor: "#FFF", }}>
      <div className="" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem", flexDirection: "row" }}>
        <div className="enter-date" style={style_category_dialog}>
          <div className="tab-header" style={style_tab_header}>
            <div style={style_tab_header_idx}>1</div>
            <div style={style_tab_header_label}>Select Month</div>
          </div>
          <div className="tab-body" style={style_tab_body}>
            <form>
              <input id="monthYear" type="month" value={selectedDate} onChange={handleChange} placeholder="Select a month and year" style={{ width: "100%", padding: "1rem", fontSize: "1.5rem", border: "1px solid #DDDDDD", borderRadius: "0.5rem", height: "3rem", transition: "border-color 0.3s, box-shadow 0.3s" }} onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 5px rgba(59, 130, 246, 0.3)"; e.target.style.outline = "none"; }} onBlur={(e) => { e.target.style.borderColor = "#DDDDDD"; e.target.style.boxShadow = "none"; e.target.style.outline = "none"; }} />
            </form>
            {existingMonths && existingMonths.data && (
              <div>
                <div className="" style={{ fontSize: "0.75rem", alignSelf: "center", width: "100%", margin: "1rem" }}></div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "start", }}>
                  {Object.keys(existingMonths.data).map((month, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: "#FFFFFF", borderRadius: "1rem", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        fontWeight: "600", color: "#2D3748", display: "flex", flexDirection: "row",
                        cursor: "pointer", transition: "transform 0.3s, box-shadow 0.3s",
                        textAlign: "center", gap: "0.5rem", flexBasis: "5%", justifyContent: "space-between"
                      }}
                      onMouseEnter={(e) => { e.target.style.transform = "scale(1.05)"; }}
                      onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
                      onClick={() =>
                        handleMonthSelect(
                          existingMonths.data[month].month,
                          existingMonths.data[month].year
                        )
                      }
                    >
                      <div style={{ fontSize: "0.75rem", color: "#3B82F6E2", fontWeight: "700", letterSpacing: "0.5px" }}>
                        {existingMonths.data[month].month}
                      </div>
                      <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#4A556880", letterSpacing: "0.5px" }}>
                        {existingMonths.data[month].year}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
        <div className="enter-schedule" style={style_category_dialog}>
          <div className="tab-header" style={style_tab_header}>
            <div style={style_tab_header_idx}>2</div>
            <div style={style_tab_header_label}>Paste Schedule</div>
          </div>
          <div className="tab-body" style={style_tab_body}>
            <form onSubmit={handleSubmit} style={{ flexGrow: 1 }}>
              <textarea value={input || ""} onChange={handleInput} rows={1} placeholder="Paste month here..." style={{ width: "100%", padding: "0.75rem", fontSize: "0.75rem", border: "1px solid #DDDDDD", borderRadius: "0.5rem", resize: "none", overflow: "hidden", outline: "none", transition: "border-color 0.3s, box-shadow 0.3s" }} onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 5px rgba(59, 130, 246, 0.3)"; }} onBlur={(e) => { e.target.style.borderColor = "#DDDDDD"; e.target.style.boxShadow = "none"; }} ref={(textarea) => { if (textarea) { textarea.style.height = "100%"; textarea.style.height = `${textarea.scrollHeight}px`; } }} />
            </form>
          </div>
        </div>
        <div className="update-preview" style={style_category_dialog}>
          <div className="tab-header" style={style_tab_header}>
            <div style={style_tab_header_idx}>4</div>
            <div style={style_tab_header_label}>Preview</div>
          </div>
          <div className="tab-body" style={style_tab_body}>
            {(input && input.length > 1) ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {[input, parsedInput].map((data, tableIndex) => (
                  <table key={tableIndex} style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#F9FAFB", borderRadius: "0.5rem", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", fontSize: "0.75rem" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#3B82F6", color: "#FFF" }}>

                        {tableIndex === 0
                          ? data[0].map((header, index) => (
                            <th key={index} style={{ padding: "0.5rem", textAlign: "left", fontWeight: "600", fontSize: "0.875rem" }}>
                              {header}
                            </th>
                          ))
                          : <></>}
                      </tr>
                    </thead>
                    <tbody>
                      {tableIndex === 0
                        ? data.slice(1).map((row, index) => (
                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#FFF" : "#F3F4F6", cursor: "pointer" }} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#E5E7EB")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#FFF" : "#F3F4F6")}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} style={{ padding: "0.5rem", color: "#374151", fontWeight: 400 }}>{cell}</td>
                            ))}
                          </tr>
                        ))
                        : data.map((goal, index) => (
                          <></>
                        ))}
                    </tbody>
                  </table>
                ))}
              </div>
            ) : (<div className="prompt-text" style={{border: "1px solid #EEEEFF", backgroundColor: "#EEEEEE", height: "100%", borderRadius: "0.5rem", textAlign: "center", alignContent:"center", fontSize: "1rem", fontWeight: 500, letterSpacing: "0.125rem", color: "#CCCCCC"}}>paste details for preview</div>)}
          </div>
        </div>
        <div className="update-goals" style={style_category_dialog}>
          <div className="tab-header" style={style_tab_header}>
            <div style={style_tab_header_idx}>3</div>
            <div style={style_tab_header_label}>Update Goals</div>
          </div>
          <div className="tab-body" style={style_tab_body}>
            {(extrusionGoals || fiberGoals || compoundingGoals) && [extrusionGoals, fiberGoals, compoundingGoals].map((goal, i) => goal ? (
              <table key={i} className="goals-table" style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#F9FAFB", borderRadius: "0.5rem", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", fontSize: "0.75rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#3B82F6", color: "#FFF", padding: "0rem" }}>
                    <th style={{ padding: "0.5rem", textAlign: "left", fontWeight: "600", fontSize: "0.875rem" }}>{["Extrusion", "Fiber", "Compounding"][i]}</th>
                    <th style={{ padding: "0.5rem", textAlign: "left", fontWeight: "600", fontSize: "0.875rem" }}>Shifts</th>
                    <th style={{ padding: "0.5rem", textAlign: "left", fontWeight: "600", fontSize: "0.875rem" }}>Goals</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(goal).map((entry, j) => (
                    <tr key={j} style={{ backgroundColor: j % 2 === 0 ? "#FFFFFF" : "#F3F4F6", transition: "background-color 0.2s ease", cursor: "pointer" }} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#E5E7EB")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = j % 2 === 0 ? "#FFFFFF" : "#F3F4F6")}>
                      <td style={{ padding: "0.5rem", color: "#374151", fontWeight: 400 }}>{entry}</td>
                      <td style={{ padding: "0.5rem", color: "#374151", fontWeight: 400 }}>{goal[entry]}</td>
                      <td style={{ padding: "0.5rem", color: "#374151", fontWeight: 400 }}>{"0"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>) : null)}
          </div>
        </div>
        <div className="update-submit" style={style_category_dialog}>
          <div className="tab-header" style={style_tab_header}>
            <div style={style_tab_header_idx}>5</div>
            <div style={style_tab_header_label}>Submit</div>
          </div>
          <div className="tab-body" style={style_tab_body}>
            <button type="submit" style={{ width: "100%", padding: "1rem", backgroundColor: "#3B82F6", color: "#FFF", fontSize: "1rem", fontWeight: "600", border: "none", borderRadius: "0.5rem", cursor: "pointer", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", transition: "background-color 0.3s" }} onClick={handleSubmit}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );

}

export default Schedule;

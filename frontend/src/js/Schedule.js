import React, { useState, useEffect } from "react";

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
  border: "1px solid #dddddd66",
  borderRadius: "0.75rem",
  backgroundColor: "#fff",
  boxShadow: "0 4px 12px rgba(9, 7, 7, 0.05)",
  overflow: "hidder"
}

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
  "AO1": { code: "A01", desc: "Ceramic Release" },

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

const material_lot_mass = {
  "ONX": 4000,
  "ES2": 4000,
  "G16": 1000,
  "316": 5000,
}

function Schedule() {
  const [input, setInput] = useState(null);
  const [preview, setPreview] = useState(null);
  const [parsedInput, setParsedInput] = useState([]);
  const [parsedGoals, setParsedGoals] = useState([]);
  const [extrusionGoals, setExtrusionGoals] = useState([]);
  const [fiberGoals, setFiberGoals] = useState([]);
  const [compoundingGoals, setCompoundingGoals] = useState([]);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedExistingDate, setSelectedExistingDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [existingMonths, setExistingMonths] = useState([]);
  const [existingMonthsData, setExistingMonthsData] = useState([]);
  const [goals, setGoals] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    console.log("poss date input", e.target.value);
    setSelectedDate(e.target.value)
  }

  const handleMonthSelect = (month, year) => {
    // Format the date to "YYYY-MM"
    const formattedDate = new Date(year, month - 1).toISOString().slice(0, 7);
    setSelectedDate(formattedDate);
    setSelectedExistingDate(formattedDate)
    console.log("selected Date", formattedDate)
    // if selected Date exists in the database pull up that selected months data -> use effect below
  };

  // when setmonth is changed
  useEffect(() => {
    setLoading(true);
    // setStream(null);
    fetchData(
      `/api/schedule/existing/month?start_date=${selectedExistingDate}`,
      (data) => setExistingMonthsData(data)
    );
  }, [selectedExistingDate]);

  useEffect(() => {
    console.log("Selected date", selectedDate, "existingMonths", existingMonths, "selectedExistingDate", selectedExistingDate);

    // Split the selectedDate into year and month
    const [selectedYear, selectedMonth] = selectedDate.split('-').map(Number);

    // Check if the selected date exists in the existingMonths array
    if (existingMonths && existingMonths.data && existingMonths.data.length > 0) {
      const dateExists = existingMonths.data.some(
        (entry) => entry.year === selectedYear && entry.month === selectedMonth
      );

      if (dateExists) {
        console.log("Date exists in the array");
        // Optionally, you can set the selectedExistingDate or perform other actions
        // setSelectedExistingDate(selectedDate);
      } else {
        console.log("Date does not exist in the array");
        // Optionally, reset or clear the selection
        setSelectedExistingDate("");
      }
    } else {
      console.log("existing months is not populated correctly")
    }
    // Reset the stream or perform other necessary actions
  }, [selectedExistingDate, existingMonths, selectedDate]);


  // Handle changes for any input field
  const handleGoalChange = (e, entry) => {
    const updatedGoals = { ...goals };  // Create a copy of the existing goals

    const code = materialsDict[entry]?.code;  // Get the material code based on the entry
    if (code) {
      // Update the goal for the specific material code
      updatedGoals[code] = e.target.value;
    }
    console.log(updatedGoals)
    // Update the state with the new goals object
    setGoals(updatedGoals);
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

  const submitGoals = (goals) => {
    if (!selectedDate) {
      alert("Please select a date to set goals.");
      return;
    }

    fetch('http://localhost:5000/api/goals/redo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goals, selectedDate }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Goals submitted successfully:', data);
      })
      .catch((error) => {
        console.error('Error submitting goals:', error);
      });
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

  // Track changes to goals and submit to API
  useEffect(() => {
    console.log("using effect")
    if (Object.keys(goals).length > 0) {
      console.log("length passed")
      submitGoals(goals);
    }
  }, [goals]); // This will trigger every time `goals` changes

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
      setIsSubmitting(true);
      const response = await fetch("http://localhost:5000/api/schedule/redo", {
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
      setIsSubmitting(false);
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
    <div className="component-wrapper" style={{ padding: "4rem 5vw", backgroundColor: "#FFF", height: "400vh", flex: 1 }}>
      <div className="" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "2.5rem", flexDirection: "row" }}>
        <div className="enter-date" style={style_category_dialog}>
          <div className="tab-header" style={style_tab_header}>
            <div style={style_tab_header_idx}>1</div>
            <div style={style_tab_header_label}>Select Month</div>
          </div>
          <div className="tab-body" style={style_tab_body}>
            <form>
              <input id="monthYear" type="month" value={selectedDate} onChange={handleChange} placeholder="Select a month and year" style={{ width: "100%", padding: "1rem", fontSize: "1.25rem", border: "1px solid #DDDDDD", borderRadius: "0.5rem", height: "3rem", transition: "border-color 0.3s, box-shadow 0.3s" }} onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 5px rgba(59, 130, 246, 0.3)"; e.target.style.outline = "none"; }} onBlur={(e) => { e.target.style.borderColor = "#DDDDDD"; e.target.style.boxShadow = "none"; e.target.style.outline = "none"; }} />
            </form>
            {existingMonths && existingMonths.data && (
              <div id="existing_months">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "start", }}>
                  {Object.keys(existingMonths.data).map((month, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: "#FFFFFF", borderRadius: "1rem", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
                        fontWeight: "600", color: "#2D3748", display: "flex", flexDirection: "row",
                        cursor: "pointer", transition: "transform 0.3s, box-shadow 0.3s",
                        textAlign: "center", gap: "0.5rem", flexBasis: "5%", justifyContent: "space-between"
                      }}
                      onMouseEnter={(e) => { e.target.style.transform = "scale(1.05)"; }}
                      onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
                      onClick={() => (
                        handleMonthSelect(
                          existingMonths.data[month].month,
                          existingMonths.data[month].year
                        )
                      )
                      }
                    >
                      <div style={{ fontSize: "0.9rem", color: "#3B82F6E2", fontWeight: "700", letterSpacing: "0.5px" }}>
                        {existingMonths.data[month].month}
                      </div>
                      <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#4A556880", letterSpacing: "0.5px" }}>
                        {existingMonths.data[month].year}
                      </div>
                    </div>
                  ))}

                  {/* displays the existing month data    */}


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
            <form id="submit" onSubmit={handleSubmit} style={{ flexGrow: 1 }}>
              <textarea value={input || ""} onChange={handleInput} rows={1} placeholder="Paste month here..." style={{ width: "100%", padding: "0.75rem", fontSize: "0.9rem", border: "1px solid #DDDDDD", borderRadius: "0.5rem", resize: "none", overflow: "hidden", outline: "none", transition: "border-color 0.3s, box-shadow 0.3s" }} onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 5px rgba(59, 130, 246, 0.3)"; }} onBlur={(e) => { e.target.style.borderColor = "#DDDDDD"; e.target.style.boxShadow = "none"; }} ref={(textarea) => { if (textarea) { textarea.style.height = "100%"; textarea.style.height = `${textarea.scrollHeight}px`; } }} />
            </form>
          </div>
        </div>
        <div className="update-preview" style={style_category_dialog}>
          <div className="tab-header" style={style_tab_header}>
            <div style={style_tab_header_idx}>3</div>
            <div style={style_tab_header_label}>{!selectedExistingDate ? "Preview" : `${""}View/Update: ${selectedExistingDate}`}</div>
          </div>
          {!selectedExistingDate ? (<div className="tab-body" style={style_tab_body}>
            {(input && input.length > 1) ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[input, parsedInput].map((data, tableIndex) => (
                  <table key={tableIndex} style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#F9FAFB", borderRadius: "0.5rem", border: "none", overflow: "hidden", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", fontSize: "0.9rem" }}>
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
            ) : (<div className="prompt-text" style={{ border: "1px solid #EEEEFF", backgroundColor: "#EEEEEE", height: "100%", borderRadius: "0.5rem", textAlign: "center", alignContent: "center", fontSize: "1rem", fontWeight: 500, color: "#CCCCCC", padding: "1rem 0rem" }}>paste schedule for preview</div>)}
          </div>) :
            (<div className="tab-body">
              {existingMonths && existingMonthsData && existingMonthsData?.data && selectedExistingDate &&
                <div style={{ width: "100%" }}>
                  <div className="" style={{ float: "right" }}>{selectedExistingDate} Existing Schedule</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#F9FAFB", borderRadius: "0.5rem", border: "none", overflow: "hidden", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#3B82F6", color: "#FFF" }}>
                        {Object.keys(existingMonthsData.data[0]).map((header, index) => (
                          <th key={index} style={{ padding: "0.5rem", textAlign: "left", fontWeight: "600", fontSize: "0.875rem" }}>
                            {header}
                          </th>
                        ))}
                        <th className="" style={{ padding: "0.5rem", fontWeight: "600", fontSize: "0.875rem", textAlign: "center" }}>modify</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        existingMonthsData.data.map((row, index) => (
                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#FFF" : "#F3F4F6", cursor: "pointer" }} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#E5E7EB")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#FFF" : "#F3F4F6")}>
                            {Object.keys(row).map((cell, cellIndex) => (
                              <td key={cellIndex} style={{ padding: "0.5rem", color: "#374151", fontWeight: 400 }}>{row[cell]}</td>
                            ))}
                            <div className="" style={{ display: "flex", justifyContent: "space-evenly", alignContent: "center", padding: "0.35rem" }}>
                              <div className="" style={{ border: "1px solid #3B82F6", borderRadius: "0.25rem", padding: "0.125rem 0.5rem", color: "#3B82F6" }}>edit</div>
                              <div className="" style={{ border: "1px solid #3B82F6", borderRadius: "0.25rem", padding: "0.125rem 0.5rem", color: "#3B82F6" }}>delete</div>
                            </div>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              }
            </div>)}

        </div>
        <div className="update-goals" style={style_category_dialog} id="goals">

          <div className="tab-header" style={style_tab_header}>
            <div style={style_tab_header_idx}>4</div>
            <div style={style_tab_header_label}>Update Goals</div>
          </div>
          <div className="tab-body" style={style_tab_body}>
            {(input && input.length > 1) ?
              ((extrusionGoals || fiberGoals || compoundingGoals) &&
                [extrusionGoals, fiberGoals, compoundingGoals].map((goal, i) => Object.keys(goal).length > 0 && (
                  <table key={i} className="goals-table" style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#F9FAFB", borderRadius: "0.5rem", border: "none", overflow: "hidden", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", fontSize: "0.9rem", tableLayout: "fixed" }}>
                    <colgroup>
                      <col style={{ width: "50%" }} />
                      <col style={{ width: "25%" }} />
                      <col style={{ width: "25%" }} />
                    </colgroup>

                    {Object.keys(goal).length > 0 ? (<thead>
                      <tr style={{ backgroundColor: "#3B82F6", color: "#FFF", padding: "0rem" }}>
                        <th style={{ padding: "0.5rem", textAlign: "left", fontWeight: "600", fontSize: "0.875rem" }}>{["Extrusion", "Fiber", "Compounding"][i]}</th>
                        <th style={{ padding: "0.5rem", textAlign: "left", fontWeight: "600", fontSize: "0.875rem" }}>Shifts</th>
                        <th style={{ padding: "0.5rem", textAlign: "left", fontWeight: "600", fontSize: "0.875rem" }}>Goals</th>
                      </tr>
                    </thead>) : (<div></div>)}
                    <tbody>
                      {Object.keys(goal).map((entry, j) => (
                        <tr key={j} style={{ backgroundColor: j % 2 === 0 ? "#FFFFFF" : "#F3F4F6", transition: "background-color 0.2s ease", cursor: "pointer" }} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#E5E7EB")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = j % 2 === 0 ? "#FFFFFF" : "#F3F4F6")}>
                          <td style={{ padding: "0.5rem", color: "#374151", fontWeight: 400 }}>
                            {entry}
                          </td>
                          <td style={{ padding: "0.5rem", color: "#374151", fontWeight: 400 }}>
                            {goal[entry]}
                          </td>
                          {/* <td style={{ padding: "0.5rem", color: "#374151", fontWeight: 400 }}>
                          <input
                            type="text"
                            value={goal[entry] || ''}
                            onChange={(e) => handleGoalChange(e, entry, ["extrusionGoals", "fiberGoals", "compoundingGoals"][i])}
                            style={{ width: "100%", padding: "0.25rem", border: "1px solid #E5E7EB", borderRadius: "0.25rem", fontSize: "0.75rem", backgroundColor: "#FFF" }}
                          />
                        </td> */}
                          <td style={{ padding: "0.5rem", color: "#374151", fontWeight: 400 }}>
                            <input
                              type="number"
                              // value={}
                              onChange={(e) => handleGoalChange(e, entry)}
                              style={{ width: "100%", padding: "0.25rem", border: "1px solid #E5E7EB", borderRadius: "0.25rem", fontSize: "0.9rem", backgroundColor: "#FFF" }}
                              onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 5px rgba(59, 130, 246, 0.3)"; e.target.style.outline = "none"; }}
                              onBlur={(e) => { e.target.style.borderColor = "#DDDDDD"; e.target.style.boxShadow = "none"; e.target.style.outline = "none"; }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ))) : (<div className="prompt-text" style={{ border: "1px solid #EEEEFF", backgroundColor: "#EEEEEE", height: "100%", borderRadius: "0.5rem", textAlign: "center", alignContent: "center", fontSize: "1rem", fontWeight: 500, color: "#CCCCCC", padding: "1rem 0rem" }}>paste schedule to enter goals</div>)}
          </div>

        </div>
        <div className="update-metrics" style={style_category_dialog} id="metrics">

          <div className="tab-header" style={style_tab_header}>
            <div style={style_tab_header_idx}>6</div>
            <div style={style_tab_header_label}>Demand Estimation</div>
          </div>
          <div className="tab-body" style={style_tab_body}>
            {(input && input.length > 1) ? (<div className="m">
              extrusion: {extrusionGoals && JSON.stringify(extrusionGoals)}
              fiber: {fiberGoals && JSON.stringify(fiberGoals)}
              compounding: {compoundingGoals && JSON.stringify(compoundingGoals)}
              Available lots:

              Partially available lots:

              {goals && JSON.stringify(goals)}
            </div>) : (
              <div className="prompt-text" style={{ border: "1px solid #EEEEFF", backgroundColor: "#EEEEEE", height: "100%", borderRadius: "0.5rem", textAlign: "center", alignContent: "center", fontSize: "1rem", fontWeight: 500, color: "#CCCCCC", padding: "1rem 0rem" }}>paste schedule to estimate demand</div>)}






          </div>

        </div>
        <div className="update-submit" style={style_category_dialog}>
          <div className="tab-header" style={style_tab_header}>
            <div style={style_tab_header_idx}>5</div>
            <div style={style_tab_header_label}>Submit</div>
          </div>
          <div className="tab-body" style={style_tab_body}>
            {input ? <button
              type="submit"
              onClick={handleSubmit}
              style={{
                width: "100%",
                padding: "1rem",
                backgroundColor: "transparent",
                color: "#3B82F6",
                fontSize: "1rem",
                fontWeight: "600",
                border: "1px solid #3B82F6",
                borderRadius: "0.5rem",
                cursor: "pointer",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                transition: "background-color 0.3s",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#3B82F6"
                e.currentTarget.style.color = "white"
                // handleSchemeClick("produced")
              }}

              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
                e.currentTarget.style.color = "#3B82F6"
              }}
            >
              <span
                style={{
                  // When submitting, add text animation
                  ...(isSubmitting && {
                    animation: "textAnim 2s infinite",
                  }),
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </span>
            </button> : <div className="prompt-text" style={{ border: "1px solid #EEEEFF", backgroundColor: "#EEEEEE", height: "100%", borderRadius: "0.5rem", textAlign: "center", alignContent: "center", fontSize: "1rem", fontWeight: 500, color: "#CCCCCC", padding: "1rem 0rem" }}>paste schedule to submit</div>}


          </div>
        </div>
      </div>
    </div>
  );
}

export default Schedule;

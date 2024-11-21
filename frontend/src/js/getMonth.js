import React, { useState } from "react";

function GetMonth() {
  const [input, setInput] = useState(null);
  const [preview, setPreview] = useState(null);
  const [goals, setGoals] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleInput = (event) => {
    let rawInput = event.target.value.split("\n").map((line) => line.split("\t"));
    let rawGoals = [];

    if (rawInput) {
      for (let i = 0; i < rawInput.length; i++) {
        const [
          date, week, day, EX00, EX01, EX03, EX04, Compounding, Fiber, Other,
        ] = rawInput[i];

        // Push the goal data
        rawGoals.push(EX00, EX01, EX03, EX04, Compounding, Fiber, Other);
      }
    }

    setGoals(rawGoals.filter((goal) => goal !== ""));
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

  const styles = {
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      backgroundColor: "#4CAF50",
      color: "white",
      padding: "10px",
      textAlign: "left",
    },
    td: {
      padding: "10px",
      border: "1px solid #ddd",
    },
    trEven: {
      backgroundColor: "#f2f2f2",
    },
    trOdd: {
      backgroundColor: "#fff",
    },
    header: {
      fontSize: "1.5em",
      marginBottom: "10px",
    },
    textarea: {
      width: "100%",
    },
  };

  return (
    <div className="component-wrapper">
      <div
        className="content"
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          borderRadius: "5px",
        }}
      >
        <h3>Enter Month</h3>
        <form>
          <label htmlFor="monthYear">Select Month and Year:</label>
          <input
            id="monthYear"
            type="month"
            value={selectedDate}
            onChange={handleChange}
          />
          <p>Selected Month and Year: {selectedDate}</p>
        </form>

        <form onSubmit={handleSubmit}>
          <textarea
            value={input || ""}
            onChange={handleInput}
            rows={20}
            cols={150}
            placeholder="Paste month here..."
            style={{
              resize: "vertical",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "16px",
            }}
          />
          <div className="interaction">
            <button type="submit" className="button" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {input && input.length > 1 && (
        <div
          className="content"
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <table style={styles.table}>
            <thead>
              <tr>
                {input[0].map((header, index) => (
                  <th key={index} style={styles.th}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {input.slice(1).map((row, index) => (
                <tr
                  key={index}
                  style={index % 2 === 0 ? styles.trEven : styles.trOdd}
                >
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} style={styles.td}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <table>
            <thead>
              <tr>
                <th>Goals</th>
              </tr>
            </thead>
            <tbody>
              {goals.map((goal, index) => (
                <tr key={index}>
                  <td>{goal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default GetMonth;

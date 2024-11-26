import React, { useEffect, useState } from "react";
import moment from "moment";

import "../css/App.css";

const lineID = { EX00: 0, EX01: 1, EX03: 2, EX04: 3 };
const materialColor = {
  ES2: "00BDD2",
  ONX: "1F1F1F",
  OXL: "1F1F1F",
  D2S: "169C38",
  CPR: "B24A00",
  OFR: "CF4520",
  "17F": "2053B2",
  FIB: "A3AB05",
  KEV: "2E2830",
  CAR: "16131A",
  "625": "47169C",
  "G16" :"D8D0C1",
  "172" : "3333FF"
};


const Tooltip = ({ entry, position }) => {
  return (
    <div
      className="tooltip"
      style={{
        top: position.top + "px",
        left: position.left + "px",
        position: "absolute",
        zIndex: 10,
        pointerEvents: "none",
        width: "auto"
      }}
    >
      <div className="tooltip-card"> style={{
          backgroundColor: "#333",
          color: "white",
          padding: "10px 15px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          fontSize: "0.9rem",
          minWidth: "200px",
          whiteSpace: "nowrap"
      }}
        <div><strong>Spool ID:</strong> {entry[0]}</div>
        <div><strong>Material:</strong> {entry[1]}</div>
        <div><strong>Start Time:</strong> {entry[2]}</div>
        <div><strong>End Time:</strong> {entry[4]}</div>
      </div>
    </div>
  );
};

const FiberBar = ({ entry, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Show the tooltip when hovering over the fiber-bar
  const handleMouseEnter = (e) => {
    const rect = e.target.getBoundingClientRect();
    setPosition({
      top: rect.top + window.scrollY - 50, // 50px above the element
      left: rect.left + window.scrollX + rect.width / 2 - 100, // Centered horizontally
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      key={`${index}-1`}
      className="fiber-bar"
      style={{
        display: "flex",
        flexBasis: entry[3],
        backgroundColor: `#${materialColor[entry[1]]}`,
        alignItems: "center",
        paddingLeft: "1rem",
        overflowX: "hidden",
        position: "relative", // Needed for absolute positioning of the tooltip
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {entry[0]}s

      {/* Display tooltip when hovered */}
      {isHovered && <Tooltip entry={entry} position={position} />}
    </div>
  );
};


function Production() {
  const [scheduleData, setScheduleData] = useState(null);
  const [compoundingData, setCompoundingData] = useState(null);
  const [fiberData, setFiberData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stream, setStream] = useState(null);
  const [material, setMaterial] = useState(null);
  const [startDate, setStartDate] = useState("2024-10-31");
  const [endDate, setEndDate] = useState("2024-11-01");

  const handleStartDateChange = (value) => {
    console.log(value);
  
    // Create a Moment object from the input value (start date)
    const startDate = moment(value, "YYYY-MM-DD");
  
    // Normalize the selected date in case of auto-corrections (e.g., "November 0" => "October 31")
    const correctedDate = moment(startDate);
  
    // If the corrected date doesn't match the selected date, it means a correction occurred
    if (!startDate.isSame(correctedDate, 'day')) {
      console.log('User selected an invalid date, corrected to:', correctedDate.format('YYYY-MM-DD'));
    }
  
    // Format the start date as "YYYY-MM-DD"
    const formattedStartDate = correctedDate.format('YYYY-MM-DD');
    
    setStartDate(formattedStartDate);
  
    // Ensure correct parsing of the input date for the next day
    const nextDay = correctedDate.add(1, 'days');
    
    // Format the end date as "YYYY-MM-DD"
    const formattedEndDate = nextDay.format('YYYY-MM-DD');
    
    setEndDate(formattedEndDate);
    
    console.log(formattedStartDate, formattedEndDate);
    window.history.pushState(null, "", `?start_date=${formattedStartDate}`);

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
    setStream(null);
    fetchData(
      `http://localhost:5000/api/current?start_date=${startDate}&end_date=${endDate}`,
      (data) => setScheduleData(data.scheduled)
    );
  }, [startDate, endDate]);

  useEffect(() => {
    console.log("fetchingFiber data for date", startDate)
    fetchData(
      `http://localhost:5000/api/current/fiber?start_date=${startDate}`,
      (data) => setFiberData(data)
    );
  }, [startDate]);

  useEffect(() => {
    fetchData(
      `http://localhost:5000/api/current/compounding?start_date=${startDate}&end_date=${endDate}`,
      (data) => setCompoundingData(data)
    );
  }, [startDate, endDate]);

  useEffect(() => {
    if (scheduleData) {
      const uniqueMaterials = [...new Set(scheduleData.map((item) => item.material_id))];
      setMaterial(uniqueMaterials);

      const matrix = uniqueMaterials.map(() =>
        Array(4).fill(null).map(() => ({ 1: "", 2: "", 3: "" }))
      );

      scheduleData.forEach((item) => {
        const row = uniqueMaterials.indexOf(item.material_id);
        const col = lineID[item.line];
        const shift = item.shift;
        if (matrix[row] && matrix[row][col]) matrix[row][col][shift] = item;
      });

      setStream(matrix);
    } else {
      setStream(null);
    }
  }, [scheduleData]);

  if (error) return <div>Error: {error}</div>;

  return (
    scheduleData && (
      <div
        className="production-root"
        style={{ backgroundColor: "black", color: "white", height: "auto", padding: "3vw" }}
      >
        <div
          className="selector-root"
          style={{ display: "flex", gap: "2rem", alignItems: "center", flexDirection: "row" }}
        >
          <div className="page-name" style={{ fontSize: "3rem", fontWeight: 400 }}>
            Production:
          </div>
          <div className="date-selector" style={{ display: "flex", gap: "1rem" }}>
            <input
              id="start-date"
              type="date"
              min="2000-01-01"
              max="2030-12-31"
              value={startDate}
              style={{
                fontSize: "2rem",
                font: "Roboto",
                padding: "0.5rem",
                backgroundColor: "#000000",
                border: "none",
                color: "#FFFFFF",
                letterSpacing: "0.5rem",
              }}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
          </div>
        </div>

        <div className="schedule-root">
          <div
            className="headers"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              paddingTop: "5rem",
              paddingBottom: "1rem",
            }}
          >
            {Object.keys(lineID).map((line) => (
              <div
                key={line}
                style={{ flexBasis: "20%", fontWeight: "600", fontSize: "1.25rem" }}
              >
                {line?.slice(2)}
              </div>
            ))}
            <div className="" style={{flexBasis:"10%", fontWeight: "600"}}></div>

          </div>
          <div
            className=""
            style={{ display: "flex", flexDirection: "column", gap: "2rem", height: "50vh" }}
          >
            {stream &&
              stream.map((row, rowIndex) => (
                <div
                  key={`row-${rowIndex}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    flexGrow: 1,
                  }}
                >
                  {row.map((cell, colIndex) => (
                    <div
                      key={`row-${rowIndex}-col-${colIndex}`}
                      style={{
                        justifyContent: "space-between",
                        display: "flex",
                        flexDirection: "row",
                        flexBasis: "20%",
                        flexGrow: 1,
                        gap: "0.5rem",
                      }}
                    >
                      {Object.keys(cell).map((item, itemIndex) => (
                        <div
                          key={`row-${rowIndex}-col-${colIndex}-item-${itemIndex}`}
                          style={{
                            flexGrow: 1,
                            flexBasis: "30%",
                            borderRadius: "0.25rem",
                            backgroundColor: `#${materialColor[cell[item]?.material_id]}`,
                          }}
                        />
                      ))}
                    </div>
                  ))}
                  <div
                    className=""
                    style={{
                      display: "flex",
                      flexBasis: "10%",
                      fontSize: "2rem",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {material?.[rowIndex]}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="fiber-root">
          <div
            className="page-name"
            style={{ fontSize: "3rem", fontWeight: 400, paddingBottom: "3rem", paddingTop: "8rem" }}
          >
            Fiber:
          </div>
          <div
            className="filtered-data"
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div className=""   style={{
                      display: "flex",
                      flexDirection: "row",
                      marginLeft: "3rem",
                      fontSize: "0.7rem",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                      // overflowX: "hidden",
                    }}>
              {fiberData && fiberData.delta.map((stamp, index) => (
                <div key={index} style={{
                  transform: "rotate(-45deg)",
                  transformOrigin: "center", // Ensures the rotation happens around the center
                }} className="">{stamp}</div>
              ))}
            </div>

            {fiberData &&
              Object.keys(fiberData?.produced).map((line) => (
                <div
                  key={`line-${line}`}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: "1.5rem"
                  }}
                >
                  <div
                    style={{
                      fontWeight: "500",
                      fontSize: "1.5rem",
                      flexBasis: "1%",
                    }}
                  >
                    {line?.slice(2)}
                  </div>
                  <div style={{ display: "flex", flexDirection: "row", gap: "1rem", width: "100%" }}>
                    {fiberData.produced?.[line].map((entry, index) => (
                      <div
                        key={`${index}-1`}
                        className="fiber-bar"
                        style={{
                          display: "flex",
                          flexBasis: entry[3],
                          // borderRadius: "0.25rem",
                          backgroundColor: `#${materialColor[entry[1]]}`,
                          alignItems: "center",
                          paddingLeft: "1rem",
                          overflowX: "hidden"
                        }}
                        title={JSON.stringify(entry, null, 2)} // Tooltip content
                      >
                       {entry[0]}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="compounding-root">
          <div
            className="page-name"
            style={{ fontSize: "3rem", fontWeight: 400, paddingBottom: "3rem", paddingTop: "8rem" }}
          >
            Compounding:
          </div>
          <div className="filtered-data" style={{display: "flex", flexDirection: "row", flexWrap: "wrap",  justifyContent:"space-between", rowGap: "1rem"}}>
            {/* {compoundingData?.scheduled?.map((entry, index) => (
              <div
                key={index}
                style={{
                  padding: "10px",
                  borderBottom: "1px solid white",
                }}
              >
                <div>ID: {entry.id}</div>
                <div>Batch: {entry.date}</div>
                <div>LOT: {entry.line}</div>
                <div>Mass: {entry.material_id}</div>
                <div>Stage: {entry.shift}</div>
              </div>
            ))} */}
            {compoundingData && Object.keys(compoundingData?.produced).map((entry, index) => (
              <div className="" style={{flexBasis: "24%", border: "1px solid grey", borderRadius: "0.5rem"}}>
                <div key={index} className="" style={{ padding: "1.5rem", borderRadius: "0.5rem", backgroundColor: "#141414", height: "auto"}}>
                  {/* <div className="">   {(compoundingData.produced[entry]['material_id'])}</div> */}

                  <div className="" style={{fontSize: "1.5rem", paddingBottom: "2rem", paddingTop: "1rem"}}>{entry}</div>
                  <div className="" style={{fontSize: "1rem", paddingBottom: "1rem", display: "flex", justifyContent: "space-between", color: "grey"}}>
                      <div className="">  {(compoundingData.produced[entry]['date'])}</div>
                      <div className="">   {(compoundingData.produced[entry]['raw_powder'])}</div>
                      <div className="">   {(compoundingData.produced[entry]['mass'])}</div>
                  </div>

                  <div className="" style={{display: "flex", flexDirection:"column", gap: "1rem"}}>
                  
                  {compoundingData.produced[entry]?.historical.map(
                      ([date, batchNum, stage, batchId, mass], index) => (
                        <div key={index} style={{display: "flex", justifyContent: "space-between", color: "grey"}}>
                          <div className="">{date}</div>
                          <div className="">{stage}</div>
                          <div className="">{batchNum}</div>
                          {/* <div className="">{batchId}</div> */}
                          <div className="">{mass}</div>
                        </div>
                      )
                    )}

                  {compoundingData.produced[entry]?.current.map(
                      ([date, batchNum, stage, batchId, mass], index) => (
                        <div key={index} style={{display: "flex", justifyContent: "space-between"}}>
                          <div className="">{date}</div>
                          <div className="">{stage}</div>
                          <div className="">{batchNum}</div>
                          {/* <div className="">{batchId}</div> */}
                          <div className="">{mass}</div>
                        </div>
                      )
                    )}


                  </div>

                </div>


              </div>
            ))

            }
            
          </div>
        </div>
      </div>
    )
  );
}

export default Production;

import React, { useEffect, useState } from "react";
import moment from "moment";
import * as styles from "./styles";
import "../css/App.css";
import { materialColor } from "./materials";

function View() {
  //   const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
  //   const [endDate, setEndDate] = useState(
  //     moment(moment()).add(1, "d").format("YYYY-MM-DD")
  //   );
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM"));
  const [startDate, setStartDate] = useState(moment(selectedDate).startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment(selectedDate).endOf('month').format('YYYY-MM-DD'));
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const [metricsData, setMetricsData] = useState({});
  const [goalsData, setGoalsData] = useState({});


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
    fetchData(
      `http://localhost:5000/api/metrics/extruder?start_date=${startDate}&end_date=${endDate}`,
      (data) => setMetricsData(data)
    );
  }, [startDate, endDate]);

  useEffect(() => {
    setLoading(true);
    fetchData(
      `http://localhost:5000/api/goals/extruder?start_date=${startDate}&end_date=${endDate}`,
      (data) => setGoalsData(data)
    );
  }, [startDate, endDate]);

  // take user input
  // determine what that months schedule is
  // render the schedule
  // figure out github
  // display that schedule
  const handleChange = (e) => {
    console.log(e.target.value); // e.target.value is in the format YYYY-MM
    setSelectedDate(e.target.value);
  
    // Use Moment.js to calculate the first and last days of the selected month
    const startDate = moment(e.target.value).startOf('month').format('YYYY-MM-DD');
    const endDate = moment(e.target.value).endOf('month').format('YYYY-MM-DD');
  
    setStartDate(startDate);
    setEndDate(endDate);
  };

  return (
    <div className="view-root" style={styles.page_root}>
      <form>
        <input
          id="monthYear"
          type="month"
          value={selectedDate}
          onChange={handleChange}
          placeholder="Select a month and year"
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1.25rem",
            border: "1px solid #DDDDDD",
            borderRadius: "0.5rem",
            height: "3rem",
            transition: "border-color 0.3s, box-shadow 0.3s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3b82f6";
            e.target.style.boxShadow = "0 0 5px rgba(59, 130, 246, 0.3)";
            e.target.style.outline = "none";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#DDDDDD";
            e.target.style.boxShadow = "none";
            e.target.style.outline = "none";
          }}
        />
      </form>
      <div className="view-title" style={{ fontSize: "4rem", color: "#D9D9D9", justifyContent: "center", width: "100%", letterSpacing: "0.5rem", textAlign: "center", marginBottom: "2rem", marginTop: "5rem"}}>
        <div className=""> &gt; {moment(selectedDate).format("MMMM ' YY").toUpperCase()}</div>
      </div>
      <div className="view-edit-targets" style={{display: "flex", justifyContent: "center", gap: "1rem"}}>
        <div className="view-edit-ovens" style={styles.view_button}>EDIT OVENS</div>
        <div className="view-edit-schedule" style={styles.view_button}>EDIT SCHEDULE</div>
        <div className="view-edit-goal" style={styles.view_button}>EDIT GOALS</div>
      </div>
      <div className="view-monthly-attainment" style={{display: "flex", marginTop: "2rem", gap: "1rem"}}>
        <div className="view-material-attainement" style={{display: "flex", flexDirection: "column", height: "10rem", flexGrow: 1, gap: "1rem"}}>
            {/* {JSON.stringify(metricsData["spools_created"])} */}
            {metricsData && metricsData["spools_created"] && goalsData && goalsData.raw && Object.keys(metricsData["spools_created"]).map((material_id, idx) => (
                <div key={idx} className="" style={{display: "flex", border: "1px solid #D9D9D9",  borderRadius: "0.5rem"}}>
                    {material_id}
                    {Object.keys(metricsData["spools_created"][material_id]).map((status, jdx) => (
                        <div key={`${idx}-${jdx}`} className="" style={{flexBasis: `${(metricsData["spools_created"][material_id][status] | 1) * 100 / goalsData.raw[material_id]}%`, border: "1px solid blue", textAlign: "right", backgroundColor: materialColor[material_id], padding: "0.5rem", borderRadius: "0.5rem"}}>{metricsData["spools_created"][material_id][status]}</div>
                    ))}
                    <div className="goal" style={{float: "right", textAlign: "right"}}>{goalsData.raw[material_id]}</div>

                </div>
            ))}
        </div>
        <div className="view-material-attainment-graph" style={{border: "1px solid #3290FF", color: "#3290FF", borderRadius: "1rem", height: "10rem", padding: "1rem" , flexGrow: 1}}>
          graph goes here...
        </div>
      </div>

    </div>
  );
}
export default View;

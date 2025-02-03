import React, { useEffect, useState } from "react";
import moment from "moment";
import * as styles from "./styles";
import "../css/App.css";
import { materialColor } from "./materials";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";



import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function View() {
  const navigate = useNavigate();
  const location = useLocation();

  const urlDate = location.search.replace("?", "").trim();

  // Function to clean & validate the date input
  const normalizeDate = (dateStr) => {
    if (!dateStr) return moment().format("YYYY-MM"); // Default to current month if empty

    // Try parsing with moment.js
    let parsedDate = moment(dateStr, ["YYYY-MM", "YYYY/MM", "YYYY MM", "MM-DD-YYYY", "DD-MM-YYYY", "YYYY/MM/DD", "YYYY MM DD"], true);

    if (!parsedDate.isValid()) {
      return moment().format("YYYY-MM"); // Default if invalid
    }

    return parsedDate.format("YYYY-MM"); // Normalize to "YYYY-MM"
  };




  const [selectedDate, setSelectedDate] = useState((urlDate && normalizeDate(urlDate))|| moment().format("YYYY-MM"));
  const [startDate, setStartDate] = useState(
    moment(selectedDate).startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    moment(selectedDate).endOf("month").format("YYYY-MM-DD")
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const [metricsData, setMetricsData] = useState({});
  const [goalsData, setGoalsData] = useState({});
  const [scheduleData, setScheduleData] = useState({});
  const [graphData, setGraphData] = useState({});
  const [graphFormat, setGraphFormat] = useState({});

  const [scheduleOutline, setScheduleOutline] = useState([]);

  const style_attainment_container = {
    display: "grid",
    gridTemplateColumns: "49% 49%",
    gridTemplateRows: "repeat(1, 1fr)",
    justifyContent: "space-between",
    position: "relative",
  };

  const style_schedule_container_header = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  };

  const style_schedule_container_body = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(, 1fr)",
    gap: "1%",
  };

  const style_days_of_the_week = {
    textAlign: "center",
    color: "#D9D9D9",
    fontSize: "1.5rem",
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

  function fetchMonthDays(year, month) {
    const daysInMonth = [];

    const startOfMonth = moment([year, month - 1]); // Month is zero-based in Moment.js

    const numberOfDays = startOfMonth.daysInMonth(); // Get number of days in the month

    for (let i = 0; i < numberOfDays; i++) {
      daysInMonth.push(
        startOfMonth.clone().add(i, "days").format("YYYY-MM-DD")
      );
    }
    return daysInMonth;
  }

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
      (data) => setGoalsData(data.raw)
    );
  }, [startDate, endDate]);

  useEffect(() => {
    setLoading(true);
    fetchData(
      `http://localhost:5000/api/schedule?start_date=${startDate}&end_date=${endDate}`,
      (data) => setScheduleData(data)
    );
  }, [startDate, endDate]);

  useEffect(() => {
    setLoading(true);
    fetchData(
      `http://localhost:5000/api/view/graph?start_date=${startDate}&end_date=${endDate}`,
      (data) => setGraphData(data)
    );
  }, [startDate, endDate]);

  useEffect(() => {
    if (!graphData || !graphData.data) return;

    console.log("Raw Data:", graphData.data);

    // Extract unique dates and sort them
    const labels = [...new Set(graphData.data.map((item) => item.date))].sort();

    console.log("Labels (Dates):", labels);

    // Extract unique material IDs
    const materialIds = [
      ...new Set(graphData.data.map((item) => item.material_id)),
    ];

    console.log("Material IDs:", materialIds);

    // Create datasets for each material
    const datasets = materialIds.map((materialId) => {
      const materialData = graphData.data.filter(
        (item) => item.material_id === materialId
      );

      return {
        label: materialId,
        data: labels.map((date) => {
          const entry = materialData.find((item) => item.date === date);
          return entry ? entry.net : 0; // Use 0 if no data for the date
        }),
        backgroundColor: materialColor[materialId] || "#000000", // Default color if missing
        borderColor: materialColor[materialId] || "#000000",
        tension: 0.4,
        fill: false,
      };
    });

    const data = {
      labels,
      datasets,
    };

    console.log("Final Chart Data:", data);

    setGraphFormat({
      data,
      options: {
        responsive: true,
        scales: {
          x: {
            grid: {
              display: true,
              lineWidth: 1,
            },
            ticks: {
              // color: "#FFFFFF80", // Sets tick labels color to white
              font: {
                size: 12,
              },
            },
            border: {
              display: true,
              color: "#FFFFFF", // Bottom axis baseline color
            },
          },
          y: { },
        },
      },
    });
  }, [graphData, graphData.data]);

  useEffect(() => {
    const dateRange = fetchMonthDays(
      moment(selectedDate).format("YYYY"),
      moment(selectedDate).format("MM")
    );

    const firstDayOfMonth = moment(dateRange[0]).day(); // Sunday = 0, Monday = 1, etc.

    // Create a padded array to align dates with correct weekdays
    const paddedDates = Array(firstDayOfMonth).fill(null).concat(dateRange);

    // Break the array into chunks of 7 (representing weeks)
    const weeks = [];
    for (let i = 0; i < paddedDates.length; i += 7) {
      weeks.push(paddedDates.slice(i, i + 7));
    }
    setScheduleOutline(weeks);
  }, [selectedDate]);

  const handleChange = (e) => {
    console.log(e.target.value); // e.target.value is in the format YYYY-MM
    setSelectedDate(e.target.value);

    // Use Moment.js to calculate the first and last days of the selected month
    const startDate = moment(e.target.value)
      .startOf("month")
      .format("YYYY-MM-DD");
    const endDate = moment(e.target.value).endOf("month").format("YYYY-MM-DD");

    setStartDate(startDate);
    setEndDate(endDate);

    navigate(`?${e.target.value}`);

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
          min="2020-01"
          max="2026-12"
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
      <div
        className="view-title"
        style={{
          fontSize: "5rem",
          color: "#D9D9D9",
          justifyContent: "center",
          width: "100%",
          letterSpacing: "0.5rem",
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <div className="">
          {moment(selectedDate).format("MMMM YYYY").toUpperCase()}
        </div>
      </div>
      <div
        className="view-edit-targets"
        style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "4rem"
        }}
      >
        <div className="view-edit-ovens" style={styles.view_button}>
          EXPAND
        </div>
        <div className="view-edit-schedule" style={styles.view_button}>
          EDIT SCHEDULE
        </div>
        <div className="view-edit-goal" style={styles.view_button}>
          EDIT GOALS
        </div>
      </div>
      <div
        className="view-monthly-attainment"
        style={{ marginTop: "2rem", ...style_attainment_container }}
      >
        <div
          className="view-material-attainement"
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 0.5,
            gridColumn: "1",
            gridRow: "1",
            justifyContent:
            metricsData &&
            metricsData["spools_created"] &&
            Object.keys(metricsData["spools_created"]).length > 3
              ? "space-between" // More than 3 items → evenly spaced
              : "flex-start", // Few items → aligned at the top
          gap: "0.5rem",
          }}
        >
          {/* {JSON.stringify(metricsData["spools_created"])} */}
          {metricsData &&
            metricsData["spools_created"] &&
            goalsData &&
            Object.keys(metricsData["spools_created"]).map(
              (material_id, idx) => (
                <div
                  key={idx}
                  className=""
                  style={{
                    display: "flex",
                    border: "1px solid #D9D9D9",
                    borderRadius: "0.5rem",
                  }}
                >
                  <div
                    className=""
                    style={{
                      borderTopLeftRadius: "0.5rem",
                      borderBottomLeftRadius: "0.5rem",
                      padding: "0.25rem 0.75rem",
                      backgroundColor: materialColor[material_id] + "E6",
                      color: (material_id in materialColor ? "#FFFFFF" : "#000000"),
                      letterSpacing: "1px",
                      fontSize: "1.25rem",
                      fontWeight: 400,
                    }}
                  >
                    {material_id}
                  </div>
                  {Object.keys(metricsData["spools_created"][material_id])
                  .filter((status) => Number(status) === 0)
                  .map(
                    (status, jdx) => (
                      <div
                        key={`${idx}-${jdx}`}
                        className=""
                        style={{
                          flexBasis: `${
                            ((metricsData["spools_created"][material_id][
                              status
                            ] |
                              1) *
                              100) /
                            goalsData[material_id]
                          }%`,
                          //   border: "1px solid blue",
                          textAlign: "right",
                          backgroundColor: materialColor[material_id] + "E6",
                          padding: "0.5rem",
                          borderTopRightRadius: `${jdx === 0 ? 0.25 : 0}rem`,
                          borderBottomRightRadius: `${jdx === 0 ? 0.25 : 0}rem`,
                          color: "white",
                          // display: metricsData["spools_created"][material_id][status] === 5 || metricsData["spools_created"][material_id][status] === 6 ? "none" : "block",
                          // display: : false,
                          //   borderRadius: "0.5rem",
                        }}
                      >
                        {metricsData["spools_created"][material_id][status]}
                      </div>
                    )
                  )}
                  <div
                    className="goal"
                    style={{
                      textAlign: "right",
                      flexGrow: 1,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textDecoration: "underline",
                      verticalAlign: "center",
                      padding: "0.5rem",
                      color: "#BDBDBD",
                    }}
                  >
                    {goalsData[material_id]}
                  </div>
                </div>
              )
            )}
        </div>
        <div
          className="view-material-attainment-graph"
          style={{
            // border: "1px solid #3290FF",
            border: "1px solid #cccccc",
            color: "#3290FF",
            borderRadius: "0.5rem",
            padding: "1rem",
            gridColumn: "2",
            gridRow: "1",
            overflow: "scroll",
          }}
        >
          <div
            className="component-graph"
            style={{
              // ...style_item_border,
              gridColumn: "2 / 4",
              gridRow: "2 / 5",
              color: "#FFF",
              // borderRight: "1px solid white",
            }}
          >
            {graphData?.data &&
              graphFormat?.options &&
              graphFormat?.data &&
              Object.keys(graphFormat.options)?.length &&
              Object.keys(graphFormat.data)?.length && (
                <Line options={graphFormat.options} data={graphFormat.data} />
              )}

            {/* <pre>
                {graphFormat.options && JSON.stringify(graphFormat.options, null, 4)}
            </pre>
            <pre>
                {graphFormat.data && JSON.stringify(graphFormat.data, null, 4)} 
            </pre> */}

            {/* <pre className="">{metricsData && JSON.stringify(metricsData, null, 4)}</pre> */}
            {/* <pre className="" style={{ overflowY: "scroll" }}>
              {scheduleData && JSON.stringify(scheduleData, null, 4)}
            </pre> */}

            {/* TODO: this wont work if the date range is 0 days I think */}
            {/* {graphData &&
              Object.keys(graphData.options).length &&
              Object.keys(graphData.data).length && (
                <Line options={graphData.options} data={graphData.data} />
              )} */}
          </div>
        </div>
      </div>
      <div
        className="view-monthly-schedule"
        style={{
          color: "black",
          marginTop: "2rem",
          ...style_schedule_container_header,
        }}
      >
        <div
          className=""
          style={{ gridRow: "1", gridColumn: "1", ...style_days_of_the_week }}
        >
          S
        </div>
        <div
          className=""
          style={{ gridRow: "1", gridColumn: "2", ...style_days_of_the_week }}
        >
          M
        </div>
        <div
          className=""
          style={{ gridRow: "1", gridColumn: "3", ...style_days_of_the_week }}
        >
          T
        </div>
        <div
          className=""
          style={{ gridRow: "1", gridColumn: "4", ...style_days_of_the_week }}
        >
          W
        </div>
        <div
          className=""
          style={{ gridRow: "1", gridColumn: "5", ...style_days_of_the_week }}
        >
          T
        </div>
        <div
          className=""
          style={{ gridRow: "1", gridColumn: "6", ...style_days_of_the_week }}
        >
          F
        </div>
        <div
          className=""
          style={{ gridRow: "1", gridColumn: "7", ...style_days_of_the_week }}
        >
          S
        </div>
      </div>
      <div
        className="view-monthly-schedule"
        style={{
          color: "black",
          marginTop: "2rem",
          ...style_schedule_container_body,
        }}
      >
        {scheduleOutline &&
          scheduleData &&
          scheduleData.monthly_schedule &&
          scheduleOutline.map((week, xdx) =>
            week.map((day, ydx) => {
              // Parse day as UTC for consistency
              const dayAsUTC = day && moment.utc(day).startOf("day");

              const matchingDayData =
                day &&
                scheduleData.monthly_schedule.filter((entry) =>
                  moment.utc(entry.date).startOf("day").isSame(dayAsUTC)
                );

              // Separate the data into two arrays based on shift
              const shift1Data =
                matchingDayData?.filter((entry) => entry.shift === 1) || [];
              const shift2Data =
                matchingDayData?.filter((entry) => entry.shift === 2) || [];
              const shift3Data =
                matchingDayData?.filter((entry) => entry.shift === 3) || [];

              return (
                <div
                  style={{
                    gridRow: xdx + 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                  }}
                >
                  {/* Day number */}
                  <div
                    className=""
                    style={{
                      textAlign: "center",
                      color: day ? "#aaaaaa" : "transparent",
                      fontSize: "1.75rem",
                    }}
                  >
                    {(day && moment(day).format("D")) || 0}
                  </div>

                  {/* Day cell with Shift 1 data */}
                  <div
                    className=""
                    style={{
                      gridRow: xdx + 1,
                      gridColumn: ydx + 1,
                      border: "1px solid #D9D9D9",
                      borderRadius: "0.5rem",
                      height: "20rem",
                      padding: "0.5rem",
                      overflowY: "auto", // Add scrolling if content overflows
                    }}
                  >
                    {shift1Data.length > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.125rem",
                          // border: "1px solid blue",
                        }}
                      >
                        {scheduleData &&
                          metricsData &&
                          shift1Data.map((entry, idx) => (
                            <div
                              key={idx}
                              className=""
                              style={{
                                borderRadius: "0.35rem",
                                color:
                                  entry.material_id !== "AO1"
                                    ? "#FFFFFF"
                                    : "#000000",
                                // fontWeight: 600,
                                fontSize: "1.25rem",
                                display: "flex",
                                overflow: "hidden",
                                width: "100%",
                                backgroundColor:
                                  materialColor[entry.material_id],
                                padding: "0.25rem 0.5rem",
                                justifyContent: "space-between",
                              }}
                            >
                              <div className="">
                                {entry.line} {entry.material_id}
                              </div>
                              <div className="">-</div>

                              <div className="">
                                {metricsData.timeline?.[entry.material_id]?.[
                                  day
                                ]?.["1"]?.[0]
                                  ? metricsData.timeline?.[entry.material_id]?.[
                                      day
                                    ]?.["1"]?.[0]
                                  : 0}{" "}
                                /{" "}
                                {goalsData &&
                                  scheduleData &&
                                  goalsData[entry.material_id] && Math.round(
                                    goalsData[entry.material_id] /
                                      (scheduleData?.freq[entry.material_id] ? scheduleData?.freq[entry.material_id] : 1)
                                  )}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>

                  {/* Extra empty cell for Shift 2 data */}
                  <div
                    className=""
                    style={{
                      gridRow: xdx + 1,
                      gridColumn: ydx + 1,
                      border: "1px solid #D9D9D9",
                      backgroundColor: "#D9D9D9",
                      borderRadius: "0.5rem",
                      height: "20rem",
                      padding: "0.5rem",
                      overflowY: "auto", // Add scrolling if content overflows
                    }}
                  >
                    {shift2Data.length > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.125rem",
                          // border: "1px solid blue",
                        }}
                      >
                        {shift2Data.map((entry, idx) => (
                          <div key={idx}>
                            <div
                              className=""
                              style={{
                                backgroundColor:
                                  materialColor[entry.material_id],
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.25rem",
                                color:
                                  entry.material_id !== "AO1"
                                    ? "#FFFFFF"
                                    : "#000000",
                                // fontWeight: 600,
                                fontSize: "1.25rem",
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <div className="">
                                {entry.line} {entry.material_id}
                              </div>
                              <div className="">-</div>

                              <div className="">
                                {metricsData.timeline?.[entry.material_id]?.[
                                  day
                                ]?.["1"]?.[0]
                                  ? metricsData.timeline?.[entry.material_id]?.[
                                      day
                                    ]?.["1"]?.[0]
                                  : 0} {" "}
                                / {" "}
                                {goalsData &&
                                  scheduleData &&
                                  goalsData[entry.material_id] && Math.round(
                                    goalsData[entry.material_id] /
                                      (scheduleData?.freq[entry.material_id] ? scheduleData?.freq[entry.material_id] : 1)
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              );
            })
          )}
      </div>
    </div>
  );
}
export default View;

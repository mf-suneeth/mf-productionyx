import React, { useEffect, useState } from "react";
import moment from "moment";
import * as styles from "./styles";
import "../css/App.css";
import { materialColor, translateRawMaterial } from "./materials";
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
    let parsedDate = moment(
      dateStr,
      [
        "YYYY-MM",
        "YYYY/MM",
        "YYYY MM",
        "MM-DD-YYYY",
        "DD-MM-YYYY",
        "YYYY/MM/DD",
        "YYYY MM DD",
      ],
      true
    );

    if (!parsedDate.isValid()) {
      return moment().format("YYYY-MM"); // Default if invalid
    }

    return parsedDate.format("YYYY-MM"); // Normalize to "YYYY-MM"
  };

  const [selectedDate, setSelectedDate] = useState(
    (urlDate && normalizeDate(urlDate)) || moment().format("YYYY-MM")
  );
  const [startDate, setStartDate] = useState(
    moment(selectedDate).startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    moment(selectedDate).endOf("month").format("YYYY-MM-DD")
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const [metricsData, setMetricsData] = useState({});
  const [loadingMetricsData, setLoadingMetricsData] = useState(true);

  const [goalsData, setGoalsData] = useState({});
  const [scheduleData, setScheduleData] = useState({});
  const [loadingScheduleData, setLoadingScheduleData] = useState(true);

  const [viewData, setViewData] = useState({});
  const [loadingViewData, setLoadingViewData] = useState(true);

  const [graphData, setGraphData] = useState({});
  const [graphFormat, setGraphFormat] = useState({});
  const [loadingGraphData, setLoadingGraphData] = useState(true);

  const [compoundingData, setCompoundingData] = useState({});
  const [fiberLinesData, setFiberLinesData] = useState({});

  const [scheduleOutline, setScheduleOutline] = useState([]);

  // toggle styling
  const [dateFormatStyle, setDateFormatStyle] = useState(true);

  const [showHideDetails, setShowHideDetails] = useState(false);
  const [loadingDetailsData, setLoadingDetailsData] = useState(true);
  const [detailsData, setDetailsData] = useState({});


  const [loadingCountsData, setLoadingCountsData] = useState(true);
  const [countsData, setCountsData] = useState({});

  const style_attainment_container = {
    display: "grid",
    gridTemplateColumns: "49% 49%",
    gridTemplateRows: "repeat(1, 1fr)",
    justifyContent: "space-between",
    position: "relative",
    minHeight: "35vh",
  };

  const style_schedule_container_header = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
    columnGap: "1%",
  };

  const style_schedule_container_body = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(, 1fr)",
    columnGap: "1%",
    rowGap: "2rem",
  };

  const style_days_of_the_week = {
    textAlign: "center",
    color: "#D9D9D9",
    fontSize: "1.5rem",
  };

  const style_table = {
    width: "100%",
    borderCollapse: "collapse",
    borderRadius: "5rem",
    marginBottom: "2rem",
  };

  const style_th_td = {
    border: "1px solid #ddd",
    padding: "0.75rem",
    textAlign: "left",
  };

  const style_th = {
    ...style_th_td,
    backgroundColor: "#D9D9D920",
    fontWeight: "600",
  };

  // const trStyle = (index) => ({
  //   backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9", // Alternating row colors
  // });


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
    setLoadingMetricsData(true);
    fetchData(
      `http://localhost:5000/api/view/metrics?start_date=${startDate}&end_date=${endDate}`,
      (data) => {
        setMetricsData(data);
        setLoadingMetricsData(false);
      }
    );
  }, [startDate, endDate]);

  useEffect(() => {
    setLoadingDetailsData(true);
    fetchData(
      `http://localhost:5000/api/view/details?start_date=${startDate}&end_date=${endDate}`,
      (data) => {
        setDetailsData(data);
        setLoadingDetailsData(false);
      }
    );
  }, [startDate, endDate]);

  useEffect(() => {
    setLoadingCountsData(true);
    fetchData(
      `http://localhost:5000/api/view/counts?start_date=${startDate}&end_date=${endDate}`,
      (data) => {
        setCountsData(data);
        setLoadingCountsData(false);
      }
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
    setLoadingScheduleData(true);
    fetchData(
      `http://localhost:5000/api/schedule?start_date=${startDate}&end_date=${endDate}`,
      (data) => {
        setScheduleData(data)
        setLoadingScheduleData(false);
      }
    );
  }, [startDate, endDate]);

  useEffect(() => {
    setLoadingGraphData(true);
    fetchData(
      `http://localhost:5000/api/view/graph?start_date=${startDate}&end_date=${endDate}`,
      (data) => {
        setGraphData(data);
        setLoadingGraphData(true);
      }
    );
  }, [startDate, endDate]);

  useEffect(() => {
    setLoading(true);
    fetchData(
      `http://localhost:5000/api/view/compounding?start_date=${startDate}&end_date=${endDate}`,
      (data) => setCompoundingData(data.data)
    );
  }, [startDate, endDate]);

  useEffect(() => {
    setLoadingViewData(true);
    fetchData(
      `http://localhost:5000/api/view?start_date=${startDate}&end_date=${endDate}`,
      (data) => {
        setViewData(data);
        setLoadingViewData(false);
      }
    );
  }, [startDate, endDate]);
  useEffect(() => {
    if (!graphData?.data) return;

    const timer = setTimeout(() => {
      const labels = [...new Set(graphData.data.map(item => item.date))].sort();
      const materialIds = [...new Set(graphData.data.map(item => item.material_id))];

      const datasets = materialIds.map(materialId => {
        const materialData = graphData.data.filter(item => item.material_id === materialId);
        const data = labels.map(date => materialData.find(item => item.date === date)?.net || 0);

        return {
          label: materialId,
          data,
          backgroundColor: materialColor[materialId] || "#000000",
          borderColor: materialColor[materialId] || "#000000",
          tension: 0.4,
          fill: false,
        };
      });

      setGraphFormat({
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: "top", labels: { color: "#333333", font: { size: 14 } } },
            tooltip: {
              backgroundColor: '#333333DF', // Dark background for better readability
              titleFont: { size: 14, weight: 'bold', color: '#FFFFFF' }, // Title font styling (date)
              bodyFont: { size: 14, color: '#FFFFFF' }, // Body font styling (material ID, net, etc.)
              borderWidth: 1, // Border width of the tooltip
              cornerRadius: 5, // Rounded corners for a smoother look
              padding: 12, // Padding inside the tooltip for better spacing
              callbacks: {
                title: (tooltipItems) => {
                  const item = tooltipItems[0].dataset.data[tooltipItems[0].dataIndex];
                  const tooltipData = graphData.data.find((data) => data.net === item);
                  return tooltipData ? tooltipData.date : '';
                },
                label: (tooltipItem) => {
                  const dataset = tooltipItem.dataset;
                  const dataIndex = tooltipItem.dataIndex;
                  const value = dataset.data[dataIndex];

                  const tooltipData = graphData.data.find(
                    (data) => data.net === value && data.material_id === dataset.label
                  );

                  if (tooltipData) {
                    return [
                      `${tooltipData.material_id} - ${value}`,
                      `0: ${tooltipData["0"]}`,
                      `1: ${tooltipData["1"]}`,
                      `2: ${tooltipData["2"]}`,
                    ];
                  }

                  return '';
                },
              },
            },
          },
          scales: {
            x: { grid: { display: true, lineWidth: 1 }, ticks: { font: { size: 12 } }, border: { display: true, color: "#FFFFFF" } },
            y: {},
          },
        },
      });
      setLoadingGraphData(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [graphData]);

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
          marginTop: "2rem",
        }}
      >
        <div className="" style={{animation: loadingGraphData || loadingMetricsData || loadingViewData ? "pulse 1.5s infinite ease-in-out" : "none",}}>
          {moment(selectedDate).format("MMMM YYYY").toUpperCase()}
        </div>
      </div>
      <div
        className="view-edit-targets"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "3rem",
        }}
      >
        <div className="view-edit-ovens" style={styles.view_button} onClick={() => { setShowHideDetails(!showHideDetails) }}>
          {showHideDetails ? "HIDE" : "SHOW"} DETAILS
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
        style={{ marginTop: "2rem", marginBottom: "2rem", ...style_attainment_container }}
      >

        <div
          className="view-material-attainment"
          style={{
            display: "flex",
            flexDirection: "column",
            gridColumn: "1",
            gridRow: "1",
            gap: "0.25rem",
            justifyContent: "space-between",

          }}
        >
          {loadingMetricsData
            ?
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="skeleton-bar" style={{ height: "9%" }} />
            ))
            : metricsData?.spools_created &&
            goalsData &&
            Object.keys(metricsData.spools_created).map((material_id, idx) => (
              <div
                key={idx}
                className="fade-in"
                href={`#${material_id}`} // Optional for better accessibility
                onClick={(e) => {
                  e.preventDefault(); // Prevent default anchor behavior
                  const targetElement = document.getElementById(material_id);
                  if (targetElement) {
                    targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }}
                style={{
                  display: "flex",
                  border: "1px solid #D9D9D9",
                  borderRadius: "0.5rem",
                }}
              >
                <div
                  style={{
                    borderTopLeftRadius: "0.5rem",
                    borderBottomLeftRadius: "0.5rem",
                    padding: "0.25rem 0.75rem",
                    backgroundColor: materialColor[material_id] + "E6",
                    color:
                      material_id in materialColor && material_id !== "AO1"
                        ? "#FFFFFF"
                        : "#000000",
                    letterSpacing: "1px",
                    fontSize: "1.25rem",
                    fontWeight: 400,
                  }}
                >
                  {material_id}
                </div>
                {Object.keys(metricsData.spools_created[material_id])
                  .filter((status) => Number(status) === 0)
                  .map((status, jdx) => (
                    <div
                      key={`${idx}-${jdx}`}
                      style={{
                        flexBasis: `${((metricsData.spools_created[material_id][status] |
                          1) *
                          100) /
                          goalsData[material_id]
                          }%`,
                        textAlign: "right",
                        backgroundColor: materialColor[material_id] + "E6",
                        padding: "0.5rem",
                        borderTopRightRadius: `${jdx === 0 ? 0.25 : 0}rem`,
                        borderBottomRightRadius: `${jdx === 0 ? 0.25 : 0}rem`,
                        color:
                          material_id in materialColor && material_id !== "AO1"
                            ? "#FFFFFF"
                            : "#000000",
                      }}
                    >
                      {metricsData.spools_created[material_id][status]}
                    </div>
                  ))}
                <div
                  className="goal"
                  style={{
                    textAlign: "right",
                    flexGrow: 1,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textDecoration: "underline",
                    padding: "0.5rem",
                    color: "#BDBDBD",
                  }}
                >
                  {goalsData[material_id]}
                </div>
              </div>
            ))}
        </div>
        <div
          className="view-material-attainment-graph"
          style={{
            // border: "1px solid #3290FF",
            color: "#3290FF",
            gridColumn: "2",
            gridRow: "1",
            overflow: "scroll",
          }}
        >
          {loadingGraphData ? (
            <div className="skeleton-bar" style={{ height: "100%" }} />
          ) :
            (<div
              className="component-graph"
              style={{
                // ...style_item_border,
                color: "#FFF",
                height: "100%",
                padding: "1rem",
                border: "1px solid #cccccc",
                borderRadius: "0.5rem",
              }}
            >
              {graphData?.data &&
                graphFormat?.options &&
                graphFormat?.data &&
                Object.keys(graphFormat.options)?.length &&
                Object.keys(graphFormat.data)?.length && (
                  <Line options={graphFormat.options} data={graphFormat.data} />
                )}
            </div>)}

        </div>
      </div>
      {showHideDetails && <div
        className="view-monthly-attainment"
        style={{ marginTop: "4rem", ...style_attainment_container }}
      > {loadingDetailsData ? <div className="skeleton-bar" style={{ height: "100%", gridColumn: "1/3", gridRow: "1" }} /> :
        (
          <div style={{
            gridColumn: "1/3",
            gridRow: "1",
          }}>

            {/* Counts (if it's a simple string) */}
            {!loadingCountsData && countsData.counts && Array.isArray(detailsData.counts) && (
              <div>
                <table style={style_table}>
                  <thead>
                    <tr>
                      {[
                        "line_id",
                        "material_id",
                        "qc_spools",
                        "qc_spools_adj",
                        "scrap_spools",
                        "scrap_spools_adj",
                        "spool_len_const",
                        "total_kg",
                        "total_spools",
                        "wip_spools",
                        "wip_spools_adj",
                      ].map((key) => (
                        <th key={key} style={style_th}>
                          {key.replace(/_/g, " ").replace(/(^\w{1})|(\s+\w{1})/g, (match) => match)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detailsData.counts.map((row, index) => (
                      <tr key={index}>
                        {[
                          "line_id",
                          "material_id",
                          "qc_spools",
                          "qc_spools_adj",
                          "scrap_spools",
                          "scrap_spools_adj",
                          "spool_len_const",
                          "total_kg",
                          "total_spools",
                          "wip_spools",
                          "wip_spools_adj",
                        ].map((key) => (
                          <td key={key} style={style_th_td}>
                            {row[key] !== null ? row[key] : "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Efficiency Table */}
            {detailsData.efficiency && Array.isArray(detailsData.efficiency) && (
              <div>
                <table style={{ ...style_table, borderRadius: "5rem" }}>
                  <thead>
                    <tr>
                      {[
                        "material_id",
                        "max_runtime",
                        "min_runtime",
                        "avg_runtime",
                        "time_0",
                        "time_1",
                        "time_2",
                        "%_0",
                        "%_1",
                        "%_2",
                        "max_meters_0",
                        "min_meters_0",
                        "avg_meters_0",
                        "max_meters_1",
                        "min_meters_1",
                        "avg_meters_1",
                        "max_meters_2",
                        "min_meters_2",
                        "avg_meters_2"
                      ].map((key) => (
                        <th key={key} style={style_th}>{key.replace(/_/g, " ")}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detailsData.efficiency.map((row, index) => (
                      <tr key={index}>
                        {[
                          "material_id",
                          "max_runtime",
                          "min_runtime",
                          "avg_runtime",
                          "time_0",
                          "time_1",
                          "time_2",
                          "%_0",
                          "%_1",
                          "%_2",
                          "max_meters_0",
                          "min_meters_0",
                          "avg_meters_0",
                          "max_meters_1",
                          "min_meters_1",
                          "avg_meters_1",
                          "max_meters_2",
                          "min_meters_2",
                          "avg_meters_2"
                        ].map((key) => (
                          <td key={key} style={style_th_td}>
                            {row[key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Lot Mass Table */}
            {detailsData.lot_mass && Array.isArray(detailsData.lot_mass) && (
              <div>
                <table style={style_table}>
                  <thead>
                    <tr>
                      {[
                        "feedstock_lot_id",
                        "filament_lot",
                        "available",
                        "mass",
                        "total_meters",
                        "gs",
                        "qc",
                        "sc"
                      ].map((key) => (
                        <th key={key} style={style_th}>{key.replace(/_/g, " ")}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detailsData.lot_mass.map((row, index) => (
                      <tr key={index}>
                        {[
                          "feedstock_lot_id",
                          "filament_lot",
                          "available",
                          "mass",
                          "total_meters",
                          "gs",
                          "qc",
                          "sc"
                        ].map((key) => (
                          <td key={key} style={style_th_td}>{row[key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}



          </div>
        )}</div>}
      <div
        className="view-monthly-schedule"
        style={{
          color: "black",
          marginTop: "2rem",
          ...style_schedule_container_header,
        }}
      >
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <div
            key={index}
            style={{ gridRow: "1", gridColumn: index + 1, ...style_days_of_the_week }}
          >
            {day}
          </div>
        ))}
      </div>
      <div
        className="view-monthly-schedule"
        style={{
          color: "black",
          marginTop: "1rem",
          ...style_schedule_container_body,
        }}
      >
        {scheduleOutline &&
          scheduleOutline.map((week, xdx) =>
            week.map((day, ydx) => (
              <div
                key={`${xdx}-${ydx}`}
                style={{
                  gridRow: xdx + 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
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
                  onClick={() => setDateFormatStyle(!dateFormatStyle)}
                >
                  {day
                    ? dateFormatStyle
                      ? moment(day).format("D")
                      : moment(day).format("YYYY-MM-DD")
                    : 0}
                </div>

                {/* Schedule Data */}
                {scheduleData?.monthly_schedule && viewData?.data ?
                  (
                    [1, 2, 3].map((shift) => {
                      const shiftData = viewData?.data[day]?.[shift] || {};

                      return (
                        <div
                          key={`${day}-${shift}`}
                          className="shift-container"
                          style={{
                            gridColumn: ydx + 1,
                            border: "1px solid #d9d9d9",
                            borderRadius: "0.5rem",
                            padding: "0.5rem",
                            overflowY: "auto",
                            backgroundColor:
                              shift === 1
                                ? "transparent"
                                : shift === 2
                                  ? "#F0F0F0"
                                  : "#d9d9d9",
                            flexBasis: "33%",
                            display: "flex",
                            flexDirection: "column",
                            flexGrow: 1,
                            gap: "0.25rem",
                            minHeight: "21rem",
                            fontSize: "1.125rem",
                            opacity: shiftData ? 1 : 0, // Smooth fade-in when data loads
                            transition: "opacity 0.5s ease-in-out",
                          }}
                        >
                          {Object.keys(shiftData).length > 0 ? (
                            Object.keys(shiftData).map((process) =>
                              Object.keys(shiftData[process]).map((line_id) =>
                                Object.keys(shiftData[process][line_id]).map((type) =>
                                  Object.keys(shiftData[process][line_id][type]).map(
                                    (material_id) => (
                                      <div
                                        key={material_id}
                                        className="fade-in"
                                        id={material_id}
                                        style={{
                                          borderRadius: "0.25rem",
                                          color:
                                            type === "unscheduled" &&
                                              material_id in materialColor
                                              ? materialColor[material_id]
                                              : "#ffffff",
                                          border: `1px solid ${material_id in materialColor
                                            ? materialColor[material_id]
                                            : "red"
                                            }`,
                                          backgroundColor:
                                            type === "scheduled"
                                              ? material_id in materialColor
                                                ? materialColor[material_id]
                                                : "transparent"
                                              : material_id in materialColor
                                                ? materialColor[material_id] + "70"
                                                : "red",
                                        }}
                                      >
                                        <div
                                          className=""
                                          style={{
                                            display: "flex",
                                            borderRadius: "inherit",
                                            justifyContent: "space-between",
                                            padding: "0.25rem 0.5rem",
                                          }}
                                        >
                                          <div className="">{line_id} {material_id}</div>
                                          <div className="">
                                            {
                                              shiftData[process][line_id][type][
                                                material_id
                                              ].produced
                                            }{" "}
                                            /{" "}
                                            {
                                              shiftData[process][line_id][type][
                                                material_id
                                              ].goal
                                            }
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )
                                )
                              )
                            )
                          ) : (
                            ""
                          )}
                        </div>
                      );
                    })
                  ) : (
                    // Skeleton Loader
                    [1, 2, 3].map((shift) => (
                      <div
                        key={`skeleton-${day}-${shift}`}
                        className="skeleton-loader"
                        style={{
                          gridColumn: ydx + 1,
                          border: "1px solid #D9D9D9",
                          borderRadius: "0.5rem",
                          padding: "0.5rem",
                          overflowY: "auto",
                          flexBasis: "33%",
                          backgroundColor:
                            shift === 1
                              ? "transparent"
                              : shift === 2
                                ? "#F0F0F0"
                                : "#d9d9d9",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          minHeight: "21rem",
                        }}
                      >
                        {day && [...Array(6)].map((_, idx) => (
                          <div
                            key={`skeleton-item-${idx}`}
                            className="skeleton-box"
                            style={{
                              height: "1.75rem",
                              borderRadius: "0.25rem",
                              background:
                                "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                              backgroundSize: "200% 100%",
                              animation: "skeleton-loading 1.5s infinite",
                            }}
                          ></div>
                        ))}
                      </div>
                    ))
                  )}
              </div>
            ))
          )}
      </div>

    </div>
  );
}
export default View;

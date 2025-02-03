import { useState, useEffect } from "react";
import moment from "moment";
import { materialColor, materialDict, lineColor } from "./materials";
import LineTo from "react-lineto";

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

function Overview() {
  // data state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetched Data
  const [uptimeData, setUptimeData] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [goalsData, setGoalsData] = useState(null);
  const [oeeData, setOeeData] = useState(null);


  // fetched graphs
  const [graphData, setGraphData] = useState({ data: {}, options: {} });
  const [oeeGraphData, setOeeGraphData] = useState({ data: {}, options: {} });


  const [scheduleData, setScheduleData] = useState({});

  // user opts
  const [startDate, setStartDate] = useState(moment().format("2025-01-01"));
  const [endDate, setEndDate] = useState(moment().format("2025-01-30"));
  const [selectedMaterial, setSelectedMaterial] = useState({});
  const [hoveredMaterial, setHoveredMaterial] = useState("ONX");
  const [selectedLineId, setSelectedLineId] = useState([]);

  // default styling
  const transparency = {
    0: "80",
    1: "FF",
  };

  const style_component_root = {
    margin: "5vw",
    fontSmooth: "auto",
    color: "#FFFFFF",
  };

  const style_grid_container = {
    display: "grid",
    gridTemplateColumns: "42% 10% 42%",
    gridTemplateRows: "repeat(12, 1fr)",
    columnGap: "3%",
    rowGap: "3%",
    height: "400vh",
    position: "relative",
  };

  // temp styling
  const style_item_border = {
    // border: "1px solid yellow",
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
    setUptimeData(null);
    fetchData(
      `http://localhost:5000/api/conversion/extruder?line_id=EX03&start_date=${startDate}&end_date=${endDate}&shift=1,2,3`,

      (data) => {
        setUptimeData(data);
        const initialMaterialState = Object.fromEntries(
          Object.keys(data.produced).map((key, index) => [key, index === 0]) // Set the first key to true
        );

        // Use the functional form to update `setSelectedMaterial`
        setSelectedMaterial((prev) => ({
          ...prev,
          ...initialMaterialState,
        }));
        setHoveredMaterial(Object.keys(data.produced)[0]);
      }
    );
  }, [startDate, endDate]);

  useEffect(() => {
    setLoading(true);
    fetchData(
      `http://localhost:5000//api/metrics/oee`,
      (data) => setOeeData(data)
    );
  }, []);

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

  useEffect(() => {
    setLoading(true);
    fetchData(
      `http://localhost:5000/api/schedule?start_date=${startDate}&end_date=${endDate}`,
      (data) => setScheduleData(data)
    );
  }, [startDate, endDate]);

  useEffect(() => {
    // Ensure oeeData is available before processing
    if (oeeData && oeeData.data) {
      const labels = [...new Set(oeeData?.data?.map((item) => item.month))]; // Extract unique months for X-axis
      const lineIds = [...new Set(oeeData?.data?.map((item) => item.line_id))]; // Extract unique line IDs
  
      const datasets = lineIds.map((lineId) => {
        const lineData = oeeData.data.filter((item) => item.line_id === lineId);
  
        return {
          label: lineId, // Line ID as the dataset label
          data: labels.map((month) => {
            const monthData = lineData.find((item) => item.month === month);
            return monthData ? parseFloat(monthData.oee_ratio) : null; // Use `oee_ratio` or null if missing
          }),
          borderColor: lineColor[lineId], // Line color
          backgroundColor: lineColor[lineId] + "80", // Transparent background color
          tension: 0.4, // Smooth curve
          fill: false, // Line graph, no fill
        };
      });
  
      const data = {
        labels, // Months as X-axis labels
        datasets, // Datasets for each line
      };
  
      const options = {
        responsive: true,
        // maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: "OEE Ratio", // Y-axis title
              color: "#FFFFFF",
            },
            grid: {
              color: "#FFFFFF0D", // Gridlines color
            },
            ticks: {
              color: "#FFFFFFCC",
              font: {
                size: 16,
              },
            },
          },
          x: {
            title: {
              display: true,
              // text: "Month", // X-axis title
              color: "#FFFFFF",
            },
            grid: {
              color: "#FFFFFF0D", // Gridlines color
            },
            ticks: {
              color: "#FFFFFF80",
              font: {
                size: 16,
              },
            },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#FFFFFF",
              font: {
                size: 16,
              },
            },
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) =>
                `OEE Ratio: ${context.raw !== null ? context.raw.toFixed(4) : "N/A"}`, // Tooltip format
            },
          },
        },
      };
  
      setOeeGraphData({ data, options }); // Set the graph data
    }
  }, [oeeData]);
  

  useEffect(() => {
    // Check if metricsData is available, and if so, execute the graph code
    if (metricsData && metricsData["timeline"]) {
      const translateShift = {
        1: {
          start_time: "07:00:00.000000",
          end_time: "15:00:00.000000",
          duration: 8,
          date_offset: 0,
        },
        2: {
          start_time: "15:00:00.000000",
          end_time: "23:00:00.000000",
          duration: 8,
          date_offset: 0,
        },
        3: {
          start_time: "23:00:00.000000",
          end_time: "07:00:00.000000",
          duration: 8,
          date_offset: 1,
        },
      };
      const labels = Object.keys(metricsData["timeline"].ONX); // Dates
      const datasets = [];

      for (let material in metricsData["timeline"]) {
        const materialData = {
          label: material,
          data: [],
          borderColor: materialColor[material], // You can assign different colors for each material
          backgroundColor: materialColor[material],
        };

        const ratesData = {
          label: `${material} rate`,
          data: [],
          borderColor: materialColor[material] + "80", // You can assign different colors for each material
          backgroundColor: materialColor[material] + "80",
        };

        // Iterate through dates and shifts for the material
        // TODO: this splits into thirds by the available shifts
        // labels.forEach((date) => {
        //   let shiftData = [];
        //   for (let shift in translateShift) {
        //     const shiftSpools = metricsData["timeline"][material][date][shift];
        //     const totalSpools = Object.values(shiftSpools).reduce(
        //       (sum, count) => sum + count,
        //       0
        //     ); // Sum of spools across statuses
        //     shiftData.push(totalSpools);
        //   }
        //   materialData.data.push(shiftData);
        // });

        labels.forEach((date) => {
          // Aggregate all shift data into a single value for the current date
          let totalSpoolsForDate = 0;

          const material_operating_days = Object.keys(
            metricsData["timeline"][material]
          ).length;
          console.log("material_operating", material_operating_days);

          for (let shift in translateShift) {
            const shiftSpools =
              metricsData["timeline"][material][date][shift] || {};
            const totalSpools = Object.values(shiftSpools).reduce(
              (sum, count) => sum + count,
              0
            ); // Sum of spools across statuses
            totalSpoolsForDate += totalSpools; // Add to the total for the current date
          }

          materialData.data.push(totalSpoolsForDate); // Push the aggregated total into the dataset

          //   console.log(material, scheduleData.rate[material], goalsData.raw[material])
          if (totalSpoolsForDate > 0 ) {
            ratesData.data.push(
                (scheduleData.rate[material] * goalsData.raw[material]) /
                  scheduleData.days[material]
              );
          } else {
            ratesData.data.push(
                0
            )
          }

        });
        // console.log("materialslice", materialData)
        // console.log("materialslice", ratesData)

        datasets.push(materialData);
        // datasets.push(ratesData);
        console.log(Object.keys(goalsData.raw));
        // console.log("material", material, materialData);
      }

      const data = {
        labels, // Dates as labels on X-axis
        datasets, // Datasets for each material
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              //   text: 'Good spool count',
              color: "#FFFFFF", // Sets the title color to white
            },
            grid: {
              display: true,
              color: "#FFFFFF0D", // Gridlines color
              lineWidth: 1,
            },
            ticks: {
              color: "#FFFFFFCC", // Sets tick labels color to white
              font: {
                size: 16,
              },
            },
            border: {
              // display: true,
              // color: "#FFFFFF", // Bottom axis baseline color
            },
          },
          x: {
            grid: {
              display: true,
              color: "#FFFFFF0D", // Gridlines color
              lineWidth: 1,
            },
            ticks: {
              color: "#FFFFFF80", // Sets tick labels color to white
              font: {
                size: 12,
              },
            },
            border: {
              display: true,
              color: "#FFFFFF", // Bottom axis baseline color
            },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: {
                size: 16,
              },
              color: "#FFFFFF",
            },
          },
          title: {
            display: true,
            // text: `${startDate} - ${endDate}`,
            color: "#FFFFFF",
            position: "top",
            align: "start",
            font: {
              size: 16,
              weight: 400,
            },
            padding: {
              top: 10,
              bottom: 20,
            },
          },
          tooltip: {
            enabled: true,
            bodyFont: {
              size: 16,
            },
            titleFont: {
              size: 18,
              weight: "bold",
            },
            padding: 12,
            boxPadding: 6,
          },
        },
      };

      setGraphData({ data: data, options: options });
    }
  }, [metricsData, startDate, endDate, scheduleData]);




  const calculateFlexBasis = (produced, goal) => {
    const producedCount = produced || 0;
    const goalValue = goal || 0;
    return goalValue > 0 ? `${(producedCount * 100) / goalValue}%` : "0%";
  };

  return (
    <div style={{ ...style_grid_container, ...style_component_root }}>
      <div
        className="component-capacity"
        style={{
          ...style_item_border,
          gridColumn: "1 / 2",
          gridRow: "1 / 5",
          display: "flex",
          gap: "25%",
        }}
      >
        <div
          style={{
            display: "flex",
            border: "1px solid #FFFFFF",
            flexDirection: "column",
            flexBasis: "15%",
            justifyContent: "flex-end",
          }}
        >
          {uptimeData &&
            selectedMaterial &&
            Object.keys(uptimeData.produced).map((material_id, index) => (
              <div
                key={index}
                className={`A${index}`}
                id={`${material_id}-box`}
                style={{
                  borderTop: `0.5px solid #FFFFFF80`,
                  flexBasis: `${uptimeData.produced[material_id].percent}%`,
                  display: "flex",
                  backgroundColor:
                    materialColor[material_id] +
                    (selectedMaterial[material_id] ? "FF" : "BF"),
                  fontSize:
                    selectedMaterial[material_id] ||
                    hoveredMaterial === material_id
                      ? "3rem"
                      : "2rem",
                  fontWeight:
                    selectedMaterial[material_id] ||
                    hoveredMaterial === material_id
                      ? "400"
                      : "200",
                }}
                onClick={() => {
                  // Toggle font weight
                  const e_material_label = document.getElementById(material_id);

                  if (!selectedMaterial[material_id]) {
                    e_material_label.style.fontWeight = "400";
                    e_material_label.style.fontSize = "3rem";
                  } else {
                    e_material_label.style.fontWeight = "200";
                    e_material_label.style.fontSize = "3rem";
                  }

                  // Update the state of the selectedMaterial dictionary
                  setSelectedMaterial((prev) => {
                    return {
                      ...prev, // Spread the previous state
                      [material_id]: !prev[material_id], // Toggle the value of the selected material
                    };
                  });
                }}
                onMouseOver={() => {
                  // Toggle font weight
                  const e_material_label = document.getElementById(material_id);

                  e_material_label.style.fontWeight = "400";

                  // Toggle font size
                  e_material_label.style.fontSize = "3rem";

                  // Update the state of the selectedMaterial dictionary
                  setHoveredMaterial(material_id);
                }}
                onMouseOut={() => {
                  if (!selectedMaterial[material_id]) {
                    const e_material_label =
                      document.getElementById(material_id);

                    // Toggle font weight
                    e_material_label.style.fontWeight = "200";

                    // Toggle font size
                    e_material_label.style.fontSize = "2rem";

                    // Update the state of the selectedMaterial dictionary
                    setHoveredMaterial(material_id);
                  }
                }}
              >
                {/* <div style={{}}>{material}</div> */}
                {/* <div style={{}}>{uptimeData.produced[material].percent}</div> */}
                {/* <div style={{}}>{uptimeData.produced[material].run_time}</div> */}
              </div>
            ))}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexBasis: "70%",
            flexGrow: 1,
            justifyContent: "flex-end",
          }}
        >
          {uptimeData &&
            selectedMaterial &&
            Object.keys(uptimeData.produced).map((material_id, index) => (
              <div
                key={index}
                id={material_id}
                className={`B${index}`}
                style={{
                  flexBasis: `${Math.max(
                    uptimeData.produced[material_id].percent,
                    60 / Object.keys(uptimeData.produced).length
                  )}%`,
                  display: "flex",
                  fontSize: selectedMaterial[material_id] ? "3rem" : "2rem",
                  fontWeight: selectedMaterial[material_id] ? 400 : 200,
                  justifyContent: "left",
                  alignItems: "center",
                  paddingLeft: "0.5rem",
                }}
              >
                <div
                  onClick={(e) => {
                    if (!selectedMaterial[material_id]) {
                      e.currentTarget.style.fontWeight = "400";
                      e.currentTarget.style.fontSize = "3rem";
                    } else {
                      e.currentTarget.style.fontWeight = "200";
                      e.currentTarget.style.fontSize = "2rem";
                    }

                    // Update the state of the selectedMaterial dictionary
                    setSelectedMaterial((prev) => {
                      return {
                        ...prev, // Spread the previous state
                        [material_id]: !prev[material_id], // Toggle the value of the selected material
                      };
                    });
                  }}
                  onMouseEnter={(e) => {
                    // Toggle font weight
                    e.currentTarget.style.fontWeight = "400";

                    // Toggle font size
                    e.currentTarget.style.fontSize = "3rem";

                    // Update the state of the selectedMaterial dictionary
                    const e_material_label = document.getElementById(
                      `${material_id}-box`
                    );
                    e_material_label.style.backgroundColor =
                      materialColor[material_id] +
                      (selectedMaterial[material_id] ? "FF" : "BF");

                    setHoveredMaterial(material_id);
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedMaterial[material_id]) {
                      // Toggle font weight
                      e.currentTarget.style.fontWeight = "200";

                      // Toggle font size
                      e.currentTarget.style.fontSize = "2rem";

                      const e_material_label = document.getElementById(
                        `${material_id}-box`
                      );
                      e_material_label.style.backgroundColor =
                        materialColor[material_id] +
                        (selectedMaterial[material_id] ? "FF" : "BF");

                      // Update the state of the selectedMaterial dictionary
                      setHoveredMaterial(material_id);
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "start",
                    }}
                  >
                    <div className="" style={{}}>
                      {materialDict[material_id]}
                    </div>
                    <div
                      className=""
                      style={{ fontSize: "50%", fontWeight: 300 }}
                    >
                      {material_id}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div style={{ borderRadius: "10px", overflow: "hidden" }}>
          {uptimeData &&
            Object.keys(uptimeData.produced).map(
              (material, index) =>
                uptimeData && (
                  <LineTo
                    delay={1}
                    key={index}
                    from={`A${index}`}
                    to={`B${index}`}
                    fromAnchor="102%"
                    toAnchor="-5%"
                    orientation="h"
                    borderColor={materialColor[material]}
                    borderWidth={2}
                  />
                )
            )}
        </div>
      </div>
      <div
        className="component-attainment"
        style={{
          ...style_item_border,
          gridColumn: "1 / 2",
          gridRow: "5 / 7",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div className="component-title" style={{ fontWeight: 200 }}>
          attainment
        </div>

        <div className="" style={{ fontSize: "5rem", fontWeight: 200 }}>
          {/* 580/800 */}
          {uptimeData && uptimeData.produced[hoveredMaterial].count["gs"]}/
          {goalsData && goalsData?.raw[hoveredMaterial]
            ? goalsData?.raw[hoveredMaterial]
            : "add goal"}
        </div>
        <div className="" style={{ fontWeight: 200 }}>
          Scrapped
        </div>
        <div className="" style={{ fontSize: "1.5rem", fontWeight: 400 }}>
          {/* 120/800 */}
          {uptimeData && uptimeData.produced[hoveredMaterial].count["sc"]}/
          {goalsData && goalsData?.raw[hoveredMaterial]
            ? goalsData?.raw[hoveredMaterial]
            : "add goal"}
        </div>
        <div className="" style={{ fontWeight: 200 }}>
          Quality Control
        </div>
        <div className="" style={{ fontSize: "1.5rem", fontWeight: 400 }}>
          {/* 50/800 */}
          {uptimeData && uptimeData.produced[hoveredMaterial].count["wip"]}/
          {goalsData && goalsData?.raw[hoveredMaterial]
            ? goalsData?.raw[hoveredMaterial]
            : "add goal"}
        </div>
      </div>
      <div
        className="component-uptime"
        style={{
          ...style_item_border,
          gridColumn: "1 / 2",
          gridRow: "7 / 9",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div className="component-title" style={{ fontWeight: 200 }}>
          uptime
        </div>
        <div className="" style={{ fontSize: "5rem", fontWeight: 200 }}>
          96%
        </div>
        <div className="" style={{ fontWeight: 200 }}>
          - 3% Network issues
        </div>
        <ul>
          <li>EX03</li>
          <li>EX04</li>
        </ul>
        <div className="" style={{ fontWeight: 200 }}>
          - 1% Spool length Failure
        </div>
        <ul>
          <li>EX00</li>
        </ul>
      </div>
      <div
        className="component-yield"
        style={{
          ...style_item_border,
          display: "flex",
          gridColumn: "1 / 2",
          gridRow: "9 / 11",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div className="component-title" style={{ fontWeight: 200 }}>
          yield - {hoveredMaterial}
        </div>
        <div
          className=""
          style={{ fontSize: "5rem", color: materialColor[hoveredMaterial], fontWeight: 200 }}
        >
          {metricsData &&
            metricsData.meters_scanned &&
            `${(
              (parseFloat(metricsData.meters_scanned[hoveredMaterial][0]) *
                100) /
              (parseFloat(metricsData.meters_scanned[hoveredMaterial][0]) +
                parseFloat(metricsData.meters_scanned[hoveredMaterial][1]) +
                parseFloat(metricsData.meters_scanned[hoveredMaterial][2]))
            ).toFixed(2)}%`}
        </div>
        <div className="" style={{}}>
          Scrap Rate:{" "}
          {metricsData &&
            metricsData.meters_scanned &&
            `${(
              (parseFloat(metricsData.meters_scanned[hoveredMaterial][2]) *
                100) /
              (parseFloat(metricsData.meters_scanned[hoveredMaterial][0]) +
                parseFloat(metricsData.meters_scanned[hoveredMaterial][1]) +
                parseFloat(metricsData.meters_scanned[hoveredMaterial][2]))
            ).toFixed(2)}%`}
        </div>
        <div className="" style={{}}>
          Primary Reason: wip -- [spool too short], [out of spec low]
        </div>
        <div className="" style={{}}>
          QC rate:{" "}
          {metricsData &&
            metricsData.meters_scanned &&
            `${(
              (parseFloat(metricsData.meters_scanned[hoveredMaterial][1]) *
                100) /
              (parseFloat(metricsData.meters_scanned[hoveredMaterial][0]) +
                parseFloat(metricsData.meters_scanned[hoveredMaterial][1]) +
                parseFloat(metricsData.meters_scanned[hoveredMaterial][2]))
            ).toFixed(2)}%`}
        </div>
        <div className="">
          meters on spool yield:{" "}
          {metricsData &&
            metricsData.meters_on_spool &&
            `${(
              (parseFloat(metricsData.meters_on_spool[hoveredMaterial][0]) *
                100) /
              (parseFloat(metricsData.meters_on_spool[hoveredMaterial][0]) +
                parseFloat(metricsData.meters_on_spool[hoveredMaterial][1]) +
                parseFloat(metricsData.meters_on_spool[hoveredMaterial][2]))
            ).toFixed(2)}%`}
        </div>
      </div>
      {/* From the schedule */}
      <div
        className="component-weekly"
        style={{
          ...style_item_border,
          gridColumn: "2 / 4",
          gridRow: "1 / 1",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* title */}
        <div
          className="component-title"
          style={{ fontWeight: 400, marginBottom: "0.5rem" }}
        >
          range ({`${startDate} ${endDate}`})
        </div>
        {/* top row */}
        <div
          className=""
          style={{
            display: "flex",
            height: "2rem",
          }}
        >
          <div
            className=""
            style={{
              flexBasis: calculateFlexBasis(
                uptimeData?.produced[hoveredMaterial]?.count["wip"],
                goalsData?.raw[hoveredMaterial]
              ),
              backgroundColor: materialColor[hoveredMaterial] + "BF",
              border: `1px solid ${materialColor[hoveredMaterial]}`,
            }}
          ></div>
          <div
            className=""
            style={{
              flexBasis: calculateFlexBasis(
                uptimeData?.produced[hoveredMaterial]?.count["gs"],
                goalsData?.raw[hoveredMaterial]
              ),
              backgroundColor: materialColor[hoveredMaterial],
              border: `1px solid ${materialColor[hoveredMaterial]}`,
            }}
          ></div>
          <div
            className=""
            style={{
              flexBasis: calculateFlexBasis(
                uptimeData?.produced[hoveredMaterial]?.count["sc"],
                goalsData?.raw[hoveredMaterial]
              ),
              backgroundColor: materialColor[hoveredMaterial] + "80",
              border: `1px solid ${materialColor[hoveredMaterial]}`,
            }}
          ></div>
          <div
            className=""
            style={{
              flexGrow: 1,
              borderRight: "1px solid #FFFFFF99",
              borderTop: "1px solid #FFFFFF99",
              borderBottom: "1px solid #FFFFFF99",
            }}
          ></div>
        </div>
        {/* middle tick */}
        <div
          className=""
          style={{
            display: "flex",
            borderRight: "1px solid #FFFFFF99",
            height: "1.5rem",
          }}
        >
          <div
            className=""
            style={{
              flexBasis: calculateFlexBasis(
                uptimeData?.produced[hoveredMaterial]?.count["wip"],
                goalsData?.raw[hoveredMaterial]
              ),
              justifyContent: "flex-end",
              borderRight: "1px solid white",
              borderRightColor: materialColor[hoveredMaterial] + "BF",
            }}
          ></div>
          <div
            className=""
            style={{
              flexBasis: calculateFlexBasis(
                uptimeData?.produced[hoveredMaterial]?.count["gs"],
                goalsData?.raw[hoveredMaterial]
              ),
              justifyContent: "flex-end",
              borderRight: "1px solid white",
              borderRightColor: materialColor[hoveredMaterial],
            }}
          ></div>
          <div
            className=""
            style={{
              flexBasis: calculateFlexBasis(
                uptimeData?.produced[hoveredMaterial]?.count["sc"],
                goalsData?.raw[hoveredMaterial]
              ),
              justifyContent: "flex-end",
              borderRight: "1px solid white",
              borderRightColor: materialColor[hoveredMaterial] + "80",
            }}
          ></div>
        </div>
        {/* bottom tick */}
        <div
          className=""
          style={{ display: "flex", height: "1.5rem", textAlign: "flex-end" }}
        >
          <div
            className=""
            style={{
              flexBasis: calculateFlexBasis(
                uptimeData?.produced[hoveredMaterial]?.count["wip"],
                goalsData?.raw[hoveredMaterial]
              ),
              justifyContent: "flex-end",
              textAlign: "right",
            }}
          >
            <span>
              {" "}
              {JSON.stringify(
                uptimeData?.produced[hoveredMaterial]?.count["wip"]
              )}
            </span>{" "}
            <span></span>
          </div>
          <div
            className=""
            style={{
              flexBasis: calculateFlexBasis(
                uptimeData?.produced[hoveredMaterial]?.count["gs"],
                goalsData?.raw[hoveredMaterial]
              ),
              justifyContent: "flex-end",
              textAlign: "right",
            }}
          >
            <span className="">
              {JSON.stringify(
                uptimeData?.produced[hoveredMaterial]?.count["gs"]
              )}
            </span>{" "}
            <span></span>
          </div>
          <div
            className=""
            style={{
              flexBasis: calculateFlexBasis(
                uptimeData?.produced[hoveredMaterial]?.count["sc"],
                goalsData?.raw[hoveredMaterial]
              ),
              justifyContent: "flex-end",
              textAlign: "right",
            }}
          >
            <span>
              {JSON.stringify(
                uptimeData?.produced[hoveredMaterial]?.count["sc"]
              )}
            </span>
            <span></span>
          </div>
          <div
            className=""
            style={{ textAlign: "right", flexGrow: 1, paddingLeft: "10px" }}
          >
            {goalsData?.raw[hoveredMaterial]}
          </div>
        </div>
        {/* targeting */}
        
        {hoveredMaterial && uptimeData &&  <div
          className=""
          style={{
            display: "flex",
            height: "2rem",
          }}
        >
          <div
            className=""
            style={{
              flexBasis: `${scheduleData.rate[hoveredMaterial] * 100}%`,
              borderRight: `1px solid #FFFFFF`,

            }}
          ></div>
        </div>}
        {hoveredMaterial && uptimeData &&  <div
          className=""
          style={{
            display: "flex",
            height: "2rem",
            textAlign: "right",
            marginLeft: "1rem",
          }}
        >
          <div
            className=""
            style={{
              flexBasis: `${scheduleData.rate[hoveredMaterial] * 100}%`,
            }}
          >{(scheduleData.rate[hoveredMaterial] * scheduleData.raw[hoveredMaterial]).toFixed(0)}</div>
        </div>}
      </div>
      <div
        className="component-graph"
        style={{
          ...style_item_border,
          gridColumn: "2 / 4",
          gridRow: "2 / 5",
          color: "#FFFFFF",
          // borderRight: "1px solid white",
        }}
      >
        {/* TODO: this wont work if the date range is 0 days I think */}
        {graphData &&
          Object.keys(graphData.options).length &&
          Object.keys(graphData.data).length && (
            <Line options={graphData.options} data={graphData.data} />
          )}
      </div>
      <div
        className="component-extruders"
        style={{
          ...style_item_border,
          gridColumn: "2 / 4",
          gridRow: "5 / 10",
          color: "white",
        }}
      >
        <div className="" style={{ display: "flex", gap: "5%" }}>
          <div
            className="labels"
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "column",
            }}
          >
            <div className="">Wed</div>
            <div className="">Tue</div>
            <div className="">Mon</div>
            <div className="">Fri</div>
            <div className="">Thu</div>
          </div>
          {metricsData && metricsData.raw ? (
            Object.keys(metricsData.raw).map((line, index) => (
              <div key={index} className="extruders" style={{ width: "10%" }}>
                <div className="" style={{ marginBottom: "1rem" }}>
                  {line.substring(2, 4)}
                </div>
                {/* <div className="">{JSON.stringify(metricsData[line])}</div> */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    position: "realative",
                    height: "100vh",
                    border: "1px solid #FFFFFF",
                  }}
                >
                  {metricsData.raw[line].map((entry, index) =>
                    entry["state"] === "running" ? (
                      <div
                        key={index}
                        style={{
                          background: materialColor[entry["material_id"]],
                          content: "",
                          flexBasis:
                            entry["relative_end"] - entry["relative_start"],
                        }}
                      ></div>
                    ) : (
                      <div
                        style={{
                          content: "",
                          flexBasis:
                            entry["relative_end"] - entry["relative_start"],
                        }}
                      ></div>
                    )
                  )}
                </div>
{/* 
                {metricsData.raw[line].state === "running" ? (
                  <div>hi</div>
                ) : (
                  <div>hoo</div>
                )} */}
              </div>
            ))
          ) : (
            <div>loading...</div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexDirection: "column",
            width: "fit-content",
            paddingTop: "2rem",
          }}
        ></div>
      </div>
      <div
        className="component-availibility"
        style={{
          ...style_item_border,
          gridColumn: "2 / 4",
          gridRow: "10 / 11",
          color: "white",
        }}
      >
        availibility goes here...
      </div>
      <div
        className="component-debug"
        style={{
          ...style_item_border,
          gridColumn: "1/4",
          gridRow: "11 / 11",
        }}
      >


      {oeeGraphData &&
          Object.keys(oeeGraphData.options).length &&
          Object.keys(oeeGraphData.data).length && (
            <Line options={oeeGraphData.options} data={oeeGraphData.data} />
          )}

      </div>
      <div
        className="component-debug"
        style={{
          ...style_item_border,
        }}
      >
        <pre>
          uptimeData:{" "}
          {uptimeData && JSON.stringify(uptimeData.working, null, 4)},
        </pre>
        <pre>
          goalsData: {goalsData && JSON.stringify(goalsData.raw, null, 4)},
        </pre>
        <pre>
          ratesData:{" "}
          {scheduleData && JSON.stringify(scheduleData.rate, null, 4)},
        </pre>
      </div>
      {/* <div className="">helooo</div> */}
    </div>
  );
}
export default Overview;

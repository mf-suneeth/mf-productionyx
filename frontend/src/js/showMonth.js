import React, { Fragment, useEffect, useState } from "react";

function ShowMonth() {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goals, setGoals] = useState(null);
  const [frequency, setFrequency] = useState(null);
  const [productionData, setProductionData] = useState(null); // State for second fetch


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Run both fetch calls in parallel
        const [currentResponse, extraResponse] = await Promise.all([
          fetch("http://localhost:5000/api/current?start_date=2024-11-01&end_date=2024-11-30"),
          fetch("http://localhost:5000/api/current/extrusion"), // Second endpoint
        ]);

        // Handle response errors for each fetch
        if (!currentResponse.ok) {
          throw new Error(
            `Current API response not ok: ${currentResponse.statusText}`
          );
        }
        if (!extraResponse.ok) {
          throw new Error(
            `Extra API response not ok: ${extraResponse.statusText}`
          );
        }

        // Parse the responses
        const currentResult = await currentResponse.json();
        const extraResult = await extraResponse.json();

        // Set state for both results
        setScheduleData(currentResult.scheduled); // Adjust based on API response structure
        setGoals(currentResult.goals);
        setFrequency(currentResult.frequency)
        setProductionData(extraResult.data); // Data from the second fetch
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    productionData && scheduleData && (
      <div
        className="data-fetcher"
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          justifyContent: "center",
          margin: "2rem",
          // backgroundColor: "pink",
        }}
      >
        {scheduleData.map((schedule) => (
          <div
            key={schedule.id}
            className=""
            style={{
              display: "flex",
              border: "1px solid grey",
              justifyContent: "space-between",
              borderRadius: "0.5rem",
              padding: "1rem 2rem",
              backgroundColor: "lightGrey",
              marginBottom: "1rem",
            }}
          >
            <div className="" style={{flexBasis: "15%"}}>{schedule?.date ?? `missing date`}</div>
            <div className="" style={{flexBasis: "10%"}}>{schedule?.line ?? `missing line`}</div>
            <div className="" style={{flexBasis: "10%"}}>{schedule?.material_id ?? `missing material_id`}</div>
            <div className="" style={{flexBasis: "10%"}}>{goals?.[schedule?.material_id] ?? `missing goals or material_id`}</div>
            <div className="" style={{flexBasis: "10%", color: "blue"}}>t: {((productionData?.[schedule.date]?.[schedule.line]?.["gs"] ?? `missing entry ${schedule.date}`) * 100/ (goals?.[schedule?.material_id] ?? `missing goals or material_id`)).toFixed(2)}%</div>
            <div className="" style={{flexBasis: "10%", color: "blue"}}>d: {((productionData?.[schedule.date]?.[schedule.line]?.["gs"] ?? `missing entry ${schedule.date}`) * 100/ ((goals?.[schedule?.material_id] ?? `missing goals or material_id`)/ (frequency?.[schedule?.material_id])/2 ?? `missing frequency`)).toFixed(2)}%</div>
            <div className="" style={{flexBasis: "10%"}}>{schedule?.shift ?? `missing shift`}</div>
            <div className="" style={{flexBasis: "10%"}}>{(frequency?.[schedule?.material_id])/2 ?? `missing frequency`}</div>
            {/* <div className="" style={{flexBasis: "25%"}}>{JSON.stringify(productionData?.[schedule.date]?.[schedule.line] ?? `missing entry ${schedule.date}`)}</div> */}
            <div className="" style={{flexBasis: "10%", display: 'flex'}}>
              <div className="">{productionData?.[schedule.date]?.[schedule.line]?.["gs"] ?? `missing entry ${schedule.date}`} | </div>
              <div className="">{productionData?.[schedule.date]?.[schedule.line]?.["qc"] ?? `missing entry ${schedule.date}`} | </div>
              <div className="">{productionData?.[schedule.date]?.[schedule.line]?.["sc"] ?? `missing entry ${schedule.date}`} </div>
            </div>
          </div>
        ))}
        <pre>{JSON.stringify(scheduleData, null, 2)}</pre>
        <pre>{JSON.stringify(goals, null, 2)}</pre>
        <pre>{JSON.stringify(productionData, null, 2)}</pre>{" "}
        <pre>{JSON.stringify(frequency, null, 2)}</pre>{" "}
        {/* Display second fetch data */}
        <div className="">{JSON.stringify(Object.keys(productionData))}</div>
      </div>
    )
  );
}

export default ShowMonth;

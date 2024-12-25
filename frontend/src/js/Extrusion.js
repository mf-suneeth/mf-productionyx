import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Dropdown from "./Dropdown"; // Adjust the path as per your file structure
import moment from 'moment';


// General styling
const style_content = {
    display: "flex",
    flexDirection: "column",
    padding: "0 5vw",
    backgroundColor: "#000000",
    color: "#FFF",
    height: "auto"
};

const style_extruder_title = {
    fontSize: "3vw",
    fontWeight: "700",
    padding: "2rem 0"
}

const style_spool_box_wrapper = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(2.2vw, 2.2vw))", // Auto-fit columns, minimum 24px width
    gap: "0.4vw", // Optional spacing between boxes
    // justifyContent: "center", // Center the grid
    alignItems: "center", // Align items in the grid
    overflow: "visible", // Ensure tooltips are not clipped
};

const style_oven_spool_box_grid = {
    display: "flex",
    flexWrap: "wrap",
    // gridTemplateColumns: "repeat(auto-fit, minmax(2vw, 1fr))", // Auto-fit columns, minimum 24px width
    gap: "0.4vw", // Optional spacing between boxes
    justifyContent: "start", // Center the grid
    alignItems: "center", // Align items in the grid
    overflow: "visible", // Ensure tooltips are not clipped
    // flexBasis: "30%",
    // flexGrow: 1 
};

const style_spool_box = {
    position: "relative", // Ensure the tooltip positions relative to the box
    border: "1px solid #169C38",
    aspectRatio: "1 / 1", // Keeps the box square
    width: "100%", // Full width of grid cell
};

const style_live_spool_box = {
    position: "relative", // Ensure the tooltip positions relative to the box
    // border: "1px solid #169C38",
    // aspectRatio: "8 / 1", // Keeps the box square
    // width: "100%", // Full width of grid cell
    // marginTop: "8.6rem",
    display: "flex",
    flexDirection: "row",
    gap: "1rem",
    flexGrow: 1,
    paddingTop: "20vh",
    // border: "1px solid orange",

};

const style_oven_box = {
    // border: "1px solid green",
    position: "relative", // Required for the aspect ratio trick
    backgroundColor: "#1F1F1F", // Grey color for the boxes
    border: "1px solid #333333",
    justifyContent: "center",
    alignItems: "center",
    color: "#FFF",
    textAlign: "center",
    aspectRatio: "1 / 1", // Keeps the box square
};

const style_oven_box_inner = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
    color: "#FFF", // Text color
    zIndex: 1,
};


const style_tooltip = {
    position: "absolute", // Escape the grid cell
    top: "110%", // Place tooltip below the box
    left: "50%",
    // transform: "translateX(-50%)",
    backgroundColor: "#141414",
    color: "#FFF",
    padding: "1rem 0.75rem",
    borderRadius: "4px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    whiteSpace: "nowrap",
    fontSize: "1rem",
    zIndex: 10,
    display: "none", // Initially hidden
    // border: "1px solid blue",
    // width: "20vw"
};

const style_failure_mode_set = {
    display: 'flex',
    flexDirection: "row",
    alignItems: "center",
    gap: "1rem",
    margin: "1rem 0rem",
    flexWrap: "wrap",
}

const style_button_mode = {
    color: "white",
    padding: "0.5rem 0.75rem",
    border: "0.5px solid #333333",
    fontWeight: "600",
    display: "flex",
    flexDirection: "row",
    gap: "0.5rem"
}

const style_button_x = {
    // backgroundColor: "grey",
    color: "white",
    borderRadius: "1rem",
    border: "1px solid white",
    padding: "0rem 0.25rem",
    cursor: "grab",
}


////// Table styling
const style_table = {
    width: "100%",
    borderCollapse: "collapse",
    margin: "0.5rem 0",
    fontSize: "1rem",
    fontFamily: "Arial, sans-serif",
    // boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "2px",
    overflow: "hidden",
}

const style_table_header_row = {
    backgroundColor: "#000",
    color: "#FFF",
    textAlign: "left",
    fontWeight: "bold",
}

const style_table_header_data = {
    padding: "12px 15px",
    fontWeight: "bold",
    // borderBottom: "2px solid #444",
    // border: "1px solid #333333",
    backgroundColor: "#111111"
}

// error styles
const style_error_box = {
    fontSize: "1.5rem",
    color: "#FFEB3B",
    fontWeight: "bold"

}

const spool_time = {
    "174": { "EX00": [349.5094, 332.7376, 524.9048, 510.9524, 501.9351, 490.2568] },
    "17F": { "EX00": [700.0123, 685.3257, 6315.2308, 6299.8876, 1007.9285, 992.39] },
    "316": { "EX00": [459.1389, 446.3611, 751.9688, 738.375, 665.9316, 660.6838] },
    "625": { "EX00": [361.0074, 338.2797, 4937.0, 4938.5, 394.2014, 403.446] },
    "820": {
        "EX00": [680.129, 660.0323, 145.3333, 150.0, 781.25, 520.3611],
        "EX01": [null, null, null, null, 177.1111, 160.4444]
    },
    "A20": { "EX00": [380.2847, 351.4097, 359.5, 352.5, 874.2526, 863.8316] },
    "AO1": {
        "EX00": [403.2092, 379.8234, 387.0, 362.0, 489.9064, 444.9872],
        "EX01": [145.5, 120.5, null, null, 169.5, 221.5]
    },
    "CPR": { "EX00": [423.4241, 407.4342, 441.0, 420.8571, 870.5924, 854.3992] },
    "D20": { "EX00": [396.9589, 371.5685, 519.0, 518.0, 489.9496, 472.9928] },
    "DTS": { "EX00": [738.9618, 719.7176, 1916.8611, 1916.0278, 987.6149, 1011.5021] },
    "ES2": { "EX00": [662.6975, 605.7782, 633.7941, 620.2941, 508.5884, 442.2866] },
    "ESD": { "EX00": [769.3348, 811.7674, 6847.1176, 1441.5294, 750.6027, 607.1545] },
    "G16": {
        "EX00": [494.0092, 473.8252, 5059.1667, 5011.2083, 517.9291, 356.2601],
        "EX01": [661.5, 637.1, null, null, 869.9167, 924.2708]
    },
    "H13": {
        "EX00": [352.4894, 334.5835, 8297.3793, 8343.069, 600.0678, 604.9266]
    },
    "HTS": { "EX00": [734.8717, 716.8182, 519.1105, 499.9186, 847.3172, 811.9131] },
    "OFA": { "EX01": [509.7055, 515.4209, 43.0, 47.5, 1327.4444, 1538.0654] },
    "OFR": {
        "EX00": [null, null, null, null, 1383.6316, 1012.4737],
        "EX01": [507.7915, 513.4553, 600.7407, 624.8519, 890.4771, 983.1715]
    },
    "ONX": {
        "EX00": [null, null, 175.8, 169.6, 856.4444, 856.0],
        "EX01": [413.2847, 419.0276, 458.3265, 463.6327, 1805.7376, 1844.1269],
        "EX03": [181.518, 190.4767, 2570.4474, 2579.3158, 1041.365, 3648.6921],
        "EX04": [180.3995, 189.1607, 184.6701, 193.567, 948.5829, 5277.2783]
    },
    "OXL": {
        "EX03": [734.6161, 751.8452, 724.6111, 744.5, 1014.9091, 584.3631]
    }
};

  


const getBoxStyle = (status, failureMode, hoveredFailureMode, hoveredTableSpool, spoolId) => {
    if (hoveredTableSpool && hoveredTableSpool === spoolId) {
        // Highlight only the hovered spool
        return { backgroundColor: "#FFF", color: "#000", border: "1px solid #FFF" };
    }

    if (hoveredFailureMode && failureMode === hoveredFailureMode) {
        // Highlight based on failure mode
        return { backgroundColor: "#FFFFFF80", color: "#000", border: "1px solid #FFF" };
    }

    // Default styles based on status
    switch (status) {
        case 0:
            return { backgroundColor: "#169C3880", color: "#169C38", border: "1px solid #169C38" };
        case 1:
            return { backgroundColor: "#F4433680", color: "#F44336", border: "1px solid #F44336" };
        case 2:
            return { backgroundColor: "#FFEB3B80", color: "#FFEB3B", border: "1px solid #FFEB3B" };
        case 4:
            return { backgroundColor: "#33333380", color: "#333", border: "1px solid #333" };
        case 5:
            return { backgroundColor: "transparent", color: "#333", border: "1px solid #333" };
        case -1:
            return { backgroundColor: "#444", border: "#444" }
        default:
            return { backgroundColor: "#000", color: "#FFF", border: "1px solid #333" };
    }
};

const getLabelStyle = (state, label) => {
    if (state) {
        return { backgroundColor: "#000", color: "#FFF", border: "1px solid #FFF" };
    }
    return { backgroundColor: "#000", color: "#FFF", border: "1px solid #333" };
}


const getLiveBoxStyle = (spool) => {
    if (spool.run_time === null) {
        console.log(spool)
        return { backgroundColor: "transparent", color: "white", border: "1px dotted #333333" }; // Green for active
    }
    return getBoxStyle(spool.status)

};

function Extrusion() {
    const [data, setData] = useState(null);
    const [lineID, setLineID] = useState("EX03");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeFailure, setActiveFailure] = useState(null); // Track the active label
    const [activeOven, setActiveOven] = useState(null); // Track the active label
    const [mode, setMode] = useState(null);
    const [live, setLive] = useState(null);
    const [hoveredFailureMode, setHoveredFailureMode] = useState(null);
    const [hoveredTableSpool, setHoveredTableSpool] = useState(null);
    const [schemeScheduled, setSchemeScheduled] = useState(null);
    const [schemeProduced, setSchemeProduced] = useState(true);
    const [schemeProjected, setSchemeProjected] = useState(null);
    const [schemeErrored, setSchemeErrored] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);

    const [startDate, setStartDate] = useState(moment());
    const [endDate, setEndDate] = useState(moment().add(1, 'days'));

    const options = [
        { value: "EX00", label: "EX00" },
        { value: "EX01", label: "EX01" },
        { value: "EX03", label: "EX03" },
        { value: "EX04", label: "EX04" },
    ];


    const handleFailureClick = (label) => {
        setActiveFailure((prev) => (prev === label ? null : label)); // Toggle visibility
    };

    const handleOvenClick = (label) => {
        setActiveOven((prev) => (prev === label ? null : label)); // Toggle visibility
    };

    const handleSchemeClick = (label) => {
        if (label === "scheduled") {
            setSchemeScheduled(schemeScheduled ? false : true);
            setSchemeErrored(false);
        } else if (label === "produced") {
            setSchemeProduced(schemeProduced ? false : true);
            setSchemeErrored(false);
        } else if (label === "projected") {
            setSchemeProjected(schemeProjected ? false : true);
            setSchemeErrored(false);
        } else if (label === "errored") {
            setSchemeErrored(schemeErrored ? false : true);
            setSchemeScheduled(false);
            setSchemeProduced(false);
            // if (schemeErrored)
            //     setSchemeProduced(true);
            setSchemeProjected(false);
        } else {

        }

        //forces produced to set if nothing is set...
        // if (!schemeProduced && !schemeScheduled && !schemeErrored && !schemeProjected) {
        //     setSchemeProduced(true);
        // }
    }

    const handleStartDateChange = (value) => {
        const newStartDate = moment(value, "YYYY-MM-DD");

        // Check if the date is valid
        if (!newStartDate.isValid()) {
            console.log("Invalid start date");
            return; // Do nothing if invalid
        }

        // Check if the new start date is before the end date
        if (newStartDate.isAfter(endDate)) {
            console.log("Start date cannot be after end date");
            return; // Do nothing if start date is after the end date
        }

        // If valid and correct order, update the start date
        setStartDate(newStartDate);
    };

    const handleEndDateChange = (value) => {
        const newEndDate = moment(value, "YYYY-MM-DD");

        // Check if the date is valid
        if (!newEndDate.isValid()) {
            console.log("Invalid end date");
            return; // Do nothing if invalid
        }

        // Check if the new end date is after the start date
        if (newEndDate.isBefore(startDate)) {
            console.log("End date cannot be before start date");
            return; // Do nothing if end date is before the start date
        }

        // If valid and correct order, update the end date
        setEndDate(newEndDate);
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

    // const { line_id } = useParams(); // Extract line_id from the URL

    useEffect(() => {
        setLoading(true);
        // setLineID(line_id ? line_id.toUpperCase() : '');
        const url = lineID
            ? `http://localhost:5000/api/extruder?line_id=${lineID}&start_date=${startDate?.format('YYYY-MM-DD')}&end_date=${endDate?.format('YYYY-MM-DD')}`
            : `http://localhost:5000/api/extruder?line_id=EX03`;
        console.log(url)
        fetchData(url, (data) => setData(data));
        const fetchInterval = setInterval(() => {
            (async () => {
                await fetchData(url, (data) => setData(data));

            })();
        }, 5000);

        return () => clearInterval(fetchInterval);
    }, [lineID, startDate, endDate]);

    useEffect(() => {
        const url = lineID
            ? `http://localhost:5000/api/extruder/live?line_id=${lineID}`
            : `http://localhost:5000/api/extruder/live`;


        fetchData(url, (data) => setLive(data.live));
        const fetchInterval = setInterval(() => {
            (async () => {
                await fetchData(url, (data) => setLive(data.live));
            })();
        }, 2000);

        return () => clearInterval(fetchInterval);
    }, [lineID]);



    return (
        <div className="extrusion-root" style={style_content}>
            {/* <div className="extruder-profile" style={style_extruder_title}>
                {lineID}
            </div> */}
            <div className="extruder-options" style={{ marginTop: "4rem", paddingBottom: "2rem" }}>
                <Dropdown
                    options={options}
                    onChange={setLineID}
                    defaultValue="EX03"
                />
                <div className="date-selector" style={{ display: "flex", gap: "1rem" }}>
                    <input
                        id="start-date"
                        type="date"
                        min="2000-01-01"
                        max="2030-12-31"
                        value={startDate.format('YYYY-MM-DD')} // Format the date as YYYY-MM-DD
                        style={{
                            fontSize: "1rem",
                            // font: "Roboto",
                            padding: "0.5rem",
                            backgroundColor: "#000000",
                            border: "none",
                            color: "#FFFFFF",
                            letterSpacing: "0.5rem",
                        }}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                    /> 
                </div>
                <div className="date-selector" style={{ display: "flex", gap: "1rem" }}>
                    <input
                        id="end-date"
                        type="date"
                        min="2000-01-01"
                        max="2030-12-31"
                        value={endDate.format('YYYY-MM-DD')} // Format the date as YYYY-MM-DD
                        style={{
                            fontSize: "1rem",
                            // font: "Roboto",
                            padding: "0.5rem",
                            backgroundColor: "#000000",
                            border: "none",
                            color: "#FFFFFF",
                            letterSpacing: "0.5rem",
                        }}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                    />
                </div>
            </div>
            <div
                className="extruder-live"
                style={{
                    display: "flex",
                    flexDirection: "row",
                    padding: "0rem 0rem",
                    alignItems: "center",
                    verticalAlign: "center",
                    marginBottom: "5rem",
                    gap: "1rem",
                }}
            >
                <div className="extruder-svg" style={{ flexBasis: "30%" }}>
                    <svg
                        style={{ width: "100%", height: "auto" }}
                        viewBox="0 0 781 362"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            x="0.5"
                            y="192.5"
                            width="639"
                            height="169"
                            fill="#D9D9D9"
                            fillOpacity="0.07"
                            stroke="white"
                        />
                        <rect
                            x="639.5"
                            y="245.5"
                            width="141"
                            height="63"
                            fill="#D9D9D9"
                            fillOpacity="0.07"
                            stroke="white"
                        />
                        <path
                            d="M298.364 189.633L181 289.344L63.6363 189.633L108.495 28.1925L253.505 28.1925L298.364 189.633Z"
                            stroke="white"
                        />
                        <path
                            d="M656.807 224.531L673.475 276.5L656.807 328.469L630.179 308.869L630.179 244.131L656.807 224.531Z"
                            stroke="white"
                        />
                    </svg>
                </div>

                {/* Render live data or skeleton loader */}
                <div style={style_live_spool_box}>
                    {loading || !live || live.length === 0
                        ? Array(3)
                            .fill()
                            .map((_, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        flexGrow: 1,
                                        gap: "0.75rem",
                                        flexBasis: "25%",
                                        justifyContent: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            backgroundColor: "#333",
                                            width: "100%",
                                            height: "3rem",
                                            animation: "pulse 1.5s infinite ease-in-out",
                                            borderRadius: "2px",
                                        }}
                                    ></div>
                                    <div>
                                        <div
                                            style={{
                                                backgroundColor: "#333",
                                                height: "20px",
                                                width: "50%",
                                                marginBottom: "8px",
                                                animation: "pulse 1.5s infinite ease-in-out",
                                                borderRadius: "2px",
                                            }}
                                        ></div>
                                        <div
                                            style={{
                                                backgroundColor: "#333",
                                                height: "20px",
                                                width: "40%",
                                                marginBottom: "8px",
                                                animation: "pulse 1.5s infinite ease-in-out",
                                                borderRadius: "2px",
                                            }}
                                        ></div>
                                        <div
                                            style={{
                                                backgroundColor: "#333",
                                                height: "20px",
                                                width: "30%",
                                                animation: "pulse 1.5s infinite ease-in-out",
                                                borderRadius: "2px",
                                            }}
                                        ></div>
                                        <div
                                            style={{
                                                backgroundColor: "#333",
                                                height: "20px",
                                                width: "30%",
                                                animation: "pulse 1.5s infinite ease-in-out",
                                                borderRadius: "2px",
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        : live.map((spool, index) => (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    flexGrow: 1,
                                    gap: "0.75rem",
                                    flexBasis: Math.floor(spool.meters_on_spool),
                                    color: "white",
                                    justifyContent: "center",
                                }}
                            >
                                <div
                                    style={{
                                        ...getLiveBoxStyle(spool),
                                        ...style_live_spool_box,
                                        paddingLeft: "1rem",
                                        padding: "0.75rem",
                                        color: "white",
                                        fontSize: "1.25rem",
                                        fontWeight: 500,
                                    }}
                                >
                                    {spool.spool_id}
                                </div>
                                <div
                                    style={{
                                        borderLeft: spool.run_time
                                            ? "1px solid gray"
                                            : "1px dotted #333333",
                                        paddingLeft: "1rem",
                                        paddingBottom: "2rem",
                                        fontSize: "1.25rem",
                                    }}
                                >
                                    <div className="spec-status">
                                        {spool.failure_mode
                                            ? spool.failure_mode.toUpperCase()
                                            : "IN SPEC"}
                                    </div>
                                    <div className="spec-runtime">
                                        {spool.run_time ? spool.run_time : "Pending"}
                                    </div>
                                    <div className="spec-length">
                                        {spool.meters_on_spool} m
                                    </div>
                                    <div className="spec-notes-failure"></div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
            {<div className="highlight-box" id="produced" style={{ display: "flex", gap: "1rem", paddingBottom: "1rem" }}>
                {[
                    { label: "scheduled", state: schemeScheduled },
                    { label: "produced", state: schemeProduced },
                    { label: "projected", state: schemeProjected },
                    { label: "errored", state: schemeErrored },
                ].map(({ label, state }) => (
                    <div
                        key={label}
                        onClick={() => handleSchemeClick(label)}
                        style={{ ...style_button_mode, ...getLabelStyle(state), display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                        <div>{label}</div>
                        {state && (
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 100 100"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ display: "block" }}
                            >
                                <rect width="100" height="100" fill="url(#pattern0_305_6)" />
                                <defs>
                                    <pattern
                                        id="pattern0_305_6"
                                        patternContentUnits="objectBoundingBox"
                                        width="1"
                                        height="1"
                                    >
                                        <use
                                            xlinkHref="#image0_305_6"
                                            transform="scale(0.01)"
                                        />
                                    </pattern>
                                    <image
                                        id="image0_305_6"
                                        width="100"
                                        height="100"
                                        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwE
                                        AmpwYAAAE1klEQVR4nO2dy49VRRCH20cUJyaOAiZqQFfq3q0YTVCjiK+of8BoIEpEo7JEXbpQIz6CjNGFfwDxsULvvYsTjTsUXxu
                                        ZUQTZKMPgSp3AZyrTxMtE5r66zqnuU18ymztzT3ef35yu7uqqOiE4juM4juM4juM4juOMBHA1cDewE3gH6ADfAnPAAvB3/FmIn8n
                                        vPo9/+zRwF7Deb/uYAFPAA8CeeHPPMDlyjUPAG8D9wGUu0OoiXAjcCuwDTqGPtPEhsBW4yMX5T4g1wFPAPM0h09yTwKVtn5ZeAI5
                                        jh+PAc9K30CbiNPEzdjkKPBJKB7gB+JR8+BjYGEoEeDAuS3PjFPBYKAUxlHH5mjv7sjf6wFrgK8rhC+CqkCPAtXFTVxo/AhtCTgA
                                        3A79SLkeAm0IOANcBv1A+x4DrQwY2Qx7ptvCDWZsSV1MlGfBh+dLk6gt4m/ayJ1hC3AxN3xEDPBwMuUMWm74bBjhpwsgDnzR9Jwz
                                        xkQX/lHMuW5s8z2jDfmNU5hs5HgZ2jdzV9vBsE3uO35oetWHk5HFNnYLIGXhqloC9wAywO7omtDgW25iJbUrbqdleZ3RI6oCEfyT
                                        iJJzbzjTQIz1yzekVbW1SEOUwcEEdgtxBevausnDoJWynd74ABmCW9NxWhyAfKHR8ZpX2phKJcl4xYjtPkJ731ITouzl/KnT8xSH
                                        a7WmJEdt4mfQsqi6BY3inlpGdVhJlGDGuVFw1bkkuRF/HNYMVKuDyIUTpKFyzqziuV5ML0dd57TPyKqEoFsQQvk4uRF9KQIoo9BR
                                        TzNSA6SvFNVJxGlinIYjkZ9RFNcGTYuXJ6GezhiCSLINxUSqDYgg7NASRbCQMi1IZFUN4U0MQSRFrgt6Q9sCKzfg/DmgI8h3NUQ3
                                        67zf6ZJzlUFo1lgfV9GFUNY4oBsQQ5jUEOUHzVKOIYkQM4XcNQSTtmFxEwY4Ywl8uCCO7WbITJNcpq1PqlJWzUe+UaNRzX/Z2Slv
                                        2+sbQ2MbQsuukq3SeYtp1YtW52B3jO50SnIsW3e/dCb7byd39vt4PqMY+oFqbXBBjR7jdhNfSflIOJheibwBS/EuLSuE8w4IoqkE
                                        OUolNg5LDgO5NLsSKm6JR7W13oYFyJ9Wj4IH3FTpeaijprJoQfR2/XaHj7xYabL2prnQEqVGYkqWVnWd5Xs85HeGnWtIR4gCkYGR
                                        qlmJNqsfjfK5Zi1EM+EtxmppVStjZVosYURBPaRtcs7HechvA8wM61WZ21ipGn8G1XFm0KQ7XmvC5QpR7Ghu2XfTyQYYURUqpOsv
                                        sb1SMKMjGuCNtOwtmajEC99XkmreKjP2hYIlCavOOy+vBGnFvIuXu2kYFXBIsAlwBfEN7+N5sEcwWlok9mk2hfikyHIsNl8oR4Ma
                                        QE8A18Z1PJdbq3RByRObXwgx9JccCIWeAi4FXMt+nnInLepurqQnqpOT6QpdHQ4lIXdvMfF/7s7UXY7hamnxN3iDmGvfa1o3UkZL
                                        qncq1FcfZWzzT2HmGIZfL9niw0xQSkLCtKKOdAuCWuJr5owYRFuOrVzfXFh2S+etYt4gXVepNxQjySZFrHARek/DOVk9LkwKsA+6
                                        UxBfgLeCz6MSci9nBZ1/ffSJ+Jr87EP92R3wKdFICHMdxHMdxHMdxHMcJ5fIvUpYlXZoGgOIAAAAASUVORK5CYII="
                                    />
                                </defs>
                            </svg>
                        )}
                    </div>
                ))}
            </div>}
            <div className="extruder-produced">
                <div className="spool-box-wrapper" style={style_spool_box_wrapper}>
                    {data && data.produced && schemeProduced && data.produced.length > 0 ? (
                        data.produced.map((spool, index) => (
                            <div
                                key={index}
                                className="spool-box"
                                style={{
                                    ...style_spool_box,
                                    ...getBoxStyle(spool.status, spool.failure_mode, hoveredFailureMode, hoveredTableSpool, spool.spool_id),
                                }}
                                onMouseEnter={(e) =>
                                    e.currentTarget.querySelector('.tooltip').style.display = 'block'
                                }
                                onMouseLeave={(e) =>
                                    e.currentTarget.querySelector('.tooltip').style.display = 'none'
                                }
                            >
                                <div className="" style={{ ...style_oven_box_inner }}>{data.produced.length - index}</div>
                                <div className="tooltip" style={style_tooltip}>
                                    <div className="" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                        <div className="" style={{ fontSize: "1.5rem" }}>{spool["material"]}</div>
                                        <div
                                            className=""
                                            style={{
                                                borderRadius: "0.25rem",
                                                padding: "0.25rem",
                                                width: "fit-content",
                                                ...getBoxStyle(spool?.status),
                                            }}
                                        >
                                            {spool["failure_mode"]}
                                        </div>
                                        <div className="">{spool["spool_id"]}</div>
                                        <div className="">{spool["start_time"]}</div>
                                        <div className="">{spool["meters_on_spool"]}</div>
                                    </div>
                                </div>
                            </div>
                        ))) : (<></>
                        // <div className="error-message" style={{ ...style_error_box, display: loading ? "none" : "block" }}>No spools produced in the queried range {startDate?.format("YYYY-MM-DD")} - {endDate?.format("YYYY-MM-DD")} </div>
                    )}
                    {data && data.scheduled && schemeScheduled && data.produced.length > 0 && (
                        
                            Array.from({ length: 60 - (schemeProduced ? data.produced.length : 0) }, (_, index) => (
                                <div key={index} style={{
                                    ...style_spool_box, ...getBoxStyle(4),
                                }}>
                                    <div style={{ ...style_oven_box_inner }}>
                                        {60 - index}
                                    </div>
                                </div>
                            ))
                    )}


                    {data && data.projected && schemeProjected && data.produced.length > 0 ? (
                        Array.from({ length: data.projected - Math.max(schemeProduced ? data.produced.length : 0, schemeScheduled ? data.scheduled : 0) }, (_, index) => (
                            <div key={index} style={{
                                ...style_spool_box, ...getBoxStyle(5),
                            }}>
                                <div style={{ ...style_oven_box_inner }}>
                                    {data.projected - index}
                                </div>
                            </div>
                        ))) : (
                        <></>
                    )
                    }
                    {data && data.errored && schemeErrored &&
                        data.errored.map((spool, index) => (
                            <div
                                key={index}
                                className="spool-box"
                                style={{
                                    ...style_spool_box,
                                    ...getBoxStyle(spool.status, spool.failure_mode, hoveredFailureMode, hoveredTableSpool, spool.spool_id),
                                }}
                                onMouseEnter={(e) =>
                                    e.currentTarget.querySelector('.tooltip').style.display = 'block'
                                }
                                onMouseLeave={(e) =>
                                    e.currentTarget.querySelector('.tooltip').style.display = 'none'
                                }
                            >
                                <div className="tooltip" style={style_tooltip}>
                                    <div className="" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                        <div className="" style={{ fontSize: "1.5rem" }}>{spool["material"]}</div>
                                        <div
                                            className=""
                                            style={{
                                                borderRadius: "0.25rem",
                                                padding: "0.25rem",
                                                width: "fit-content",
                                                ...getBoxStyle(spool?.status),
                                            }}
                                        >
                                            {spool["failure_mode"]}
                                        </div>
                                        <div className="">{spool["spool_id"]}</div>
                                        <div className="">{spool["start_time"]}</div>
                                        <div className="">{spool["meters_on_spool"]}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    {(!data || loading) &&
                        Array.from({ length: 100 }, (_, index) => (
                            <div key={index} style={{
                                ...style_spool_box, ...getBoxStyle(4),
                                animation: "pulse 1.5s infinite ease-in-out",

                            }}>
                                <div style={{ ...style_oven_box_inner }}>
                                    {/* {index + 1} */}
                                </div>
                            </div>
                        ))
                    }
                </div>
                {data && data.scheduled && schemeScheduled && data.produced.length > 0 && (
                        <div className="" style={{padding: "3rem 0rem 0rem 0rem"}}>
                            <div className="">{data.scheduled[data.active]} monthly goal</div>
                            <div className="">{data.scheduled[data.active] / 2} / 2 extruders that make {data.active}</div>
                            <div className="">{data.scheduled[data.active] / 19} / 19 scheduled days on {lineID}</div>
                        </div>
                )}
                {data && data.projected && schemeProjected && data.produced.length > 0 && (
                        <>
                        <div className="" style={{padding: "3rem 0rem 0rem 0rem"}}>
                            <div className="">{spool_time[data.active][lineID][0]} - {spool_time[data.active][lineID][4]} seconds per spool of {data.active} on {lineID}</div>
                            <div className="">{3600 * 16} s available</div>
                            <div className="">{3600  / spool_time[data.active][lineID]} spools can be made in this time</div>
                        </div>
                        <div className="">
                            
                        </div>
                        </>
                )}
            </div>
            <div className="extruder-failure">
                <div className="failure-modes" style={style_failure_mode_set}>
                    {data && data.failures
                        && Object.keys(data.failures).map((failure) => (
                            <div
                                className=""
                                key={failure}
                                style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem" }}
                            >
                                <div
                                    className=""
                                    style={style_button_mode}
                                    onClick={() => {
                                        handleFailureClick(failure)
                                        setHoveredFailureMode(failure)
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "white"
                                        e.currentTarget.style.color = "#000000"
                                        setHoveredFailureMode(failure)
                                        // handleSchemeClick("produced")
                                    }}

                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "transparent"
                                        e.currentTarget.style.color = "white"
                                        setHoveredFailureMode(null)
                                    }}

                                >
                                    {failure}
                                </div>
                                <div className="">X</div>
                                <div className="" style={{ fontSize: "1.25rem", fontWeight: 300 }}>
                                    {data.failures[failure].length}
                                </div>
                            </div>

                        ))
                    }
                </div>
                <div className="">
                    {data && data.failures && activeFailure && (
                        <div style={{ marginTop: "0.5rem", color: "#FFFFFF" }}>
                            <table
                                style={style_table}
                            >
                                <thead>
                                    <tr
                                        style={style_table_header_row}
                                    >
                                        {Object.keys(data.failures[activeFailure][0]).map((key, index) => (
                                            <th
                                                key={index}
                                                style={style_table_header_data}
                                            >
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.failures[activeFailure].map((spool, index) => (
                                        <tr
                                            key={index}
                                            style={{
                                                backgroundColor: index % 2 === 0 ? "#111111" : "#111111",
                                                color: "#FFF",
                                                fontWeight: "600",
                                                transition: "background-color 0.2s",
                                                // border: "1px solid #111111"
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = getBoxStyle(spool.status)?.["backgroundColor"]
                                                // e.currentTarget.style.border = getBoxStyle(spool.status)?.["border"]
                                                setHoveredTableSpool(spool.spool_id)
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = "#111111"
                                                // e.currentTarget.style.border = "1px solid #111111"                                             
                                                setHoveredTableSpool(null)


                                            }}
                                        >
                                            {Object.values(spool).map((value, idx) => (
                                                <td
                                                    key={idx}
                                                    style={{
                                                        padding: "12px 15px",
                                                    }}
                                                >
                                                    {value}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {data && data.statistics && (<div className="" style={{ fontSize: "2rem", fontWeight: 600, padding: "2rem 0" }}>{`= ${data.statistics.ovens.full} Ovens And Partials`}</div>)}
                <div className="" style={{ display: "flex", gap: "0.6rem", flexDirection: "column", flexWrap: "wrap" }}>
                    {data && data.statistics && (
                        <div className="oven-box-grid" style={{ ...style_oven_spool_box_grid }}>
                            {Array.from({ length: data.statistics.ovens.full }, (_, index) => (
                                <div key={index} style={{ ...style_oven_box, width: "8vw" }}>
                                    <div style={{ ...style_oven_box_inner }}>
                                        {/* Oven {index + 1} */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {data && data.statistics && (
                        <div className="oven-remainder-grid" style={{ ...style_oven_spool_box_grid }}>
                            {Array.from({ length: data.statistics.ovens.remainder }, (_, index) => (
                                <div key={index} className="oven-remainder-box" style={{ ...style_oven_box, width: "2vw" }}>
                                    <div style={{ ...style_oven_box_inner }}>
                                        {/* Rem {index + 1} */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* {data && data.statistics.ovens.available && (
                    <div className="" style={style_failure_mode_set}>{Object.keys(data.statistics.ovens.available).map((oven, index) => (
                        <div className="" style={style_failure_mode}>{data.statistics.ovens.available[oven]}</div>
                    ))}</div>
                )} */}
                <div className="ovens-loaded" style={style_failure_mode_set}>
                    {data && data.ovens
                        && Object.keys(data.ovens).map((oven) => (
                            <div
                                className=""
                                key={oven}
                                style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem", fontWeight: 600 }}>
                                <div
                                    className=""
                                    style={style_button_mode}
                                    onClick={() => handleOvenClick(oven)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "white"
                                        e.currentTarget.style.color = "#000000"
                                        // e.currentTarget.style.fontWeight = 600
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "transparent";
                                        e.currentTarget.style.color = "white"
                                        // e.currentTarget.style.fontWeight = 600
                                    }}>{oven}</div>
                                <div className="">X</div>
                                <div className="" style={{ fontSize: "1.25rem", fontWeight: 300 }}>{data.ovens[oven].length}</div>
                            </div>
                        ))
                    }
                </div>
                <div className="">
                    {data && data.ovens && activeOven && (
                        <div style={{ marginTop: "0.5rem", color: "#FFFFFF" }}>
                            <table className="styled-table" style={style_table}>
                                <thead>
                                    <tr style={style_table_header_row}>
                                        {Object.keys(data.ovens[activeOven][0]).map((key, index) => (
                                            <th key={index} style={style_table_header_data}>{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody >
                                    {data.ovens[activeOven].map((spool, index) => (
                                        <tr
                                            key={index}
                                            style={{
                                                backgroundColor: index % 2 === 0 ? "#111111" : "#111111",
                                                color: "#FFF",
                                                fontWeight: "600",
                                                transition: "background-color 0.2s",
                                                border: "1px solid #111111"
                                            }}>
                                            {Object.values(spool).map((value, idx) => (
                                                <td
                                                    key={idx}
                                                    style={{
                                                        padding: "12px 15px",
                                                    }}>{value}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {data && data.statistics && (
                    <div
                        className=""
                        style={{ fontSize: "2rem", fontWeight: 600, padding: "2rem 0" }}
                    >
                        {data.lots.feedstock.length > 0 &&
                            `${data.lots.feedstock.length} Feedstock Lot${data.lots.feedstock.length > 1 ? 's' : ''}`
                        }
                        {data.lots.feedstock.length > 0 && data.lots.filament.length > 0 && ' and '}
                        {data.lots.filament.length > 0 &&
                            `${data.lots.filament.length} Filament Lot${data.lots.filament.length > 1 ? 's' : ''}`
                        }
                    </div>
                )}
                {data && data.lots.filament && (
                    <div className="" style={style_failure_mode_set}>{Object.keys(data.lots.filament).map((lot, index) => (
                        <div className="" style={style_button_mode}>{data.lots.filament[lot]}</div>
                    ))}</div>
                )}
                {data && data.lots.feedstock && (
                    <div className="" style={style_failure_mode_set}>{Object.keys(data.lots.feedstock).map((lot, index) => (
                        <div className="" style={style_button_mode}>{data.lots.feedstock[lot]}</div>
                    ))}</div>
                )}
            </div>
        </div>
    );
}

export default Extrusion;

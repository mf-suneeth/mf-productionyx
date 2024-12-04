import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Dropdown from "./Dropdown"; // Adjust the path as per your file structure



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
    gridTemplateColumns: "repeat(auto-fit, minmax(2vw, 1fr))", // Auto-fit columns, minimum 24px width
    gap: "0.4vw", // Optional spacing between boxes
    justifyContent: "center", // Center the grid
    alignItems: "center", // Align items in the grid
    overflow: "visible", // Ensure tooltips are not clipped
};

const style_oven_spool_box_grid = {
    display: "flex",
    flexWrap: "wrap",
    // gridTemplateColumns: "repeat(auto-fit, minmax(2vw, 1fr))", // Auto-fit columns, minimum 24px width
    gap: "0.6rem", // Optional spacing between boxes
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
    width: "100%", // Full width of grid cell
    marginTop: "8.6rem",
};

const style_oven_spool_box = {
    position: "relative", // Ensure the tooltip positions relative to the box
    border: "1px solid #333333",
    aspectRatio: "1 / 1", // Keeps the box square
    width: "100%", // Full width of grid cell
    backgroundColor: "#1F1F1F",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",

};

const style_oven_box_grid = {
    display: "grid",
    flexWrap: "wrap",
    gridTemplateColumns: "repeat(auto-fit, minmax(8vw, 1fr))", // Auto-fit columns, minimum 24px width
    gap: "0.6rem", // Optional spacing between boxes
    justifyContent: "end", // Center the grid
    alignItems: "center", // Align items in the grid
    overflow: "visible", // Ensure tooltips are not clipped
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
            return { backgroundColor: "#33333380", color: "#FFF", border: "1px solid #333" };
        case 5:
            return { backgroundColor: "transparent", color: "#FFF", border: "1px solid #333" };
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
    const [activeScheme, setActiveScheme] = useState("produced");

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
            setSchemeProjected(false);
        } else {

        }

        //forces produced to set if nothing is set...
        // if (!schemeProduced && !schemeScheduled && !schemeErrored && !schemeProjected) {
        //     setSchemeProduced(true);
        // }
        setActiveScheme((prev) => (prev === label ? null : label)); // Toggle visibility
    }

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
            ? `http://localhost:5000/api/extruder?line_id=${lineID}`
            : `http://localhost:5000/api/extruder`;

        fetchData(url, (data) => setData(data));
        const fetchInterval = setInterval(() => {
            (async () => {
                await fetchData(url, (data) => setData(data));

            })();
        }, 5000);

        return () => clearInterval(fetchInterval);
    }, [lineID]);

    useEffect(() => {
        const url = lineID
            ? `http://localhost:5000/api/extruder/live?line_id=${lineID}`
            : `http://localhost:5000/api/extruder/live`;


        fetchData(url, (data) => setLive(data.live));
        const fetchInterval = setInterval(() => {
            (async () => {
                await fetchData(url, (data) => setLive(data.live));
            })();
        }, 5000);

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
            </div>
            <div className="extruder-live" style={{ display: "flex", flexDirection: "row", padding: "0rem 0rem", alignItems: "center", verticalAlign: "center", marginBottom: "20vh", gap: "1rem" }}>
                <div className="extruder-svg" style={{ flexBasis: "30%" }}>
                    <svg
                        style={{ width: '100%', height: 'auto' }}
                        viewBox="0 0 891 478"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            x="0.5"
                            y="246.5"
                            width="639"
                            height="169"
                            fill="#D9D9D9"
                            fillOpacity="0.07"
                            stroke="white"
                        />
                        <rect
                            x="662.5"
                            y="299.5"
                            width="228"
                            height="63"
                            fill="#D9D9D9"
                            fillOpacity="0.07"
                            stroke="white"
                        />
                        <path
                            d="M298.364 243.633L181 343.344L63.6363 243.633L108.495 82.1925L253.505 82.1925L298.364 243.633Z"
                            stroke="white"
                        />
                        <path
                            d="M656.807 278.531L673.475 330.5L656.807 382.469L630.179 362.869L630.179 298.131L656.807 278.531Z"
                            stroke="white"
                        />
                        <line
                            x1="481.588"
                            y1="317.717"
                            x2="639.588"
                            y2="87.7169"
                            stroke="white"
                        />
                        <line
                            x1="385.543"
                            y1="343.796"
                            x2="538.543"
                            y2="0.796307"
                            stroke="white"
                        />
                        <line
                            x1="274.49"
                            y1="384.9"
                            x2="293.49"
                            y2="477.9"
                            stroke="white"
                        />
                        <line
                            x1="656.49"
                            y1="384.9"
                            x2="675.49"
                            y2="477.9"
                            stroke="white"
                        />
                        <line
                            x1="166.471"
                            y1="299.168"
                            x2="104.471"
                            y2="473.168"
                            stroke="white"
                        />
                    </svg>
                </div>
                {!loading && 
                    <div className="" style={{ display: "flex", flexDirection: "row", gap: "1rem", flexGrow: 1, marginTop: "5.5vh" }}>
                    {live && live.map((spool, index) => (
                        <div
                            className=""
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                flexGrow: 1,
                                gap: "0.75rem",
                                flexBasis: Math.floor(spool.meters_on_spool),
                                color: "white",
                                justifyContent: "center",
                            }}>
                            <div
                                className=""
                                style={{
                                    ...getLiveBoxStyle(spool),
                                    ...style_live_spool_box,
                                    paddingLeft: "1rem",
                                    padding: "0.75rem",
                                    color: "white",
                                    fontSize: "1.25rem",
                                    fontWeight: 500


                                }}>
                                {spool.spool_id}
                            </div>
                            <div className="" style={{ borderLeft: "1px solid white", paddingLeft: "1rem", paddingBottom: "2rem", fontSize: "1.25rem" }}>
                                <div className="spec-status">{spool.failure_mode ? spool.failure_mode.toUpperCase() : "IN SPEC"}</div>
                                <div className="spec-runtime">{spool.run_time ? spool.run_time : "Pending"}</div>
                                <div className="spec-length">{spool.meters_on_spool} m</div>
                                <div className="spec-notes-failure"></div>
                            </div>
                        </div>
                    ))}
                    </div> 
                }
{loading && 
    <div style={{ display: "flex", flexDirection: "row", gap: "1rem", flexGrow: 1, marginTop: "5.5vh" }}>
        {Array(4).fill().map((_, index) => (
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
                        height: "100px",
                        animation: "pulse 1.5s infinite ease-in-out",
                        borderRadius: "8px",
                    }}
                ></div>
                <div style={{ paddingLeft: "1rem" }}>
                    <div
                        style={{
                            backgroundColor: "#333",
                            height: "20px",
                            width: "80%",
                            marginBottom: "8px",
                            animation: "pulse 1.5s infinite ease-in-out",
                            borderRadius: "4px",
                        }}
                    ></div>
                    <div
                        style={{
                            backgroundColor: "#333",
                            height: "20px",
                            width: "60%",
                            marginBottom: "8px",
                            animation: "pulse 1.5s infinite ease-in-out",
                            borderRadius: "4px",
                        }}
                    ></div>
                    <div
                        style={{
                            backgroundColor: "#333",
                            height: "20px",
                            width: "50%",
                            animation: "pulse 1.5s infinite ease-in-out",
                            borderRadius: "4px",
                        }}
                    ></div>
                </div>
            </div>
        ))}
    </div>
}

            </div>
            <div className="highlight-box" style={{ display: "flex", gap: "1rem", paddingBottom: "1rem" }}>
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
                                        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAE1klEQVR4nO2dy49VRRCH20cUJyaOAiZqQFfq3q0YTVCjiK+of8BoIEpEo7JEXbpQIz6CjNGFfwDxsULvvYsTjTsUXxuZUQTZKMPgSp3AZyrTxMtE5r66zqnuU18ymztzT3ef35yu7uqqOiE4juM4juM4juM4juOMBHA1cDewE3gH6ADfAnPAAvB3/FmIn8nvPo9/+zRwF7Deb/uYAFPAA8CeeHPPMDlyjUPAG8D9wGUu0OoiXAjcCuwDTqGPtPEhsBW4yMX5T4g1wFPAPM0h09yTwKVtn5ZeAI5jh+PAc9K30CbiNPEzdjkKPBJKB7gB+JR8+BjYGEoEeDAuS3PjFPBYKAUxlHH5mjv7sjf6wFrgK8rhC+CqkCPAtXFTVxo/AhtCTgA3A79SLkeAm0IOANcBv1A+x4DrQwY2Qx7ptvCDWZsSV1MlGfBh+dLk6gt4m/ayJ1hC3AxN3xEDPBwMuUMWm74bBjhpwsgDnzR9JwzxkQX/lHMuW5s8z2jDfmNU5hs5HgZ2jdzV9vBsE3uO35oetWHk5HFNnYLIGXhqloC9wAywO7omtDgW25iJbUrbqdleZ3RI6oCEfyTiJJzbzjTQIz1yzekVbW1SEOUwcEEdgtxBevausnDoJWynd74ABmCW9NxWhyAfKHR8ZpX2phKJcl4xYjtPkJ731ITouzl/KnT8xSHa7WmJEdt4mfQsqi6BY3inlpGdVhJlGDGuVFw1bkkuRF/HNYMVKuDyIUTpKFyzqziuV5ML0dd57TPyKqEoFsQQvk4uRF9KQIoo9BRTzNSA6SvFNVJxGlinIYjkZ9RFNcGTYuXJ6GezhiCSLINxUSqDYgg7NASRbCQMi1IZFUN4U0MQSRFrgt6Q9sCKzfg/DmgI8h3NUQ367zf6ZJzlUFo1lgfV9GFUNY4oBsQQ5jUEOUHzVKOIYkQM4XcNQSTtmFxEwY4Ywl8uCCO7WbITJNcpq1PqlJWzUe+UaNRzX/Z2Slv2+sbQ2MbQsuukq3SeYtp1YtW52B3jO50SnIsW3e/dCb7byd39vt4PqMY+oFqbXBBjR7jdhNfSflIOJheibwBS/EuLSuE8w4IoqkEOUolNg5LDgO5NLsSKm6JR7W13oYFyJ9Wj4IH3FTpeaijprJoQfR2/XaHj7xYabL2prnQEqVGYkqWVnWd5Xs85HeGnWtIR4gCkYGRqlmJNqsfjfK5Zi1EM+EtxmppVStjZVosYURBPaRtcs7HechvA8wM61WZ21ipGn8G1XFm0KQ7XmvC5QpR7Ghu2XfTyQYYURUqpOsvsb1SMKMjGuCNtOwtmajEC99XkmreKjP2hYIlCavOOy+vBGnFvIuXu2kYFXBIsAlwBfEN7+N5sEcwWlok9mk2hfikyHIsNl8oR4MaQE8A18Z1PJdbq3RByRObXwgx9JccCIWeAi4FXMt+nnInLepurqQnqpOT6QpdHQ4lIXdvMfF/7s7UXY7hamnxN3iDmGvfa1o3UkZLqncq1FcfZWzzT2HmGIZfL9niw0xQSkLCtKKOdAuCWuJr5owYRFuOrVzfXFh2S+etYt4gXVepNxQjySZFrHARek/DOVk9LkwKsA+6UxBfgLeCz6MSci9nBZ1/ffSJ+Jr87EP92R3wKdFICHMdxHMdxHMdxHMcJ5fIvUpYlXZoGgOIAAAAASUVORK5CYII="
                                    />
                                </defs>
                            </svg>
                        )}
                    </div>
                ))}
            </div>
            <div className="extruder-produced">
                <div className="spool-box-wrapper" style={style_spool_box_wrapper}>
                    {data && data.produced && schemeProduced &&
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
                                                color: "white"
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
                    {data && data.scheduled && schemeScheduled &&
                        Array.from({ length: data.scheduled - (schemeProduced ? data.produced.length : 0) }, (_, index) => (
                            <div key={index} style={{
                                ...style_spool_box, ...getBoxStyle(4),
                            }}>
                                <div style={{ ...style_oven_box_inner }}>
                                    {index + 1}
                                </div>
                            </div>
                        ))
                    }
                    {data && data.projected && schemeProjected &&
                        Array.from({ length: data.projected - Math.max(schemeProduced ? data.produced.length : 0, schemeScheduled ? data.scheduled : 0) }, (_, index) => (
                            <div key={index} style={{
                                ...style_spool_box, ...getBoxStyle(5),
                            }}>
                                <div style={{ ...style_oven_box_inner }}>
                                    {index + 1}
                                </div>
                            </div>
                        ))
                    }
                    {data && data.projected && schemeErrored &&
                        <div className="">here are spools that have issues with them:</div>
                    }
                    {!data &&
                        <div className="">Loading data...</div>
                    }
                </div>
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

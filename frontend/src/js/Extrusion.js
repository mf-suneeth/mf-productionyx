import React, { Fragment, useEffect, useState } from "react";

// General styling
const style_content = {
    display: "flex",
    flexDirection: "column",
    padding: "0 5vw",
    backgroundColor: "#000000",
    color: "#FFF",
    height: "150vw"
};

const style_spool_box_wrapper = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(1.9rem, 1fr))", // Auto-fit columns, minimum 24px width
    gap: "0.6rem", // Optional spacing between boxes
    justifyContent: "center", // Center the grid
    alignItems: "center", // Align items in the grid
    overflow: "visible", // Ensure tooltips are not clipped
};

const style_oven_spool_box_wrapper = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(1.9rem, 1fr))", // Auto-fit columns, minimum 24px width
    gap: "0.6rem", // Optional spacing between boxes
    justifyContent: "start", // Center the grid
    alignItems: "center", // Align items in the grid
    overflow: "visible", // Ensure tooltips are not clipped
    flexBasis: "30%",
};


const style_spool_box = {
    position: "relative", // Ensure the tooltip positions relative to the box
    border: "1px solid #169C38",
    aspectRatio: "1 / 1", // Keeps the box square
    width: "100%", // Full width of grid cell
};

const style_oven_spool_box = {
    position: "relative", // Ensure the tooltip positions relative to the box
    border: "1px solid #333333",
    aspectRatio: "1 / 1", // Keeps the box square
    width: "100%", // Full width of grid cell
    backgroundColor: "#1F1F1F"
};

const style_tooltip = {
    position: "absolute", // Escape the grid cell
    top: "110%", // Place tooltip below the box
    left: "50%",
    // transform: "translateX(-50%)",
    backgroundColor: "#141414F2",
    color: "#FFF",
    padding: "1rem 0.75rem",
    borderRadius: "4px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    whiteSpace: "nowrap",
    fontSize: "12px",
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
}

const style_failure_mode = {
    color: "white",
    padding: "0.5rem 0.75rem",
    border: "0.5px solid white",
    fontWeight: "300",

}

const style_oven_box_wrapper = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", // Auto-fit columns with min width
    gap: "0.6rem", // Optional spacing between boxes
    justifyContent: "center", // Center the grid
    alignItems: "center", // Align items in the grid
    overflow: "visible", // Ensure tooltips are not clipped
    flexBasis: "60%"
};

const style_oven_box = {
    position: "relative", // Required for the aspect ratio trick
    backgroundColor: "#1F1F1F", // Grey color for the boxes
    // border: "1px solid #169C38", // Optional border
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#FFF",
    textAlign: "center",
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


// Trick to maintain aspect ratio of 1:1 using padding-top
const style_oven_box_aspect = {
    paddingTop: "100%", // This creates a square box, where height = width
};

const style_oven_remainder_box_wrapper = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", // Same layout as ovens
    gap: "0.6rem",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
    width: "40%", // Adjust width to differentiate it from the full ovens
    marginLeft: "1rem", // Add spacing between the two wrappers
};

const style_oven_remainder_box = {
    position: "relative",
    backgroundColor: "#4A4A4A", // Darker grey for remainder boxes
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#FFF",
    textAlign: "center",
};

const style_oven_remainder_box_inner = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
    zIndex: 1,
};


// Dynamic styles based on `status`
const getBoxStyle = (status) => {
    switch (status) {
        case 0:
            return { backgroundColor: "#169C3880", color: "#169C38", border: "1px solid #169C38" }; // Green for active
        case 1:
            return { backgroundColor: "#F4433680", color: "#F44336", border: "1px solid #F44336" }; // Red for inactive
        case 2:
            return { backgroundColor: "#FFEB3B80", color: "#FFEB3B", border: "1px solid #FFEB3B" }; // Yellow for pending
        default:
            return { backgroundColor: "#000", color: "#FFF", border: "1px solid" }; // Default
    }
};

function Extrusion() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeLabel, setActiveLabel] = useState(null); // Track the active label

    const handleClick = (label) => {
        setActiveLabel((prev) => (prev === label ? null : label)); // Toggle visibility
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
        fetchData(
            `http://localhost:5000/api/extruder`,
            (data) => setData(data)
        );
    }, []);

    return (
        <div className="extrusion-root" style={style_content}>
            <div className="extruder-profile" style={{fontSize: "2.5rem", fontWeight: "700", padding : "2rem 0"}}>EX03</div>
            <div className="extruder-produced">
                <div className="spool-box-wrapper" style={style_spool_box_wrapper}>
                    {data && data.produced &&
                        data.produced.map((spool, index) => (
                            <div
                                key={index}
                                className="spool-box"
                                style={{
                                    ...style_spool_box,
                                    ...getBoxStyle(spool.status),
                                }}
                                onMouseEnter={(e) =>
                                    e.currentTarget.querySelector('.tooltip').style.display = 'block'
                                }
                                onMouseLeave={(e) =>
                                    e.currentTarget.querySelector('.tooltip').style.display = 'none'
                                }
                            >
                                <div className="tooltip" style={style_tooltip}>
                                    <div className="" style={{display: "flex", flexDirection: "column", gap:"0.5rem"}}>
                                        <div className="" style={{fontSize: "1.5rem"}}>{spool["material"]}</div>
                                        <div className="" style={{borderRadius: "0.25rem", padding: "0.25rem", width: "fit-content", ...getBoxStyle(spool?.["status"]), color: "white"}}>{spool["failure_mode"]}</div>
                                        <div className="">{spool["spool_id"]}</div>
                                        <div className="">{spool["start_time"]}</div>
                                        <div className="">{spool["meters_on_spool"]}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
            <div className="extruder-failure">
                <div className="failure-modes" style={style_failure_mode_set}>
                {data && data.failures
                    && Object.keys(data.failures).map((failure) => (
                        <div className="" key={failure}
                        style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem"}}>
                            <div 
                                className="" 
                                style={style_failure_mode}
                                onClick={() => handleClick(failure)}                                 onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "white"
                                    e.currentTarget.style.color = "#000000"
                                    e.currentTarget.style.fontWeight = 600

                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = "white"
                                    e.currentTarget.style.fontWeight = 600

                                }}>{failure}</div>
                            <div className="">X</div>
                            <div className="" style={{fontSize: "1.25rem", fontWeight: 300}}>{data.failures[failure].length}</div>
                        </div>
                    ))
                }
                </div>
                <div className="">
                    {data && data.failures && activeLabel && ( // Show content only for the active label
                        <div style={{ marginTop: "0.5rem", color: "#FFFFFF" }}>
                            {JSON.stringify(data.failures[activeLabel], null, 2)}
                        </div>
                    )}
                </div>
                {data && data.statistics && (<div className="" style={{fontSize: "2rem", fontWeight: 600, padding: "2rem 0"}}>{`= ${data.statistics.ovens.full} Ovens And Change`}</div>)}
                <div className="" style={{display: "flex", gap: "1rem", alignItems: "end"}}>
                    {data && data.statistics && (
                        <div className="oven-box-wrapper" style={style_oven_box_wrapper}>
                            {Array.from({ length: data.statistics.ovens.full }, (_, index) => (
                                <div key={index} style={{ ...style_oven_box, ...style_oven_box_aspect }}>
                                    <div style={style_oven_box_inner}>
                                        {/* Oven {index + 1} */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {data && data.statistics && (
                        <div className="oven-remainder-box-wrapper" style={style_oven_spool_box_wrapper}>
                            {Array.from({ length: data.statistics.ovens.remainder }, (_, index) => (
                                <div key={index} className="oven-remainder-box" style={style_oven_spool_box}>
                                    <div style={{}}>
                                        {/* Remainder {index + 1} */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {data && data.statistics.available && (
                    <div className="">{Object.keys(data.statistics.available).map((oven) => (
                        <div className="">{oven}</div>
                    ))}</div>
                )}
            </div>
        </div>
    );
}

export default Extrusion;

import React, { useEffect, useState } from "react";
import moment from 'moment';

const sample_start_date = moment()
const sample_end_date = moment().add(1, 'days')

const sample_formatted_start_date = sample_start_date.format('YYYY-MM-DD')
const sample_formatted_end_date = sample_end_date.format('YYYY-MM-DD')
const sample_formatted_line_id = "EX03"

const sample_response = `[["", "Week #", "", "EX00", "EX01", "EX03", "EX04", "Compounding", "Fiber", "Other"],
                ["", "44", "Monday", "", "", "", "", "", "", ""], ["", "", "Tuesday", "", "", "", "", "", "", ""],
                ["", "", "Wednesday", "", "", "", "", "", "", ""], ["", "", "Thursday", "", "", "", "", "", "", ""],
                ["1", "", "Friday ", "", "", "ONYX XL", "ONYX", "", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["", "", "", "EX00", "EX01", "EX03", "EX04", "Compounding", "Fiber", "Other"],
                ["4", "45", "Monday", "17-4v2", "", "ONYX", "ONYX", "", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["5", "", "Tuesday", "17-4v2", "", "ONYX", "ONYX", "", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["6", "", "Wednesday", "17-4v2", "", "ONYX", "ONYX", "", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["7", "", "Thursday", "17-4v2", "", "ONYX", "ONYX", "", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["8", "", "Friday ", "17-4v2", "", "ONYX", "ONYX", "", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["", "", "", "EX00", "EX01", "EX03", "EX04", "Compounding", "Fiber", "Other"],
                ["11", "46", "Monday", "", "", "", "", "", "", ""],
                ["12", "", "Tuesday", "", "", "ONYX", "ONYX", "17-4v2?", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["13", "", "Wednesday", "", "ONYX FR", "ONYX", "ONYX", "17-4v2?", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["14", "", "Thursday", "", "ONYX FR", "ONYX", "ONYX", "17-4v2?", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["15", "", "Friday", "", "ONYX FR", "ONYX", "ONYX", "17-4v2?", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["", "", "", "EX00", "EX01", "EX03", "EX04", "Compounding", "Fiber", "Other"],
                ["18", "47", "Monday", "ESDv2", "", "ONYX", "ONYX", "17-4v2?", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["19", "", "Tuesday ", "ESDv2", "", "ONYX", "ONYX", "17-4v2?", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["20", "", "Wednesday", "ESDv2", "", "ONYX", "ONYX", "17-4v2?", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["21", "", "Thursday", "ESDv2", "", "ONYX", "ONYX", "17-4v2?", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["22", "", "Friday", "ESDv2", "", "ONYX", "ONYX", "17-4v2?", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["", "", "", "EX00", "EX01", "EX03", "EX04", "Compounding", "Fiber", "Other"],
                ["25", "48", "Monday", "", "", "ONYX", "ONYX", "", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["26", "", "Tuesday ", "", "", "ONYX", "ONYX", "", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["27", "", "Wednesday", "", "", "ONYX", "ONYX", "", "CFU 2CFA 12CAR 4KEV HST 5FIB", ""],
                ["28", "", "Thursday", "", "", "", "", "", "", ""],
                ["29", "", "Friday", "", "", "", "", "", "", ""]]"`

let backgroundColor_set = ["#000000", "#FFFFFF"]
let color_set = ["#dedede", "#000000"]

const theme_style_documentation = {
    light: {


    },
    dark: {

    },
    contrast: {

    },
    experimental: {

    },
}

const style_content = {
    paddingLeft: "3rem",
    paddingRight: "3rem",
}

const style_documentation_root = {
    font: "1rem",
    padding: "2rem",
    // border: "1px solid white"
};


const style_modify_response = {
    display: "inline",
    marginLeft: "1rem"
};



function Documentation() {
    const [isHovered, setIsHovered] = useState(false);
    const [selectedBackgroundIndex, setSelectedBackgroundIndex] = useState(0);

    const style_request_link = {
        // backgroundColor: "#ffffff29",
        // padding: "0.1rem 0.25rem",
        textDecoration: "none",
        fontSize: "1.5rem",
        // lineHeight: "3rem",
        color: selectedBackgroundIndex ? (isHovered ? "#17171772" : "#171717") : (isHovered ? "#ffffff" : "#ffffff72"),
    };

    const style_section_link = {
        padding: "0.1rem 0.25rem",
        textDecoration: "none",
        borderRadius: "0.25rem",
        fontSize: "1rem",
        // backgroundColor: selectedBackgroundIndex ? "#f4f4f4" : "#111111ae",

        backgroundColor: selectedBackgroundIndex ? "#f4f4f4" : "#ffffff29",
        color: selectedBackgroundIndex ? "#333333" : "#ffffff72",
        letterSpacing: "1px"

    };

    const styleTableContainer = {
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "1rem",
        fontFamily: "Arial, sans-serif",
        borderRadius: "5rem",
    };

    const styleTableHeader = {
        backgroundColor: selectedBackgroundIndex ? "#f4f4f4" : "#111111ae",
        textAlign: "left",
        borderRadius: "5rem",
    };

    const styleTableCell = {
        border: `1px solid ${selectedBackgroundIndex ? "#dddddd" : "#171717"}`,
        padding: "0.75rem",
        color: selectedBackgroundIndex ? "#333333" : "#696969",
    };

    const styleTableRow = {
        transition: "background-color 0.3s ease",
    };

    const style_route = {
        // general
        // backgroundColor: "blue",
        display: "flex",
        // border: "1px solid orange",
        flexDirection: "column",
        marginBottom: "2rem",

        // sub
        route: {
            fontSize: "2.5rem",
            letterSpacing: "0.25rem",
            fontWeight: 400,
            underline: "dotted",
            // backgroundColor: "lightblue",
            // textDecoration: "underline",
            textDecorationStyle: "solid",
            textDecorationThickness: "1px",
            textDecorationColor: "darkgray",
            marginBottom: "1rem",
        },
        type: {
            fontSize: "2rem",
            backgroundColor: "brown",

        },
        status: {
            ON: {
                borderRadius: "2rem",
                color: "limegreen",

            },
            OFF: {
                borderRadius: "2rem",
                color: "gray",
            }
        },
        label: {
            //gen
            padding: "0.15rem 0.25rem",
            borderRadius: "0.25rem",
            height: "fit-content",
            fontSize: "0.75rem",
            fontWeight: 700,
            // req styles
            GET: {
                color: "green",
                backgroundColor: "lightgreen",
            },
            HEAD: {
                color: "blue",
                backgroundColor: "lightblue",

            },
            POST: {
                color: "orange",
                backgroundColor: "lightorange",
            },
            DELETE: {
                color: "green",
                backgroundColor: "lightgreen",
            }
        },
        description: {
            overflow: "wrap",
            width: "75%",
            fontSize: "1.15rem",
            marginBottom: "1rem",
        },
        preview: {
            display: "flex",
            flexDirection: "row",
            gap: "0.75rem",
            // textDecoration: "underline",
            maxHeight: "20rem",
            marginBottom: "0.5rem",
            request: {
                flexBasis: "30%",
                borderRadius: "0.25rem",
                overflow: "wrap",
                wrapType: "break-word",
                padding: "1rem",
                textDecoration: "none",
                border: `1px solid ${selectedBackgroundIndex ? "#dddddd" : "#171717"}`,
            },
            response: {
                flexBasis: "70%",
                borderRadius: "0.25rem",
                backgroundColor: selectedBackgroundIndex ? "rgb(244, 244, 244)" : "#111111ae",
                overflow: "scroll",
                padding: "1rem",
                textDecoration: "none",
                color: selectedBackgroundIndex ? "#111111" : "#bdbdbd",
                border: `1px solid ${selectedBackgroundIndex ? "#dddddd" : "#2929298a"}`,


            }
        }
    };


    const routeDetails = [
        // {
        //     route: "/api/current",
        //     type: ["GET", "HEAD"],
        //     params: ["@start_date", "@end_date"],
        //     desc: <div>Streams data from 3 most recently produced spools, used in Extrusion page under <a href="/extrusion">live.</a> Provided data includes spool_id, runtime & length</div>,
        //     status: "live",
        //     dependencies: "mf-ignition.production_schedules",
        //     tags: ["extrusion", "public"],
        //     request: "",
        //     response: "",
        // },
        //extrusion  docs
        {
            route: "/api/extruder",
            type: ["GET", "HEAD"],
            params: {
                optional: [
                    { value: "@start_date", format: "YYYY-MM-DD", sample: sample_formatted_start_date },
                    { value: "@end_date", format: "YYYY-MM-DD", sample: sample_formatted_end_date },
                ],
                required: [
                    { value: "@line_id", format: "EX<00-04>", sample: sample_formatted_line_id },
                ],
            },
            desc: <div>Endpoint for retrieving the daily extrusion data.
                This endpoint returns extrusion data for the current month
                (or a specified date range), counts the occurrences of each status
                (gs, qc, sc) in JSON format. Utilized in the <a href="/extrusion/#produced" style={style_section_link}>Extrusion &gt; produced</a> section*.
            </div>,
            status: "live",
            dependencies: "mf-ignition.extrusion_runs",
            tags: ["extrusion"],
            request: <a
                href={`http://localhost:5000/api/extruder?line_id=$EX03&start_date=${sample_formatted_start_date}&end_date=${sample_formatted_end_date}`}
                style={style_request_link}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                ~/api/extruder?line_id=$EX03&start_date={sample_formatted_start_date}&end_date={sample_formatted_end_date}
            </a>,

            response: sample_response,
        },
        // {
        //     route: "/api/current/fiber",
        //     type: ["GET", "HEAD"],
        //     params: ["@start_date", "@end_date"],
        //     desc: "Provides info on",
        //     status: "live",
        //     dependencies: "mf-ignition.production_spools",
        //     tags: ["extrusion"],
        //     request: "",
        //     response: "",
        // },
        // {
        //     route: "/api/current/compounding",
        //     type: ["GET", "HEAD"],
        //     params: ["@start_date", "@end_date"],
        //     desc: "Provides info on",
        //     status: "live",
        //     dependencies: ["mf-ignition.compounding_lots", "mf-ignition.compounding_recipies", "mf-ignition.compounding_lots"],
        //     tags: ["extrusion"],
        //     request: "",
        //     response: "",
        // },
        // {
        //     route: "/api/current/ovens",
        //     type: ["GET", "HEAD"],
        //     params: ["@start_date", "@end_date"],
        //     desc: "Provides info on",
        //     status: "live",
        //     dependencies: ["mf-ignition.ovens", "mf-ignition.ovens_unloading"],
        //     tags: ["extrusion"],
        //     request: "",
        //     response: "",
        // },
    ]

    const [expandPreview, setExpandPreview] = useState(Array(routeDetails.length).fill(true))


    return (
        <div className="documentation-root" style={{ backgroundColor: `${backgroundColor_set[selectedBackgroundIndex]}`, color: `${color_set[selectedBackgroundIndex]}`, ...style_documentation_root, ...style_content }}>
            {/* <div style={{}}>
                <button>extrusion</button>
                <button>fiber</button>
                <button>comoounding</button>
                <button>live</button>
                <button>machine</button>                
            </div> */}
            <button
                onClick={() => setSelectedBackgroundIndex(selectedBackgroundIndex < backgroundColor_set.length ? selectedBackgroundIndex + 1 : 0)}
            >
                click me
            </button>
            {/* <pre>{JSON.stringify(routeDetails, null, 2)}</pre> */}
            {routeDetails.map((route, i) => (
                <div style={style_route} key={i}>
                    <div style={{ display: "flex", flexDirection: "row", gap: "0.25rem", alignItems: "center" }}>
                        <div style={style_route.route}><div className="" style={{ fontSize: "1rem", display: "inline" }}></div>{route.route}</div>
                        {route.type.map((type, j) =>
                            <div key={j} style={{ ...style_route.label, ...style_route.label[type] }}>{type}</div>
                        )}
                        <div style={route.status === "live" ? style_route.status.ON : style_route.status.OFF}>o</div>
                    </div>
                    {/* <div style={style_route.type}>{route.type} hello</div> */}
                    <div style={style_route.description}>{route.desc}</div>
                    <table style={styleTableContainer}>
                        <thead>
                            <tr style={styleTableHeader}>
                                <th style={styleTableCell}>Key</th>
                                <th style={styleTableCell}>Values</th>
                                <th style={styleTableCell}>Format</th>
                                <th style={styleTableCell}>Sample</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(route.params).map(([key, value]) => (
                                <React.Fragment key={key}>
                                    {value.map((item, index) => (
                                        <tr
                                            key={index}
                                            style={styleTableRow}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = selectedBackgroundIndex ? "#f1f1f1" : "rgba(17, 17, 17, 0.682)")}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                        >
                                            <td style={styleTableCell}>{key}</td>
                                            <td style={styleTableCell}>{item.value}</td>
                                            <td style={styleTableCell}>{item.format}</td>
                                            <td style={styleTableCell}>{item.sample}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    {/* <div style={style_route.dependencies}>{route.dependencies}</div> */}
                    <div className="" style={{ marginBottom: "0.5rem", textDecoration: "underline", textUnderlineOffset: "2px", textDecorationStyle: "solid", textDecorationColor: selectedBackgroundIndex ? "#dddddd" : "#171717", color: selectedBackgroundIndex ? "#333333" : "#ffffff72" }}>{expandPreview && expandPreview[i] ? "hide response" : "preview request"}</div>
                    <div style={style_route.preview}
                        onClick={() => {
                            expandPreview[i] = expandPreview[i] ? false : true;
                            setExpandPreview(expandPreview);
                        }}>
                        {expandPreview[i] === true &&
                            <>
                                <div style={style_route.preview.request}>{route.request}</div>
                                {console.log("internal expanded preview", expandPreview)}
                                <div style={style_route.preview.response}>{route.response}</div>
                            </>
                        }
                    </div>
                    <div className="" style={{ textAlign: "right", fontWeight: 500, color: "#333333", paddingTop: "0rem" }}>
                        <div className="" style={style_modify_response}>copy</div>
                        <div className="" style={style_modify_response}>paste</div>
                        <div className="" style={style_modify_response}>edit</div>
                        <div className="" style={style_modify_response}>hit</div>
                    </div>
                </div>
            ))}
        </div>
    )
} export default Documentation;
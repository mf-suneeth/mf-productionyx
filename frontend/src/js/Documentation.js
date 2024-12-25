import React, { useEffect, useState } from "react";
import moment from 'moment';

const sample_start_date = moment()
const sample_end_date = moment().add(1, 'days')

const sample_formatted_start_date = sample_start_date.format('YYYY-MM-DD')
const sample_formatted_end_date = sample_end_date.format('YYYY-MM-DD')


const routeDetails = [
    {
        route: "/api/current",
        type: ["GET", "HEAD"],
        params: ["@start_date", "@end_date"],
        desc: <div>Streams data from 3 most recently produced spools, used in Extrusion page under <a href="/extrusion">live.</a> Provided data includes spool_id, runtime & length</div>,
        status: "live",
        dependencies: "mf-ignition.production_schedules",
        tags: ["extrusion"],
        request: "",
        response: "",
    },
    //extrusion  docs
    {
        route: "/api/extruder",
        type: ["GET", "HEAD"],
        params: {
            opt: ["@start_date=:<YYYY-MM-DD>", "@end_date=:<YYYY-MM-DD>"],
            req: ["@line_id=:EX<00-04>"]
        },
        desc: <div>Endpoint for retrieving the daily extrusion data.
            This endpoint returns extrusion data for the current month
            (or a specified date range), counts the occurrences of each status
            (gs, qc, sc) in JSON format. Data appears in the <a href="/extrusion/#produced">extruder-produced</a> section.
        </div>,
        status: "live",
        dependencies: "mf-ignition.extrusion_runs",
        tags: ["extrusion"],
        request: <a href="">
            http://localhost:5000/api/extruder?line_id=$EX<span contentEditable>03</span>&start_date={sample_formatted_start_date}&end_date={sample_formatted_end_date}
        </a>,
        response: `[["", "Week #", "", "EX00", "EX01", "EX03", "EX04", "Compounding", "Fiber", "Other"],
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
            ["29", "", "Friday", "", "", "", "", "", "", ""]]"`,
    },
    {
        route: "/api/current/fiber",
        type: ["GET", "HEAD"],
        params: ["@start_date", "@end_date"],
        desc: "Provides info on",
        status: "live",
        dependencies: "mf-ignition.production_spools",
        tags: ["extrusion"],
        request: "",
        response: "",
    },
    {
        route: "/api/current/compounding",
        type: ["GET", "HEAD"],
        params: ["@start_date", "@end_date"],
        desc: "Provides info on",
        status: "live",
        dependencies: ["mf-ignition.compounding_lots", "mf-ignition.compounding_recipies", "mf-ignition.compounding_lots"],
        tags: ["extrusion"],
        request: "",
        response: "",
    },
    {
        route: "/api/current/ovens",
        type: ["GET", "HEAD"],
        params: ["@start_date", "@end_date"],
        desc: "Provides info on",
        status: "live",
        dependencies: ["mf-ignition.ovens", "mf-ignition.ovens_unloading"],
        tags: ["extrusion"],
        request: "",
        response: "",
    },
]

let backgroundColor_set = ["black", "white", "red", "green"]
let color_set = ["white", "black", "yellow", "white"]

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

const style_documentation_root = {
    font: "1rem",
    padding: "2rem",
    // border: "1px solid white"
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
        textDecoration: "underline",
        textDecorationStyle: "solid",
        textDecorationThickness: "1px",
        textDecorationColor: "darkgray",
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
        // marginBottom: "10.5rem",

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
    },
    preview: {
        display: "flex",
        flexDirection: "row",
        gap: "1rem",
        // textDecoration: "underline",
        maxHeight: "15rem",
        request: {
            flexBasis: "50%",
            borderRadius: "0.5rem",
            overflow: "scroll",
            padding: "1rem",
            textDecoration: "none",
            backgroundColor: "#33333380", 
            color: "#222", 
            border: "1px solid #555",
            fontSize: "1.5rem"

        },
        response: {
            flexBasis: "50%",
            borderRadius: "0.5rem",
            backgroundColor: "lightblue",
            overflow: "scroll",
            padding: "1rem",
            textDecoration: "none",
            backgroundColor: "#DDDDDD", 
            color: "#222222",
            border: "1px solid #FFFFFF"


        }
    }
}




function Documentation() {
    const [selectedBackgroundIndex, setSelectedBackgroundIndex] = useState(0);
    console.log("routelength", routeDetails.length)
    const [expandPreview, setExpandPreview] = useState(Array(routeDetails.length).fill(true))

    return (
        <div className="documentation-root" style={{ backssgroundColor: `${backgroundColor_set[selectedBackgroundIndex]}`, color: `${color_set[selectedBackgroundIndex]}`, ...style_documentation_root }}>
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
                    {i}
                    <div style={{ display: "flex", flexDirection: "row", gap: "0.25rem", alignItems: "center" }}>
                        <div style={style_route.route}>{route.route}</div>
                        {route.type.map((type, j) =>
                            <div key={j} style={{ ...style_route.label, ...style_route.label[type] }}>{type}</div>
                        )}
                        {/* <div style={route.status === "live" ? style_route.status.ON : style_route.status.OFF}>o</div> */}
                    </div>
                    {/* <div style={style_route.type}>{route.type} hello</div> */}
                    <div style={style_route.parameters}>{JSON.stringify(route.params)}</div>
                    <div style={style_route.description}>{route.desc}</div>
                    <div style={style_route.dependencies}>{route.dependencies}</div>
                    <div className="">{expandPreview && expandPreview[i] ? "hide" : "preview"}</div>
                    <div style={style_route.preview}
                        onClick={() => {
                            expandPreview[i] = expandPreview[i] ? false : true
                            setExpandPreview(expandPreview)
                        }}> 
                        {expandPreview[i] === true &&
                            <>
                                    <div style={style_route.preview.request}>{route.request}</div>
                                    {console.log("internal expanded preview", expandPreview)}
                                    <div style={style_route.preview.response}>{route.response}</div>
                            </>
                        }
                    </div>
                    <div className="">copy</div>
                    <div className="">paste</div>
                    <div className="">edit</div>
                    <div className="">hit</div>                    
                </div>
            ))}
        </div>
    )






} export default Documentation;
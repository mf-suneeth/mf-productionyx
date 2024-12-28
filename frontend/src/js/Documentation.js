import React, { useEffect, useState } from "react";
import moment from "moment";

const sample_hostname_port = "http://localhost:5000";
const sample_start_date = moment();
const sample_end_date = moment().add(1, "days");

const sample_formatted_start_date = sample_start_date.format("YYYY-MM-DD");
const sample_formatted_end_date = sample_end_date.format("YYYY-MM-DD");
const sample_formatted_line_id = "EX03";

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
                ["29", "", "Friday", "", "", "", "", "", "", ""]]"`;

let backgroundColor_set = ["#000000", "#FFFFFF"];
let color_set = ["#dedede", "#000000"];

const theme_style_documentation = {
  light: {},
  dark: {},
  contrast: {},
  experimental: {},
};

function Documentation(props) {
  const [isHovered, setIsHovered] = useState(false);
//   const [props.mode, setSelectedBackgroundIndex] = useState(0);
  const [rowsModified, setRowsModified] = useState(30);
  const [freshFetch, setFreshFetch] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTag, setActiveTag] = useState("route");
  const [howTo, setHowTo] = useState(false);

  const style_button_mode = {
    padding: "0.2rem 0.5rem",
    border: `0.5px solid ${props.mode ? "#DDDDDD" : "#333333"}`,
    backgroundColor: props.mode ? "#f4f4f4" : "#111111",
    color: props.mode ? "#333333" : "#ffffff72",
    borderRadius: "0.25rem",
    fontWeight: "400",
    display: "flex",
    flexDirection: "row",
    gap: "0.5rem",
  };

  const randomizeNumber = () => {
    const randomRows = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
    setRowsModified(randomRows);
  };

  const randomizeLineId = () => {
    const randomRows = Math.floor(Math.random() * (4 - 0 + 1)) + 0;
    return randomRows;
  };

  const handleHit = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setFreshFetch(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  const handleSave = (text, route) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      "scheduler_" +
      route.replace("/", "_") +
      moment().format("_YYYY_MM_DD_HH_MM_SS"); // Default file name
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrettify = (data) => {
    return (
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          margin: "1rem 0",
          fontSize: "0.9rem",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <thead>
          {data[0] && (
            <tr>
              {data[0].map((header, index) => (
                <th
                  key={index}
                  style={{
                    border: "1px solid #ddd",
                    padding: "0.5rem",
                    textAlign: "left",
                    backgroundColor: "#f4f4f4",
                    color: "#333",
                    fontWeight: "bold",
                  }}
                >
                  {header || "-"}
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {data.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex} style={{ borderBottom: "1px solid #ddd" }}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  style={{
                    border: "1px solid #ddd",
                    padding: "0.5rem",
                    textAlign: "left",
                    color: "#555",
                  }}
                >
                  {cell || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const handleFilterClick = (tag) => {
    setActiveTag((prevTag) => (prevTag === tag ? "route" : tag));
  };

  const style_content = {
    paddingLeft: "3rem",
    paddingRight: "3rem",
  };

  const style_documentation_root = {
    font: "1rem",
    padding: "1rem 2rem",

    // border: "1px solid white"
  };

  const style_modify_response = {
    textAlign: "right",
    color: "#333333",
    display: "flex",
    justifyContent: "space-between",
    width: "fit-content",
    label: {
      display: "inline",
      marginRight: "1rem",
      textDecoration: "underline",
      textUnderlineOffset: "2px",
      textDecorationStyle: "solid",
      textDecorationColor: props.mode ? "#dddddd" : "#1e1e1e",
      color: props.mode ? "#333333" : "#ffffff72",
    },
  };

  const style_request_link = {
    // backgroundColor: "#ffffff29",
    // padding: "0.1rem 0.25rem",
    textDecoration: "none",
    fontSize: "1.5rem",
    // lineHeight: "3rem",
    // color: selectedBackgroundIndex ? "#111111" : "#bdbdbd",
    color: props.mode
      ? isHovered
        ? "#171717"
        : "#111111cb"
      : isHovered
      ? "#ffffff"
      : "#bdbdbd",
  };

  const style_section_link = {
    padding: "0.15rem 0.25rem",
    textDecoration: "none",
    borderRadius: "0.25rem",
    fontSize: "1rem",
    backgroundColor: props.mode ? "#f4f4f4" : "#111111",
    color: props.mode ? "#333333" : "#ffffff72",
    letterSpacing: "1px",
  };

  const style_table = {
    container: {
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: "1rem",
      fontFamily: "Arial, sans-serif",
      borderRadius: "5rem",
    },
    header: {
      backgroundColor: props.mode ? "#f4f4f4" : "#111111ae",
      textAlign: "left",
      borderRadius: "5rem",
    },
    cell: {
      border: `1px solid ${props.mode ? "#dddddd" : "#171717"}`,
      padding: "0.75rem",
      color: props.mode ? "#333333" : "#696969",
    },
    row: {
      transition: "background-color 0.3s ease",
    },
  };

  const style_route = {
    // general
    // backgroundColor: "blue",
    display: "flex",
    // border: "1px solid orange",
    flexDirection: "column",

    // sub
    endpoint: {
      display: "flex",
      flexDirection: "row",
      gap: "0.25rem",
      alignItems: "baseline",
    },
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
      },
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
        color: "#ff6600",
        backgroundColor: "#ff660045",
      },
      PUT: {
        color: "#9d00ff",
        backgroundColor: "#9d00ff45",
      },
    },
    description: {
      overflow: "wrap",
      width: "75%",
      fontSize: "1.15rem",
      marginBottom: "0.5rem",
    },
    preview: {
      display: "flex",
      flexDirection: "row",
      gap: "1rem",
      // textDecoration: "underline",
      //   maxHeight: "20rem",
      wordBreak: "break-all",
      whiteSpace: "normal",
      request: {
        marginBottom: "0.25rem",
        borderRadius: "0.25rem",
        // overflow: "wrap",
        height: "90%",
        padding: "1rem",
        textDecoration: "none",
        border: `1px solid ${props.mode ? "#dddddd" : "#171717"}`,
      },
      response: {
        height: "90%",
        lineHeight: "1.25rem",
        marginBottom: "0.25rem",
        borderRadius: "0.25rem",
        backgroundColor: props.mode
          ? "rgb(244, 244, 244)"
          : "#111111ae",
        overflow: "scroll",
        padding: "1rem",
        textDecoration: "none",
        color: props.mode ? "#111111" : "#bdbdbd",
        border: `1px solid ${
          props.mode ? "#dddddd" : "#2929298a"
        }`,
      },
    },
  };
  const routeDetails = [
    // init routes
    {
      route: "/api/load",
      type: ["HEAD"],
      desc: (
        <div>
          Tests ignition db connection, used everywhere live data appears.
        </div>
      ),
      status: "live",
      source: "mf-ignition.production_schedule",
      tags: ["database", "ignition", "route"],
      request: (
        <a
          href={`http://localhost:5000/api/load`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/load
        </a>
      ),
      response: (
        <div className="">"message": "Successfully connected to database"</div>
      ),
    },
    // production routes
    {
      route: "/api/current",
      type: ["GET", "HEAD"],
      params: {
        required: [
          {
            value: "@start_date",
            format: "<YYYY-MM-DD>",
            sample: sample_formatted_start_date,
          },
          {
            value: "@end_date",
            format: "<YYYY-MM-DD>",
            sample: sample_formatted_end_date,
          },
        ],
      },
      desc: (
        <div>
          Endpoint for retrieving daily extrusion schedule. Returns data on
          which line is producing which material on a given shift. Used in the
          production page under{" "}
          <a href="/production/#materials_schedule" style={style_section_link}>
            Production &gt; Extrusion Map
          </a>
          .
        </div>
      ),
      status: "live",
      source: "mf-ignition.production_schedule",
      tags: ["production", "schedule", "route"],
      request: (
        <a
          href={`http://localhost:5000/api/current?start_date=${sample_formatted_start_date}&end_date=${sample_formatted_end_date}`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/current?start_date=
          {sample_formatted_start_date}
          &end_date={sample_formatted_end_date}
        </a>
      ),
      response: sample_response,
    },
    {
      route: "/api/current/fiber",
      type: ["GET", "HEAD"],
      params: {
        required: [
          {
            value: "@start_date",
            format: "<YYYY-MM-DD>",
            sample: sample_formatted_start_date,
          },
          {
            value: "@end_date",
            format: "<YYYY-MM-DD>",
            sample: sample_formatted_end_date,
          },
        ],
      },
      desc: (
        <div>
          Endpoint for retrieving the daily fiber schedule. Returns data on
          which line is producing which material at a given time. Used in the
          Production page under{" "}
          <a href="/production/#produced_fiber" style={style_section_link}>
            Production &gt; Fiber
          </a>
          .
        </div>
      ),
      status: "live",
      source: "mf-ignition.production_spools",
      tags: ["production", "fiber", "route"],
      request: (
        <a
          href={`http://localhost:5000/api/current/fiber?start_date=${sample_formatted_start_date}&end_date=${sample_formatted_end_date}`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/current/fiber?start_date=
          {sample_formatted_start_date}
          &end_date={sample_formatted_end_date}
        </a>
      ),

      response:
        JSON.stringify(`Spool ID,Count,Start Time,Weeknum,FiberLine,Material,Run Length (m),Run Time (mins),Finish Time,Good Meters Unpadded Yield,Good Meters Unpadded Count,Pad the Bad Sections Yield,Pad the Bad Sections Count,Remove Too Short or Bad Yield,Remove Too Short or Bad Count,Good Meters Incl. GP Yield,Good Meters Incl. GP Count,respooled yield,Binned Respooled Count,Binned Respooled Yield,respooled count,50cc eq. Produced,150ccs Produced,Respooled 150 Count,150cc Yield,Spooling Instructions,XY_mean_good,XY_std_good,XY_mean_all,XY_std_all,XX_mean_good,XX_std_good,XX_mean_all,XX_std_all,YY_mean_good,YY_std_good,YY_mean_all,YY_std_all,minarea1m_loss,maxarea1m_loss,x_minareasingleaxis1m_loss,x_maxareasingleaxis1m_loss,y_minareasingleaxis1m_loss,y_maxareasingleaxis1m_loss,minarea20m_loss,maxarea20m_loss,qcstatus
        FP05_FIB_241101_2102,1,2024-11-01 21:02:00,44,FP05,FIB,95,23.75,2024-11-01 21:25:45,0.9578947368421052,91,0.6526315789473685,62,0.010526315789473684,1,0.010526315789473684,1,0.0,0.0,0.0,0,0,0,0,0.0,"[_] RP 94m
        ",nan,nan,0.0907031368421053,0.0023046220268272606,nan,nan,0.08594375789473684,0.009877371547570409,nan,nan,0.09784749473684207,0.009154813927079347,0.010869565217391304,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0
        FP10_CAR_241028_0831,1,2024-10-28 08:31:00,44,FP10,CAR,6505,2168.333333333333,2024-10-29 20:39:20,0.9884704073789393,6430,0.945119139123751,6148,0.8645657186779401,5624,0.8178324365872406,5320,0.7541890853189854,4000.0,0.7,4906,11,3,4014,0.6170637970791699,"[_] RS 1
        [_] RP 151m
        [_] GS 1
        [_] RP 268m
        [_] GP 413m
        [_] RP 244m
        [_][_][_][_] GS 4/10
        [_][_][_][_] GS 4/10
        [_][_] GS 2/10
        [_] RP 76m`),
    },
    {
      route: "/api/current/compounding",
      type: ["GET", "HEAD"],
      params: {
        required: [
          {
            value: "@start_date",
            format: "<YYYY-MM-DD>",
            sample: sample_formatted_start_date,
          },
          {
            value: "@end_date",
            format: "<YYYY-MM-DD>",
            sample: sample_formatted_end_date,
          },
        ],
      },
      desc: (
        <div>
          Endpoint for retrieving the daily compounding schedule. Returns data
          on which lots were used, mass of material compounded and remaining
          mass of lot. sed in the Production page under{" "}
          <a href="/production/#compounded_lots" style={style_section_link}>
            Production &gt; Compounding
          </a>
          .
        </div>
      ),
      status: "live",
      source: "mf-ignition.production_spools",
      tags: ["production", "compounding", "route"],
      request: (
        <a
          href={`http://localhost:5000/api/current/compounding?start_date=${sample_formatted_start_date}&end_date=${sample_formatted_end_date}`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}
          <br></br>/api/current/compounding?<br></br>start_date=
          {sample_formatted_start_date}
          <br></br>
          &end_date={sample_formatted_end_date}
        </a>
      ),

      response:
        JSON.stringify(`Spool ID,Count,Start Time,Weeknum,FiberLine,Material,Run Length (m),Run Time (mins),Finish Time,Good Meters Unpadded Yield,Good Meters Unpadded Count,Pad the Bad Sections Yield,Pad the Bad Sections Count,Remove Too Short or Bad Yield,Remove Too Short or Bad Count,Good Meters Incl. GP Yield,Good Meters Incl. GP Count,respooled yield,Binned Respooled Count,Binned Respooled Yield,respooled count,50cc eq. Produced,150ccs Produced,Respooled 150 Count,150cc Yield,Spooling Instructions,XY_mean_good,XY_std_good,XY_mean_all,XY_std_all,XX_mean_good,XX_std_good,XX_mean_all,XX_std_all,YY_mean_good,YY_std_good,YY_mean_all,YY_std_all,minarea1m_loss,maxarea1m_loss,x_minareasingleaxis1m_loss,x_maxareasingleaxis1m_loss,y_minareasingleaxis1m_loss,y_maxareasingleaxis1m_loss,minarea20m_loss,maxarea20m_loss,qcstatus
          FP05_FIB_241101_2102,1,2024-11-01 21:02:00,44,FP05,FIB,95,23.75,2024-11-01 21:25:45,0.9578947368421052,91,0.6526315789473685,62,0.010526315789473684,1,0.010526315789473684,1,0.0,0.0,0.0,0,0,0,0,0.0,"[_] RP 94m
          ",nan,nan,0.0907031368421053,0.0023046220268272606,nan,nan,0.08594375789473684,0.009877371547570409,nan,nan,0.09784749473684207,0.009154813927079347,0.010869565217391304,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0
          FP10_CAR_241028_0831,1,2024-10-28 08:31:00,44,FP10,CAR,6505,2168.333333333333,2024-10-29 20:39:20,0.9884704073789393,6430,0.945119139123751,6148,0.8645657186779401,5624,0.8178324365872406,5320,0.7541890853189854,4000.0,0.7,4906,11,3,4014,0.6170637970791699,"[_] RS 1
          [_] RP 151m
          [_] GS 1
          [_] RP 268m
          [_] GP 413m
          [_] RP 244m
          [_][_][_][_] GS 4/10
          [_][_][_][_] GS 4/10
          [_][_] GS 2/10
          [_] RP 76m`),
    },
    //extrusion routes
    {
      route: "/api/extruder",
      type: ["GET", "HEAD"],
      params: {
        optional: [
          {
            value: "@start_date",
            format: "<YYYY-MM-DD>",
            sample: sample_formatted_start_date,
          },
          {
            value: "@end_date",
            format: "<YYYY-MM-DD>",
            sample: sample_formatted_end_date,
          },
        ],
        required: [
          {
            value: "@line_id",
            format: "<EX__>",
            sample: `EX0${randomizeLineId()}`,
          },
        ],
      },
      desc: (
        <div>
          Endpoint for retrieving the daily extrusion data. This endpoint
          returns extrusion data for the current month (or a specified date
          range), counts the occurrences of each status (gs, qc, sc) in JSON
          format. Utilized in the{" "}
          <a href="/extrusion/#produced" style={style_section_link}>
            Extrusion &gt; produced
          </a>{" "}
          section.
        </div>
      ),
      status: "live",
      source: "mf-ignition.extrusion_runs",
      tags: ["extrusion", "stream", "route"],
      request: (
        <a
          href={`http://localhost:5000/api/extruder?line_id=$EX03&start_date=${sample_formatted_start_date}&end_date=${sample_formatted_end_date}`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/extruder?line_id=$EX03&start_date=
          {sample_formatted_start_date}
          &end_date={sample_formatted_end_date}
        </a>
      ),

      response: sample_response,
    },
    {
      route: "/api/extruder/live",
      type: ["GET", "HEAD"],
      params: {
        optional: [{ value: "@spool_count", format: "integer", sample: 3 }],
        required: [
          {
            value: "@line_id",
            format: "<EX__>",
            sample: `EX0${randomizeLineId()}`,
          },
        ],
      },
      desc: (
        <div>
          Endpoint for streaming current extrusion data. Defaults to 3 most
          recently produced spools, provided data includes spool_id, runtime &
          length. Used in Extrusion page under{" "}
          <a href="/extrusion/#produced" style={style_section_link}>
            Extrusion &gt; live
          </a>{" "}
          section*.
        </div>
      ),
      status: "live",
      source: "mf-ignition.extrusion_runs",
      tags: ["extrusion", "stream", "route"],
      request: (
        <a
          href={`http://localhost:5000/api/extruder/live?line_id=$EX03&spool_count=3`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/extruder/live?line_id=$EX03&start_date=
          {sample_formatted_start_date}
          &end_date={sample_formatted_end_date}
        </a>
      ),

      response: sample_response,
    },
    // scheduling routes
    {
      route: "/api/schedule/existing",
      type: ["GET", "HEAD"],
      desc: (
        <div>
          Endpoint for displaying existing month data when creating new schedule
          in the
          <a href="/schedule" style={style_section_link}>
            Schedule
          </a>
          tab. Renders labels for months with existing ignition schedules data
          in the select month form card (under
          <a href="/schedule/#existing_months" style={style_section_link}>
            Schedule &gt; Existing Months
          </a>
          section).
        </div>
      ),
      status: "live",
      source: "mf-ignition.production_schedule",
      tags: ["schedule", "route"],
      request: (
        <a
          href={`http://localhost:5000/api/schedule/existing`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/schedule/existing
        </a>
      ),

      response: JSON.stringify({
        signature: "2024-08",
        materials: ["ONX", "D2V2", "OXL", "ONX", "CPP"],
        goals: {
          ONX: 1000,
          D2V2: 1000,
          OXL: 6000,
          ONX: 1000,
          CPP: 1000,
        },
      }),
    },
    {
      route: "/api/schedule/redo",
      type: ["POST", "PUT"],
      desc: (
        <div>
          Endpoint for overwriting and deleting monthly entries in the database.
          This endpoint handles the overwriting and deletion of existing
          production schedule entries in
          <a href="/schedule/#submit" style={style_section_link}>
            Schedule &gt; Submit
          </a>
          for a specific month. Reads request data and updates the database
          accordingly.
        </div>
      ),
      status: "live",
      source: "mf-ignition.production_schedule",
      tags: ["schedule", "route"],
      request: (
        <a
          href={`http://localhost:5000/api/schedule/redo`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/schedule/redo
        </a>
      ),

      response: (
        <>
          <div>Data submitted sucessfully.</div>{" "}
          <div onClick={randomizeNumber} style={{ cursor: "pointer" }}>
            {rowsModified} rows modified. (Click to randomize)
          </div>
        </>
      ),
    },
    {
      route: "/api/goals/redo",
      type: ["POST", "PUT"],
      desc: (
        <div>
          Endpoint for overwriting and deleting monthly goals in the database.
          This endpoint handles the entering and modifying production goals
          entries in
          <a href="/schedule/#goals" style={style_section_link}>
            Schedule &gt; Goals
          </a>
          for a specific month. Hotwrites to database on input.
        </div>
      ),
      status: "live",
      source: "mf-ignition.production_schedule",
      tags: ["schedule", "route"],
      request: (
        <a
          href={`http://localhost:5000/api/goals/redo`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/goals/redo
        </a>
      ),

      response: (
        <>
          <div>Data submitted sucessfully.</div>{" "}
          <div onClick={randomizeNumber} style={{ cursor: "pointer" }}>
            {rowsModified} rows modified. (Click to randomize)
          </div>
        </>
      ),
    },
    // hardware routes
    {
      route: "/api/hardware/",
      type: ["GET"],
      desc: (
        <div>
          Lorem ipsum dolor sit amet ipsing consequiter sont.
          <a href="/schedule/#goals" style={style_section_link}>
            lorem &gt; ipsum
          </a>
          .
        </div>
      ),
      status: "live",
      source: "mf-ignition.production_schedule",
      tags: ["schedule", "route"],
      request: (
        <a
          href={`enter_href_here`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/hardware/
        </a>
      ),
      response: <div>Sample response goes here.</div>,
    },
    {
      route: "/api/hardware/beaglebone",
      type: ["GET", "ASYNC"],
      params: {
        required: [
          {
            value: "@process_id",
            format: "<EX__> or <FP__> or  <RS__>",
            sample: `FP0${randomizeLineId()} RS0${randomizeLineId()} `,
          },
        ],
      },
      desc: (
        <div>
          Responsible for getting online status, device state, memory
          utilization and other device details. States appear in Hardware Page
          under devices:
          <a href="/hardware/#devices" style={style_section_link}>
            Hardware &gt; Devices
          </a>
          .
        </div>
      ),
      status: "live",
      source: "",
      tags: ["hardware", "route"],
      request: (
        <a
          href={`enter_href_here`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/hardware/beaglebone
        </a>
      ),
      response: <div>Sample response goes here.</div>,
    },
    {
      route: "/api/hardware/rumba",
      type: ["GET", "ASYNC"],
      params: {
        required: [
          {
            value: "@process_id",
            format: "<EX__> or <FP__> or  <RS__>",
            sample: `EX0${randomizeLineId()} FP0${randomizeLineId()} RS0${randomizeLineId()} `,
          },
        ],
      },
      desc: (
        <div>
          Responsible for getting online status, device state, memory
          utilization and other device details. States appear in Hardware Page
          under devices:
          <a href="/hardware/#devices" style={style_section_link}>
            Hardware &gt; Devices
          </a>
          .
        </div>
      ),
      status: "live",
      source: "",
      tags: ["hardware", "route"],
      request: (
        <a
          href={`enter_href_here`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/hardware/rumba?pid=FP07
        </a>
      ),
      response: <div>Sample response goes here.</div>,
    },
    {
      route: "/api/hardware/zumbach",
      type: ["GET", "ASYNC"],
      params: {
        required: [
          {
            value: "@process_id",
            format: "<EX__> or <FP__>",
            sample: `FP0${randomizeLineId()} RS0${randomizeLineId()} `,
          },
        ],
      },
      desc: (
        <div>
          Responsible for getting online status, device state, memory
          utilization and other device details. States appear in Hardware Page
          under devices:
          <a href="/hardware/#devices" style={style_section_link}>
            Hardware &gt; Devices
          </a>
          .
        </div>
      ),
      status: "live",
      source: "",
      tags: ["hardware", "route"],
      request: (
        <a
          href={`enter_href_here`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/hardware/rumba?pid=FP05
        </a>
      ),
      response: <div>Sample response goes here.</div>,
    },
    {
      route: "/api/machine/extruder",
      type: ["GET", "PATCH"],
      params: {
        required: [
          {
            value: "@process_id",
            format: "<EX__>",
            sample: `EX0${randomizeLineId()}`,
          },
        ],
      },
      desc: (
        <div>
          Responsible for streaming process parameters, also able to reboot and
          reset the line data.
          <a href="/hardware/#devices" style={style_section_link}>
            Hardware &gt; Machine
          </a>
          .
        </div>
      ),
      status: "live",
      source: "",
      tags: ["machine", "hardware", "route"],
      request: (
        <a
          href={`enter_href_here`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/machine/extruder?{sample_formatted_line_id}
        </a>
      ),
      response: <div>Sample response goes here.</div>,
    },
    {
      route: "/api/machine/fiber",
      type: ["GET", "PATCH"],
      params: {
        required: [
          {
            value: "@process_id",
            format: "<FP__>",
            sample: `FP0${randomizeLineId()}`,
          },
        ],
      },
      desc: (
        <div>
          Responsible for streaming process parameters (heater, clamp, dehair),
          also able to reboot and reset the line data.{" "}
          <a href="/hardware/#devices" style={style_section_link}>
            Harware &gt; Machine &gt; Fiber
          </a>
          .
        </div>
      ),
      status: "live",
      source: "",
      tags: ["machine", "hardware", "route"],
      request: (
        <a
          href={`enter_href_here`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/machine/extruder?{sample_formatted_line_id}
        </a>
      ),
      response: <div>Sample response goes here.</div>,
    },
    {
      route: "/api/machine/respool",
      type: ["GET", "PATCH"],
      params: {
        required: [
          {
            value: "@process_id",
            format: "<__>",
            sample: `FP0${randomizeLineId()}`,
          },
        ],
      },
      desc: (
        <div>
          Responsible for streaming process parameters running/off, also able to
          reboot and reset the line data.
          <a href="/hardware/#devices" style={style_section_link}>
            Machine &gt; Respool
          </a>
          .
        </div>
      ),
      status: "live",
      source: "",
      tags: ["machine", "hardware", "route"],
      request: (
        <a
          href={`enter_href_here`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/machine/respool?RS01
        </a>
      ),
      response: <div>Sample response goes here.</div>,
    },
    {
      route: "/api/machine/aux/printer",
      type: ["GET"],
      params: {
        required: [
          {
            value: "@process_id",
            format: "???",
            sample: `???`,
          },
        ],
      },
      desc: (
        <div>
          Responsible for streaming process parameters running/off, also able to
          reboot and reset the line data.
          <a href="/hardware/#devices" style={style_section_link}>
            Machine &gt; Printer
          </a>
          .
        </div>
      ),
      status: "live",
      source: "",
      tags: ["machine", "hardware", "packaging", "printer", "route"],
      request: (
        <a
          href={`enter_href_here`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/machine/aux/printer?pid=???
        </a>
      ),
      response: <div>Sample response goes here.</div>,
    },
    {
      route: "/api/network",
      type: ["GET"],
      params: {
        required: [
          {
            value: "@process_id",
            format: "???",
            sample: `???`,
          },
        ],
      },
      desc: (
        <div>
          Responsible for streaming process parameters running/off, also able to
          reboot and reset the line data.
          <a href="/hardware/#devices" style={style_section_link}>
            Machine &gt; Printer
          </a>
          .
        </div>
      ),
      status: "live",
      source: "",
      tags: ["machine", "hardware", "packaging", "printer", "route"],
      request: (
        <a
          href={`enter_href_here`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/machine/aux/printer?pid=???
        </a>
      ),
      response: <div>Sample response goes here.</div>,
    },
    {
      route: "/api/alert",
      type: ["GET", "PUT"],
      params: {
        required: [
          {
            value: "@process_id",
            format: "???",
            sample: `???`,
          },
        ],
      },
      desc: (
        <div>
          Responsible for streaming process parameters running/off, also able to
          reboot and reset the line data.
          <a href="/hardware/#devices" style={style_section_link}>
            Machine &gt; Printer
          </a>
          .
        </div>
      ),
      status: "live",
      source: "",
      tags: ["machine", "hardware", "packaging", "printer", "route"],
      request: (
        <a
          href={`enter_href_here`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/machine/aux/printer?pid=???
        </a>
      ),
      response: <div>Sample response goes here.</div>,
    },
    {
      route: "/api/alert/active",
      type: ["GET", "PUT"],
      params: {
        required: [
          {
            value: "@process_id",
            format: "???",
            sample: `???`,
          },
        ],
      },
      desc: (
        <div>
          Responsible for streaming process parameters running/off, also able to
          reboot and reset the line data.
          <a href="/hardware/#devices" style={style_section_link}>
            Machine &gt; Printer
          </a>
          .
        </div>
      ),
      status: "live",
      source: "",
      tags: ["machine", "hardware", "packaging", "printer", "route"],
      request: (
        <a
          href={`enter_href_here`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_hostname_port}/api/machine/aux/printer?pid=???
        </a>
      ),
      response: <div>Sample response goes here.</div>,
    },
  ];

  const [expandPreview, setExpandPreview] = useState(
    Array(routeDetails.length).fill(false)
  );

  const handleClick = (i) => {
    const updatedExpandPreview = [...expandPreview];
    updatedExpandPreview[i] = !updatedExpandPreview[i];
    setExpandPreview(updatedExpandPreview);
  };

  return (
    <div
      className="documentation-root"
      style={{
        backgroundColor: `${backgroundColor_set[props.mode]}`,
        color: `${color_set[props.mode]}`,
        ...style_documentation_root,
        ...style_content,
      }}
    >
      {/* <button
        style={{ float: "right", ...style_button_mode }}
        onClick={() =>
          setSelectedBackgroundIndex(
            props.mode < backgroundColor_set.length
              ? props.mode + 1
              : 0
          )
        }
      >
        toggle
      </button> */}
      <div className="" style={{ width: "70%" }}>
        <div className="" style={{ fontSize: "1.25rem" }}>
          <pre className="" style={{ textWrap: "wrap" }}>
            The following routes are used to track production metrics. To use
            append the endpoint to hostname:port and supply the necessary
            arguments to pull the desired data. None of the routes are rate
            limited, but be conscious as each request might fetch live data.
          </pre>
          <pre className="" style={{ textWrap: "wrap" }}>
            The routes marked with * are routes that are not used on any pages
            but are available to pull desired data. Select one the filters below
            to display routes with those properties.

          </pre>
          <div style={style_modify_response.label} onClick={() => setHowTo(howTo ? false : true)}>more</div>
          {howTo && <pre
              className=""
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: "1.75",
                margin: "1.5rem",
                fontSize: "1.125rem",
              }}
            >
              1. <b>Base URL</b>: Start with the base hostname and port (e.g.,{" "}
              <code>{sample_hostname_port}</code>).
              <br />
              2. <b>Append Endpoint</b>: Add the desired route's endpoint to the
              base URL.
              <br />
              Example: <code>{sample_hostname_port}/api/your-endpoint</code>
              <br />
              3. <b>Supply Parameters</b>: Pass the required arguments as query
              parameters in the URL to pull the desired data.
              <br />
            </pre>}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "2rem",
          marginTop: "2rem",
          fontSize: "1.25rem",
        }}
      >
        {[
          "extrusion",
          "fiber",
          "compounding",
          "schedule",
          "production",
          "stream",
        ].map((tag, index) => (
          <div
            key={index}
            onClick={() => handleFilterClick(tag)}
            style={{
              ...style_button_mode,
              fontWeight: 200,
              letterSpacing: "1px",
              backgroundColor:
                activeTag === tag
                  ? "#b8b8b8ff"
                  : props.mode
                  ? "#f4f4f4"
                  : "#111111",
              color: props.mode
                ? "#333333"
                : activeTag === tag
                ? "#000000"
                : "#ffffff72",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            {tag}
          </div>
        ))}
      </div>
      {/* <pre>{JSON.stringify(routeDetails, null, 2)}</pre> */}
      {routeDetails
        .filter((route) => route.tags.includes(activeTag))
        .map((route, i) => (
          <div
            style={{
              ...style_route,
              marginBottom: expandPreview[i] ? "8rem" : "1rem",
            }}
            key={i}
          >
            <div style={style_route.endpoint}>
              <div style={style_route.route}>
                <div className=""></div>
                {route.route}
              </div>
              {route.type.map((type, j) => (
                <div
                  key={j}
                  style={{ ...style_route.label, ...style_route.label[type] }}
                >
                  {type}
                </div>
              ))}
              {/* <div style={route.status === "live" ? style_route.status.ON : style_route.status.OFF}>o</div> */}
            </div>
            <div style={style_route.description}>{route.desc}</div>
            {/* <div style={style_route.source}>{route.source}</div> */}
            <div
              className=""
              style={{ marginBottom: "0.5rem", ...style_modify_response.label }}
              onClick={() => handleClick(i)}
            >
              {expandPreview && expandPreview[i] ? "hide" : "preview"}
            </div>
            {expandPreview[i] && route.params && (
              <table style={style_table.container}>
                <thead>
                  <tr style={style_table.header}>
                    <th style={style_table.cell}>param</th>
                    <th style={style_table.cell}>type</th>
                    <th style={style_table.cell}>format</th>
                    <th style={style_table.cell}>sample</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(route.params).map(([key, value]) => (
                    <React.Fragment key={key}>
                      {value.map((item, index) => (
                        <tr
                          key={index}
                          style={style_table.row}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              props.mode
                                ? "#f1f1f1"
                                : "rgba(17, 17, 17, 0.682)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <td style={style_table.cell}>{item.value}</td>
                          <td style={style_table.cell}>{key}</td>
                          <td style={style_table.cell}>{item.format}</td>
                          <td style={style_table.cell}>{item.sample}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
            <div style={style_route.preview}>
              {expandPreview[i] && route.request && route.response && (
                <>
                  <div style={{ flexBasis: "25%" }}>
                    {!loading ? (
                      <div style={style_route.preview.request}>
                        {route.request}
                      </div>
                    ) : (
                      <div
                        style={{
                          ...style_route.preview.request,
                          animation: "pulse 1.5s infinite ease-in-out",
                        }}
                      >
                        {route.request}
                      </div>
                    )}
                    <div style={style_modify_response}>
                      <div
                        style={style_modify_response.label}
                        onClick={() => {
                          setLoading(true);
                          handleHit("http://localhost:5000/test");
                        }}
                      >
                        hit
                      </div>
                      <div
                        style={style_modify_response.label}
                        onClick={() => handleCopy(route.request)}
                      >
                        copy
                      </div>
                      <div style={style_modify_response.label}>edit</div>
                    </div>
                  </div>
                  <div style={{ flexBasis: "75%" }}>
                    {!loading ? (
                      <div style={style_route.preview.response}>
                        {route.response}
                      </div>
                    ) : (
                      <div style={style_route.preview.response}>
                        <div
                          style={{
                            animation: "pulse 1.5s infinite ease-in-out",
                            fontSize: "1.5rem",
                          }}
                        >
                          loading...
                        </div>
                      </div>
                    )}
                    <div style={style_modify_response}>
                      <div
                        style={style_modify_response.label}
                        onClick={() => handleCopy(route.request)}
                      >
                        copy
                      </div>
                      <div
                        style={style_modify_response.label}
                        onClick={() => handlePrettify(route.request)}
                      >
                        pretty
                      </div>
                      <div
                        style={style_modify_response.label}
                        onClick={() => handleSave(route.response, route.route)}
                      >
                        save
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
export default Documentation;

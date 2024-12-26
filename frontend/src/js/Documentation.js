import React, { useEffect, useState } from "react";
import moment from "moment";

const sample_host_location = "http://localhost:5000"
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

function Documentation() {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedBackgroundIndex, setSelectedBackgroundIndex] = useState(0);

  const style_content = {
    paddingLeft: "3rem",
    paddingRight: "3rem",
    wordBreak: "break-all",
    whiteSpace: "normal",
  };

  const style_documentation_root = {
    font: "1rem",
    padding: "2rem",
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
      textDecorationColor: selectedBackgroundIndex ? "#dddddd" : "#171717",
      color: selectedBackgroundIndex ? "#333333" : "#ffffff72",
    },
  };

  const style_request_link = {
    // backgroundColor: "#ffffff29",
    // padding: "0.1rem 0.25rem",
    textDecoration: "none",
    fontSize: "1.5rem",
    // lineHeight: "3rem",
    color: selectedBackgroundIndex
      ? isHovered
        ? "#17171772"
        : "#171717"
      : isHovered
      ? "#ffffff"
      : "#ffffff72",
  };

  const style_section_link = {
    padding: "0.15rem 0.25rem",
    textDecoration: "none",
    borderRadius: "0.25rem",
    fontSize: "1rem",
    backgroundColor: selectedBackgroundIndex ? "#f4f4f4" : "#111111",
    color: selectedBackgroundIndex ? "#333333" : "#ffffff72",
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
      backgroundColor: selectedBackgroundIndex ? "#f4f4f4" : "#111111ae",
      textAlign: "left",
      borderRadius: "5rem",
    },
    cell: {
      border: `1px solid ${selectedBackgroundIndex ? "#dddddd" : "#171717"}`,
      padding: "0.75rem",
      color: selectedBackgroundIndex ? "#333333" : "#696969",
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
      letterSpacing: "0.5rem",
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
      gap: "0.75rem",
      // textDecoration: "underline",
      maxHeight: "20rem",
      request: {
        marginBottom: "0.25rem",
        height: "100%",
        borderRadius: "0.25rem",
        // overflow: "wrap",
        wrapType: "break-word",
        padding: "1rem",
        textDecoration: "none",
        border: `1px solid ${selectedBackgroundIndex ? "#dddddd" : "#171717"}`,
      },
      response: {
        marginBottom: "0.25rem",
        height: "100%",
        borderRadius: "0.25rem",
        backgroundColor: selectedBackgroundIndex
          ? "rgb(244, 244, 244)"
          : "#111111ae",
        overflow: "scroll",
        padding: "1rem",
        textDecoration: "none",
        color: selectedBackgroundIndex ? "#111111" : "#bdbdbd",
        border: `1px solid ${
          selectedBackgroundIndex ? "#dddddd" : "#2929298a"
        }`,
      },
    },
  };
  const routeDetails = [
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
            format: "<EX**>",
            sample: sample_formatted_line_id,
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
          section*.
        </div>
      ),
      status: "live",
      source: "mf-ignition.extrusion_runs",
      tags: ["extrusion"],
      request: (
        <a
          href={`http://localhost:5000/api/extruder?line_id=$EX03&start_date=${sample_formatted_start_date}&end_date=${sample_formatted_end_date}`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_host_location}/api/extruder?line_id=$EX03&start_date={sample_formatted_start_date}
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
            format: "<EX**>",
            sample: sample_formatted_line_id,
          },
        ],
      },
      desc: (
        <div>
          Endpoint for streaming current extrusion data. Defaults to 3 most
          recently produced spools, provided data includes spool_id, runtime &
          length. Used in Extrusion page under
          <a href="/extrusion/#produced" style={style_section_link}>
            Extrusion &gt; live
          </a>{" "}
          section*.
        </div>
      ),
      status: "live",
      source: "mf-ignition.extrusion_runs",
      tags: ["extrusion", "live"],
      request: (
        <a
          href={`http://localhost:5000/api/extruder/live?line_id=$EX03&spool_count=3`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_host_location}/api/extruder/live?line_id=$EX03&start_date=
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
            Enter
          </a>
          tab. Renders labels for months with existing ignition schedules data in
          the select month form card (under
          <a href="/schedule/#existing_months" style={style_section_link}>
            Schedule &gt; Existing Months
          </a>
          section).
        </div>
      ),
      status: "live",
      source: "mf-ignition.production_schedule",
      tags: ["schedule"],
      request: (
        <a
          href={`http://localhost:5000/api/schedule/existing`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_host_location}/api/schedule/existing
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
      route: "/api/redo",
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
      tags: ["schedule"],
      request: (
        <a
          href={`http://localhost:5000/api/redo`}
          style={style_request_link}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sample_host_location}/api/redo
        </a>
      ),

      response: <><div>Data submitted sucessfully.</div><div>30 rows modified.</div></>,
    },
    {
        route: "/api/goals/redo",
        type: ["POST", "PUT"],
        desc: (
          <div>
            Endpoint for overwriting and deleting monthly goals in the database.
            This endpoint handles the entering and modifying
            production goals entries in
            <a href="/schedule/#goals" style={style_section_link}>
              Schedule &gt; Goals
            </a>
            for a specific month. Hotwrites to database on input.
          </div>
        ),
        status: "live",
        source: "mf-ignition.production_schedule",
        tags: ["schedule"],
        request: (
          <a
            href={`http://localhost:5000/api/goals/redo`}
            style={style_request_link}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {sample_host_location}/api/goals/redo
          </a>
        ),
  
        response: <><div>Data submitted sucessfully.</div><div>30 rows modified.</div></>,
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
        backgroundColor: `${backgroundColor_set[selectedBackgroundIndex]}`,
        color: `${color_set[selectedBackgroundIndex]}`,
        ...style_documentation_root,
        ...style_content,
      }}
    >
      <button
        style={{ float: "right" }}
        onClick={() =>
          setSelectedBackgroundIndex(
            selectedBackgroundIndex < backgroundColor_set.length
              ? selectedBackgroundIndex + 1
              : 0
          )
        }
      >
        toggle
      </button>
      {/* <pre>{JSON.stringify(routeDetails, null, 2)}</pre> */}
      {routeDetails.map((route, i) => (
        <div
          style={{
            ...style_route,
            marginBottom: expandPreview[i] ? "6rem" : "1rem",
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
                            selectedBackgroundIndex
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
                  <div style={style_route.preview.request}>{route.request}</div>
                  <div style={style_modify_response}>
                    {/* <div style={style_modify_response.label}>hit</div>
                    <div style={style_modify_response.label}>copy</div>
                    <div style={style_modify_response.label}>edit</div> */}
                  </div>
                </div>
                <div style={{ flexBasis: "75%" }}>
                  <div style={style_route.preview.response}>
                    {route.response}
                  </div>
                  <div style={style_modify_response}>
                    {/* <div style={style_modify_response.label}>copy</div>
                    <div style={style_modify_response.label}>pretty</div>
                    <div style={style_modify_response.label}>save</div> */}
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

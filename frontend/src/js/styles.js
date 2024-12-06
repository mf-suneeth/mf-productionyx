// styles.js

////// class Extrusion 
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
    // width: "100%", // Full width of grid cell
    // marginTop: "8.6rem",
    display: "flex",
    flexDirection: "row",
    gap: "1rem",
    flexGrow: 1,
    paddingTop: "22vh",
    // border: "1px solid orange",

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

// error styles
const style_error_box = {
    fontSize: "1.5rem",
    color: "#FFEB3B",
    fontWeight: "bold"

}
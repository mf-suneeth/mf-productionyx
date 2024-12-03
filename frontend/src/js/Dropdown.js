import React, { useState } from "react";

const Dropdown = ({ options, label, defaultValue, onChange }) => {
    const handleSelection = (event) => {
        const selectedValue = event.target.value;
        onChange(selectedValue); // Pass the selected value to the parent component
    };

    return (
        <div style={{ margin: "0", position: "relative", display: "inline-block" }}>
            {label && <label style={{ marginRight: "0.5rem" }}>{label}</label>}
            <div style={{ position: "relative", display: "flex", alignItems: "center", width: "fit-content" }}>
                <select
                    onChange={handleSelection}
                    defaultValue={defaultValue || ""}
                    style={{
                        // padding: "0.5rem 2rem 0.5rem 0.5rem", // Adjust padding to make space for the arrow
                        backgroundColor: "black",
                        color: "white",
                        border: "1px solid white",
                        fontSize: "1rem",
                        fontWeight: "600",
                        appearance: "none", // Hide the native arrow
                        WebkitAppearance: "none", // For Safari
                        MozAppearance: "none", // For Firefox
                        textAlign: "left", // Align text to the left
                        width: "fit-content",
                        fontSize: "3.25vw",
                        border: "none"
                    }}
                >
                    <option value="" disabled>
                        Select an option
                    </option>
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {/* Custom Arrow */}
                <div
                    style={{
                        position: "absolute",
                        right: "0.5rem", // Inside the box
                        pointerEvents: "none", // Ensure it doesn't interfere with interaction
                        fontSize: "1rem", // Adjust arrow size
                        color: "white",
                    }}
                >
                    ▼
                </div>
            </div>
        </div>
    );
};

export default Dropdown;

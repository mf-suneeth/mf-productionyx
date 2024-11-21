import React, { useEffect, useState } from "react";

const routeDetails = [
    {
        "route" : "/api/current",
        "parameters" : "",
        "details" : "Provides info on",
        "dependencies" : "mf-ignition.production_schedules"
    },
    {
        "route" : "/api/current/extrusion",
        "parameters" : "",
        "details" : "Provides info on",
        "dependencies" : "mf-ignition.extrusion_runs"
    },
    {
        "route" : "/api/current/fiber",
        "parameters" : "",
        "details" : "Provides info on",
        "dependencies" : "mf-ignition.production_spools"
    },
    {
        "route" : "/api/current/compounding",
        "parameters" : "",
        "details" : "Provides info on",
        "dependencies" : ["mf-ignition.compounding_lots", "mf-ignition.compounding_recipies", "mf-ignition.compounding_lots"]
    },
    {
        "route" : "/api/current/ovens",
        "parameters" : "",
        "details" : "Provides info on",
        "dependencies" : ["mf-ignition.ovens", "mf-ignition.ovens_unloading"]
    },
]







function Documentation() {
    return (
        <div className="documentation-root" style={{backgroundColor: "black",  color: "white", fontSize: "1rem", height: "100vh", border: "1px solid black", padding: "2rem"}}>
            <pre>{JSON.stringify(routeDetails, null, 2)}</pre>
        </div>

    )






} export default Documentation;
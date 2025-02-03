import React, { useEffect, useState } from "react";
import moment from "moment";

import "../css/App.css";
import { page_root } from "./styles";

const material_weight = {
    "ONX": {
        "low": 916,
        "high": 1016,
        "target": "---",
        "lot" : "", 
    },
    "VGA": {
        "low": 4035,
        "high": 4420,
        "target": "---",
        "lot" : "",
    },
    "OFR": {
        "low": 1001,
        "high": 1042,
        "target": 1021
    },
    "ES2": {
        "low": 968,
        "high": 1007,
        "target": 987
    },
    "17F": {
        "low": 1011,
        "high": 1052,
        "target": 1031
    },
    "H13": {
        "low": 1017,
        "high": 1058,
        "target": 1037
    },
    "A20": {
        "low": 1035,
        "high": 1077,
        "target": 1056
    },
    "D20": {
        "low": 1023,
        "high": 1064,
        "target": 1043
    },
    "625": {
        "low": 1103,
        "high": 1148,
        "target": 1125
    },
    "AO1": {
        "low": 321,
        "high": 334,
        "target": 327
    }
};


const avg_mass_per_recd = {
    "HTS": 1000,
    "PFR": 1000,
    "RDM": 1000,
    "RDP": 1000,
    "VGA": 1000,
    "T64": 1000,
    "OFR": 1000,
    "ES2": 1000,
    "17F": 1000,
    "H13": 1000,
    "A20": 1000,
    "D20": 1000,
    "625": 1000,
    "AO1": 1000
};

export function Incoming() {

  const [incomingLotsData, setIncomingLotsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [startDate, setStartDate] = useState("2023-10-01");
  const [endDate, setEndDate] = useState("2023-10-31");     

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
    setStream(null);
    fetchData(
      `http://localhost:5000/api/current?start_date=${startDate}&end_date=${endDate}`,
      (data) => setIncomingLotsData(data)
    );
  }, [startDate, endDate]);


    return (
        <div style={page_root}>
            <div className="">Lots Recv: --</div>
            <div className="">{Object.keys(material_weight).map((material_id, idx) => (
                <pre className="">{material_id} : {JSON.stringify(material_weight[material_id], 4, null)}</pre>
            ))}</div>
        </div>
    )
}
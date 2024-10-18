import React, { useEffect, useState } from 'react';

function FetchMonth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/cal');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result.Schedule); // Assume Schedule is the relevant part of the response
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Helper to get a calendar grid
  const renderCalendar = () => {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const encodeSet = Object.keys(data)

    const calendar = Array.from({ length: daysInMonth }, (_, i) => {
      const dateKey = `${i + 1} ${new Date().toLocaleString('default', { month: 'long' })}`;
      const encodeKey = encodeSet[i]
      return (
        <div key={dateKey} className="calendar-day">
          {/* <div>{data["1 Tuesday"]["EX00"]["CFA"]}</div> */}
          <h4>{dateKey}</h4>
          <div>{encodeKey}</div>
          {data[encodeKey] ? (
            <ul>
              {Object.entries(data[encodeKey]).map(([process, details]) => (
                <div key={process}>
                  <strong>{process}</strong>: 
                  {typeof details === 'object' ? (
                    <span>{JSON.stringify(details)}</span> // Or render specific properties
                  ) : (
                    details
                  )}
                </div>
              ))}
            </ul>
          ) : (
            <p>No events</p>
          )}
        </div>
      );
    });

    return <div className="calendar-grid">{calendar}</div>;
  };

  return (
    <div className="data-fetcher">
      <h2>Calendar View</h2>
      {renderCalendar()}
    </div>
  );
}

export default FetchMonth;

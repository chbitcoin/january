import React, { useState, useEffect } from "react";

export const Time = () => {
  // Initialize with current time in seconds since epoch
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Empty dependency array ensures effect runs once

  // Convert seconds to a Date object for formatting
  const date = new Date(currentTime * 1000);

  return (
    <div>
      <p>{date.toLocaleTimeString()}</p>
    </div>
  );
};

export default Time;

import React, { useEffect, useState } from 'react';
import { FaRegClock } from 'react-icons/fa';

export default function CountdownTimer({ initialMinutes = 5, initialSeconds = 0 }) {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    let myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(myInterval);
        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }
    }, 1000);
    return () => {
      clearInterval(myInterval);
    };
  }, [minutes, seconds]);

  return (
    <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 18 }}>
      <FaRegClock style={{ marginRight: 8, fontSize: 18 }} />
      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </span>
  );
} 
import React, { useState, useEffect } from 'react';

interface TimerProps {
    initialTime: number;  // initial time in seconds
    stop: boolean;        // prop to stop the timer
}

export const Timer: React.FC<TimerProps> = ({ initialTime, stop }) => {
    const [time, setTime] = useState(initialTime);

    useEffect(() => {
        if (stop) return;  // do not start or continue the timer if stop is true

        const timerId = setInterval(() => {
            setTime((prevTime) => {
                if (prevTime > 0) {
                    return prevTime - 1;
                } else {
                    clearInterval(timerId);
                    return 0;
                }
            });
        }, 1000);

        // Cleanup interval on component unmount or when stop changes
        return () => clearInterval(timerId);
    }, [stop]);

    // Helper function to format time in mm:ss
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    return (
        <div>
            <span>{formatTime(time)}</span>
        </div>
    );
};
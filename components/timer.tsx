import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Button } from 'react-native';
import * as Progress from 'react-native-progress';

interface TimerProgressBarProps {
  onTimerComplete: () => Promise<void>; 
  color: string;
  time: number; // number of seconds for the timer to wait on
  active: boolean; // when the parent passes this prop as true, timer starts
}

const TimerProgressBar: React.FC<TimerProgressBarProps> = ({ onTimerComplete, color, time, active }) => {
  const [progress, setProgress] = useState<number>(0);  // Progress value (0 to 1)
  const startTimeRef = useRef<number | null>(null);  // Reference to store the start time

  useEffect(() => {
    if (active) {
      startTimer();
    } else {
      resetTimer();
    }
  }, [active]);

  const startTimer = () => {
    startTimeRef.current = Date.now();  // Store the start time
    requestAnimationFrame(updateProgress);  // Start the animation
  };

  const updateProgress = () => {
    if (startTimeRef.current !== null) {
      const elapsedTime = (Date.now() - startTimeRef.current) / 1000;  // Calculate elapsed time in seconds
      const newProgress = elapsedTime / time;  // Convert to progress value (0 to 1)
      setProgress(newProgress);
      if (newProgress < 1) {  // If progress is not complete
        requestAnimationFrame(updateProgress);  // Request the next frame
      } else {
        console.log('timer complete');
        resetTimer();
        onTimerComplete();  // Call the completion handler
      }
    }
  };


  const resetTimer = () => {
    setProgress(0);  // Reset progress
    startTimeRef.current = null;  // Reset start time
  };

  return (
    <>
      {active && <Progress.Bar progress={progress} width={300} color={color}/>}
    </>
  );
};

export default TimerProgressBar;

import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const MESSAGES = [
  'INITIALIZING VEHICLE SYSTEMS',
  'Loading chassis structure...',
  'Loading body panels...',
  'Loading powertrain...',
  'Loading cockpit interior...',
  'Loading wheel assemblies...',
  'Loading braking system...',
  'Loading thermal management...',
  'Preparing simulation...',
  'Systems ready.',
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => {
        if (prev >= MESSAGES.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return prev;
        }
        return prev + 1;
      });
      setProgress((prev) => Math.min(100, prev + 12));
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <div className="logo-text">NOVA X1</div>
          <div className="logo-subtitle">ELECTRIC PERFORMANCE PLATFORM</div>
        </div>
        <div className="loading-bar-container">
          <div className="loading-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="loading-message">{MESSAGES[msgIndex]}</div>
        <div className="loading-progress">{progress}%</div>
      </div>
    </div>
  );
}

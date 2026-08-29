import { useState, useCallback } from 'react';
import VehicleScene from './components/VehicleViewer/VehicleScene';
import ComponentInspector from './components/UI/ComponentInspector';
import VehicleControls from './components/UI/VehicleControls';
import LoadingScreen from './components/UI/LoadingScreen';
import './App.css';

export default function App() {
  const [loaded, setLoaded] = useState(false);

  const handleLoadComplete = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="app">
      {!loaded && <LoadingScreen onComplete={handleLoadComplete} />}

      <div className="viewport">
        <VehicleScene />
      </div>

      {loaded && (
        <>
          <div className="header">
            <div className="brand">
              <div className="brand-name">NOVA X1</div>
              <div className="brand-tagline">ELECTRIC PERFORMANCE PLATFORM</div>
            </div>
            <div className="header-right">
              <button className="header-btn" title="Fullscreen" onClick={() => {
                if (!document.fullscreenElement) document.documentElement.requestFullscreen();
                else document.exitFullscreen();
              }}>
                [FULLSCREEN]
              </button>
            </div>
          </div>

          <div className="left-panel">
            <VehicleControls />
          </div>

          <div className="right-panel">
            <ComponentInspector />
          </div>

          <div className="footer">
            <span className="footer-text">Orbit: Drag | Zoom: Scroll | Select: Click Component | Focus: Double-Click</span>
          </div>
        </>
      )}
    </div>
  );
}

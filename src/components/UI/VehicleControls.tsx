import { useVehicleStore } from '../../store';
import { CAMERA_PRESETS } from '../../utils/cameraPresets';

export default function VehicleControls() {
  const {
    exploded, toggleExploded,
    xrayMode, toggleXray,
    doorsOpen, toggleDoors,
    hoodOpen, toggleHood,
    trunkOpen, toggleTrunk,
    lightsEnabled, toggleLights,
    inspectMode, toggleInspectMode,
    roofTint, cycleRoofTint,
    activeCameraPreset, setCameraPreset,
    reset,
  } = useVehicleStore();

  return (
    <div className="controls-panel">
      <div className="controls-section">
        <div className="section-label">VIEW</div>
        <button className={`ctrl-btn ${exploded ? 'active' : ''}`} onClick={toggleExploded}>
          {exploded ? 'ASSEMBLE' : 'EXPLODE'}
        </button>
        <button className={`ctrl-btn ${xrayMode ? 'active' : ''}`} onClick={toggleXray}>
          X-RAY
        </button>
        <button className={`ctrl-btn ${inspectMode ? 'active' : ''}`} onClick={toggleInspectMode}>
          INSPECT
        </button>
      </div>

      <div className="controls-section">
        <div className="section-label">SYSTEMS</div>
        <button className={`ctrl-btn ${doorsOpen ? 'active' : ''}`} onClick={toggleDoors}>
          DOORS {doorsOpen ? 'OPEN' : 'CLOSED'}
        </button>
        <button className={`ctrl-btn ${hoodOpen ? 'active' : ''}`} onClick={toggleHood}>
          HOOD {hoodOpen ? 'OPEN' : 'CLOSED'}
        </button>
        <button className={`ctrl-btn ${trunkOpen ? 'active' : ''}`} onClick={toggleTrunk}>
          TRUNK {trunkOpen ? 'OPEN' : 'CLOSED'}
        </button>
        <button className={`ctrl-btn ${lightsEnabled ? 'active' : ''}`} onClick={toggleLights}>
          LIGHTS {lightsEnabled ? 'ON' : 'OFF'}
        </button>
        <button className="ctrl-btn" onClick={cycleRoofTint}>
          ROOF: {roofTint.toUpperCase()}
        </button>
      </div>

      <div className="controls-section">
        <div className="section-label">CAMERA</div>
        <div className="camera-grid">
          {Object.entries(CAMERA_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              className={`cam-btn ${activeCameraPreset === key ? 'active' : ''}`}
              onClick={() => setCameraPreset(key)}
            >
              {preset.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="controls-section">
        <button className="ctrl-btn reset-btn" onClick={reset}>
          RESET VEHICLE
        </button>
      </div>
    </div>
  );
}

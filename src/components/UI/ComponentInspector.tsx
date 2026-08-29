import React from 'react';
import { useVehicleStore } from '../../store';
import { VEHICLE_COMPONENTS, type VehicleSystem } from '../../vehicle/vehicleTypes';

const SYSTEM_COLORS: Record<VehicleSystem, string> = {
  structural: '#888899',
  body: '#4488cc',
  lighting: '#ffaa33',
  interior: '#aa7744',
  wheels: '#666677',
  brakes: '#cc4444',
  suspension: '#55aa55',
  powertrain: '#ff6644',
  thermal: '#44cccc',
  glass: '#88ccff',
};

const SYSTEM_ICONS: Record<VehicleSystem, string> = {
  structural: '[ CHASSIS ]',
  body: '[ BODY ]',
  lighting: '[ LIGHTS ]',
  interior: '[ COCKPIT ]',
  wheels: '[ WHEELS ]',
  brakes: '[ BRAKES ]',
  suspension: '[ SUSP. ]',
  powertrain: '[ DRIVE ]',
  thermal: '[ THERMAL ]',
  glass: '[ GLASS ]',
};

export default function ComponentInspector() {
  const { selectedComponent, activeSystemFilter, setSystemFilter } = useVehicleStore();

  const component = selectedComponent
    ? VEHICLE_COMPONENTS.find((c) => c.id === selectedComponent || c.category === selectedComponent)
    : null;

  const systemFilterOptions: Array<{ key: VehicleSystem | 'all'; label: string }> = [
    { key: 'all', label: 'ALL' },
    { key: 'structural', label: 'CHASSIS' },
    { key: 'body', label: 'BODY' },
    { key: 'interior', label: 'INTERIOR' },
    { key: 'powertrain', label: 'POWERTRAIN' },
    { key: 'wheels', label: 'WHEELS' },
    { key: 'brakes', label: 'BRAKES' },
    { key: 'suspension', label: 'SUSPENSION' },
    { key: 'lighting', label: 'LIGHTING' },
    { key: 'glass', label: 'GLASS' },
    { key: 'thermal', label: 'THERMAL' },
  ];

  return (
    <div className="inspector-panel">
      <div className="inspector-header">
        <div className="inspector-title">COMPONENT INSPECTOR</div>
        <div className="inspector-subtitle">NOVA X1 ELECTRIC PLATFORM</div>
      </div>

      <div className="system-filters">
        {systemFilterOptions.map((opt) => (
          <button
            key={opt.key}
            className={`filter-btn ${activeSystemFilter === opt.key ? 'active' : ''}`}
            onClick={() => setSystemFilter(opt.key)}
            style={opt.key !== 'all' ? { borderColor: SYSTEM_COLORS[opt.key as VehicleSystem] } : {}}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {component ? (
        <div className="component-info">
          <div className="component-badge" style={{ backgroundColor: SYSTEM_COLORS[component.category] + '33', color: SYSTEM_COLORS[component.category] }}>
            {SYSTEM_ICONS[component.category]}
          </div>
          <div className="component-name">{component.displayName}</div>
          <div className="component-divider" style={{ backgroundColor: SYSTEM_COLORS[component.category] }} />
          <div className="info-row">
            <span className="info-label">SYSTEM</span>
            <span className="info-value">{component.category.toUpperCase()}</span>
          </div>
          <div className="info-row">
            <span className="info-label">MATERIAL</span>
            <span className="info-value">{component.materialType.replace(/_/g, ' ').toUpperCase()}</span>
          </div>
          <div className="info-row">
            <span className="info-label">ROLE</span>
            <span className="info-value">{component.technicalRole}</span>
          </div>
          <div className="info-row">
            <span className="info-label">STATUS</span>
            <span className="info-value status-active">OPERATIONAL</span>
          </div>
          <div className="component-description">
            {component.description}
          </div>
        </div>
      ) : (
        <div className="no-selection">
          <div className="no-selection-icon">[ + ]</div>
          <div className="no-selection-text">Select a vehicle component to inspect</div>
          <div className="no-selection-hint">Click any part of the vehicle model</div>
        </div>
      )}
    </div>
  );
}

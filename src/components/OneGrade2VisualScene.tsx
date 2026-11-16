import React, { useState } from 'react';
import { Sparkles, Info, CheckCircle2 } from 'lucide-react';

export interface VisualElement {
  id: string;
  label: string;
  color?: string;
}

export interface VisualScene {
  kind: string;
  elements?: VisualElement[];
}

interface Props {
  scene: VisualScene;
  title: string;
}

export const OneGrade2VisualScene: React.FC<Props> = ({ scene, title }) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    scene.elements?.[0]?.id || null
  );

  if (!scene || !scene.kind || !Array.isArray(scene.elements)) {
    return null;
  }

  const elements = scene.elements;
  const activeElement = elements.find((e) => e.id === selectedId) || elements[0];

  return (
    <div
      style={{
        background: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.05em'
            }}
          >
            <Sparkles size={13} /> INTERACTIVE CONCEPT SCENE
          </span>
          <strong style={{ color: '#1e293b', fontSize: '15px' }}>{title}</strong>
        </div>
        <small style={{ color: '#64748b', fontSize: '12px' }}>Tap any item to observe closely</small>
      </div>

      {/* SVG Interactive Canvas */}
      <div
        style={{
          background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
          borderRadius: '12px',
          border: '1px solid #bfdbfe',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '220px',
          position: 'relative'
        }}
      >
        <svg viewBox="0 0 500 200" style={{ width: '100%', maxWidth: '500px', height: 'auto' }}>
          <defs>
            <linearGradient id="g2bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background ground & sky */}
          <rect x="0" y="0" width="500" height="200" rx="8" fill="url(#g2bg)" />
          <line x1="20" y1="160" x2="480" y2="160" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6,6" />

          {/* Render Elements dynamically */}
          {elements.map((el, i) => {
            const isSelected = el.id === selectedId;
            const x = 70 + i * (360 / Math.max(elements.length - 1, 1));
            const y = 95;

            return (
              <g
                key={el.id}
                onClick={() => setSelectedId(el.id)}
                style={{ cursor: 'pointer' }}
                filter={isSelected ? 'url(#glow)' : undefined}
              >
                {/* Outer ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 34 : 26}
                  fill={el.color || '#3b82f6'}
                  fillOpacity={isSelected ? 0.95 : 0.75}
                  stroke={isSelected ? '#1e3a8a' : '#ffffff'}
                  strokeWidth={isSelected ? 3 : 2}
                  style={{ transition: 'all 0.2s ease-in-out' }}
                />
                {/* Inner symbol or index */}
                <text
                  x={x}
                  y={y + 6}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={isSelected ? '16' : '14'}
                  fontWeight="bold"
                >
                  {i + 1}
                </text>
                {/* Element label below */}
                <text
                  x={x}
                  y={y + 45}
                  textAnchor="middle"
                  fill={isSelected ? '#0f172a' : '#475569'}
                  fontSize={isSelected ? '12' : '11'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {el.label.length > 18 ? el.label.slice(0, 16) + '…' : el.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Observation Pill & Focus Info */}
      {activeElement && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <Info size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: 1.6 }}>
            <strong>Observing: {activeElement.label}</strong>
            <span style={{ color: '#64748b', marginLeft: '6px' }}>
              — Point out this real-world feature together with an adult.
            </span>
          </div>
        </div>
      )}

      {/* Element Selector Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {elements.map((el, i) => (
          <button
            key={el.id}
            type="button"
            onClick={() => setSelectedId(el.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: el.id === selectedId ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: el.id === selectedId ? '#eff6ff' : '#ffffff',
              color: el.id === selectedId ? '#1d4ed8' : '#475569',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {el.id === selectedId && <CheckCircle2 size={13} style={{ color: '#2563eb' }} />}
            {i + 1}. {el.label}
          </button>
        ))}
      </div>
    </div>
  );
};

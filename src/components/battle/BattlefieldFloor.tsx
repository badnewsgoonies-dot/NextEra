/*
 * BattlefieldFloor: Subtle perspective floor effect for Golden Sun battles
 * 
 * Adds depth and dimension to the battlefield without being distracting
 */

import React from 'react';

export function BattlefieldFloor(): React.ReactElement {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
      {/* Perspective grid lines */}
      <svg 
        className="absolute bottom-0 left-0 w-full h-2/3 opacity-20" 
        viewBox="0 0 1000 500"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="gridFade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Horizontal perspective lines */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const y = 100 + i * 80;
          const width = 300 + i * 140;
          const x = (1000 - width) / 2;
          return (
            <line
              key={`h-${i}`}
              x1={x}
              y1={y}
              x2={x + width}
              y2={y}
              stroke="url(#gridFade)"
              strokeWidth="1"
              opacity={0.3 - i * 0.05}
            />
          );
        })}
        
        {/* Vertical perspective lines */}
        {[-2, -1, 0, 1, 2].map((i) => {
          const topX = 500 + i * 80;
          const bottomX = 500 + i * 200;
          return (
            <line
              key={`v-${i}`}
              x1={topX}
              y1={100}
              x2={bottomX}
              y2={500}
              stroke="url(#gridFade)"
              strokeWidth="1"
              opacity={0.2}
            />
          );
        })}
      </svg>
      
      {/* Subtle radial gradient for depth */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 70%, transparent 0%, rgba(0,0,0,0.3) 80%)',
        }}
      />
    </div>
  );
}

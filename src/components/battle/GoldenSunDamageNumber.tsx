/*
 * GoldenSunDamageNumber: Authentic GS damage popup
 * 
 * Features:
 * - Large, bold numbers
 * - Black outline + yellow glow (GS signature)
 * - Floats up and fades
 * - Pixel font style
 */

import React, { useEffect, useState } from 'react';

export interface GoldenSunDamageNumberProps {
  damage: number;
  position: { x: number; y: number };
  onComplete?: () => void;
}

export function GoldenSunDamageNumber({
  damage,
  position,
  onComplete,
}: GoldenSunDamageNumberProps): React.ReactElement {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return <></>;

  return (
    <div
      className="absolute pointer-events-none animate-damage-float z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="text-5xl font-black select-none"
        style={{
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textShadow: `
            3px 3px 0 #000,
            -3px -3px 0 #000,
            3px -3px 0 #000,
            -3px 3px 0 #000,
            0 0 10px #fbbf24,
            0 0 20px #f59e0b,
            0 0 30px #f97316
          `,
          WebkitTextStroke: '2px #000',
        }}
      >
        {damage}
      </div>
    </div>
  );
}


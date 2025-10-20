/*
 * DamageNumber: Animated damage popup
 * Floats upward and fades out
 */

import React, { useEffect, useState } from 'react';

export interface DamageNumberProps {
  damage: number;
  x: number; // Position X (%)
  y: number; // Position Y (%)
  onComplete?: () => void;
}

export function DamageNumber({ damage, x, y, onComplete }: DamageNumberProps): React.ReactElement {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Auto-remove after animation completes
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
        left: `${x}%`,
        top: `${y}%`,
      }}
    >
      <div className="text-4xl font-black text-red-600 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] stroke-white">
        -{damage}
      </div>
    </div>
  );
}


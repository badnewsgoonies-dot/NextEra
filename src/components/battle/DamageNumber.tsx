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
      className="absolute pointer-events-none animate-damage-float"
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
    >
      <div className="text-3xl font-bold text-red-500 drop-shadow-lg">
        -{damage}
      </div>
    </div>
  );
}


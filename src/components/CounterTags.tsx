/*
 * CounterTags: Displays tags this opponent counters
 * 
 * Feature-flagged component (Decision #4):
 * - Only renders if flags.counterTags is true
 * - Omits badge entirely if counterTags array is empty
 * - Shows compact pill badges for each tag
 * 
 * Usage:
 *   <CounterTags counterTags={['Holy', 'Beast']} enabled={flags.counterTags} />
 */

import React from 'react';
import type { Tag } from '../types/game.js';

export interface CounterTagsProps {
  counterTags: readonly Tag[];
  enabled?: boolean; // Feature flag
  className?: string;
}

const TAG_COLORS: Record<Tag, string> = {
  Undead: 'bg-tag-undead text-white',
  Mech: 'bg-tag-mech text-white',
  Beast: 'bg-tag-beast text-gray-900',
  Holy: 'bg-tag-holy text-gray-900',
  Arcane: 'bg-tag-arcane text-white',
  Nature: 'bg-tag-nature text-white',
};

export function CounterTags({ 
  counterTags, 
  enabled = true, 
  className = '' 
}: CounterTagsProps): React.ReactElement | null {
  // Hide if feature disabled (Decision #4: behind feature flag)
  if (!enabled) return null;

  // Hide if no counter tags (per spec: "omit badge entirely if empty")
  if (counterTags.length === 0) return null;

  return (
    <div 
      className={`flex flex-wrap items-center gap-2 ${className}`}
      aria-label={`Counters: ${counterTags.join(', ')}`}
    >
      <span className="text-xs text-gray-600 font-medium">Counters:</span>
      {counterTags.map((tag) => (
        <span
          key={tag}
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TAG_COLORS[tag]}`}
          aria-label={`${tag} tag`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}


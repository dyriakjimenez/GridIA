import React from 'react';

export function Spin({ color }: { color?: string }) {
  return (
    <svg className="spin" viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: 8, flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke={color || 'currentColor'} strokeWidth="3" fill="none" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color || 'currentColor'} strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

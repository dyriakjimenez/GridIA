import React from 'react';

export const Logo = () => (
  <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="glg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="var(--accent)" /><stop offset="0.6" stopColor="var(--violet)" /><stop offset="1" stopColor="var(--amber)" />
      </linearGradient>
    </defs>
    <rect x="0.5" y="0.5" width="39" height="39" rx="11" stroke="var(--line)" fill="var(--panel-2)" />
    <rect x="10" y="10" width="8" height="8" rx="2.4" fill="url(#glg)" />
    <rect x="22" y="10" width="8" height="8" rx="2.4" fill="url(#glg)" opacity="0.52" />
    <rect x="10" y="22" width="8" height="8" rx="2.4" fill="url(#glg)" opacity="0.52" />
    <rect x="22" y="22" width="8" height="8" rx="2.4" fill="url(#glg)" opacity="0.2" />
  </svg>
);

export const Sun = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="4.2" /><path d="M12 2.4v2.2M12 19.4v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.4 12h2.2M19.4 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
  </svg>
);

export const Moon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.5 14.2A8.6 8.6 0 019.8 3.5a8.6 8.6 0 1010.7 10.7z" />
  </svg>
);

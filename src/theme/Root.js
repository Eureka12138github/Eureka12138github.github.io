import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

function Root({ children }) {
  return (
    <>
      {children}
      <SpeedInsights />
	  <Analytics />
    </>
  );
}

export default Root;
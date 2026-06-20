/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CRTFilterProps {
  active: boolean;
}

export const CRTFilter: React.FC<CRTFilterProps> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[1000] overflow-hidden">
      {/* Moving scanner line scan */}
      <div className="absolute inset-0 w-full h-[3px] bg-white/10 opacity-35 pointer-events-none scanline-moving" />

      {/* Horizontal static scanline pattern */}
      <div 
        className="absolute inset-0 opacity-[0.22] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%), linear-gradient(90deg, rgba(255,0,0,0.04), rgba(0,255,0,0.01), rgba(0,0,255,0.04))',
          backgroundSize: '100% 4px, 6px 100%',
        }}
      />
      
      {/* Curved CRT-corner TV vignette styling */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.95), inset 0 0 180px rgba(0, 0, 0, 0.9)',
          background: 'radial-gradient(circle, transparent 65%, rgba(0, 0, 0, 0.5) 100%)',
        }}
      />
    </div>
  );
};

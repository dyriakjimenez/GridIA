import React, { useState, useEffect } from 'react';

export function LoadingBlock({ zona, prog }: { zona: string, prog: string | null }) {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="zloading">
      <div className="zl-title">Generando parrilla: {zona}</div>
      <div className="zl-sub">{prog || ('Analizando contexto, marca y restricciones' + dots)}</div>
      <div className="shimmer" />
    </div>
  );
}

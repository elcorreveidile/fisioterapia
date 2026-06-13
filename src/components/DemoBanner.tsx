'use client';

import { useEffect, useState } from 'react';

// Coletillas con guiño fisio + el clásico "por 2 duros" (barato).
// Se elige una al azar en cada visita; al hacer clic, sale la siguiente.
const QUIPS = [
  'sin agujetas en el presupuesto',
  'webs que no dan contracturas',
  'más barata que una sesión de magnetoterapia',
  'con buena postura y mejor relación calidad-precio',
  'te la hacemos sin que te duela (la cartera)',
  'código sin lumbalgia',
  'estiramos tu presupuesto, no tu paciencia',
  'cero recidivas, garantía de por vida... o casi',
];

export default function DemoBanner() {
  const [i, setI] = useState<number | null>(null);

  // En el cliente (tras montar) escogemos una al azar para no romper la hidratación.
  useEffect(() => {
    setI(Math.floor(Math.random() * QUIPS.length));
  }, []);

  return (
    <div className="demo-banner">
      Clínica ficticia · proyecto demo de{' '}
      <a href="https://por2duros.com" target="_blank" rel="noopener noreferrer">
        Por 2 Duros
      </a>
      {i !== null && (
        <button
          type="button"
          onClick={() => setI((prev) => ((prev ?? 0) + 1) % QUIPS.length)}
          className="demo-quip"
          title="Pulsa para otra 😄"
        >
          {' — '}
          {QUIPS[i]} 😉
        </button>
      )}
    </div>
  );
}

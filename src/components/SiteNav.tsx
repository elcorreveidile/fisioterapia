'use client';

import { useState } from 'react';
import Link from 'next/link';

const LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/tarifas', label: 'Tarifas' },
  { href: '/metodo', label: 'El método' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/mi-cuenta', label: 'Mi cuenta' },
];

export default function SiteNav({ active }: { active?: string }) {
  const [open, setOpen] = useState(false);

  const linkClass = (href: string) =>
    active === href ? 'text-amber' : 'hover:text-amber transition-colors';

  return (
    <nav className="bg-petrol text-sand py-4 px-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">│</span>
          <span className="font-serif text-xl font-semibold">Eje Fisioterapia</span>
        </Link>

        {/* Enlaces de escritorio */}
        <div className="hidden md:flex gap-6 text-sm">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/reserva"
            className="hidden sm:inline-block bg-amber text-ink px-4 py-2 rounded hover:bg-amber-dark transition-colors font-medium text-sm"
          >
            Reserva tu valoración
          </Link>
          {/* Botón hamburguesa (móvil) */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden p-1"
            aria-label="Abrir menú"
            aria-expanded={open}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {open && (
        <div className="md:hidden mt-4 pt-4 border-t border-sand/20 flex flex-col gap-3 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={linkClass(l.href)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/reserva"
            onClick={() => setOpen(false)}
            className="bg-amber text-ink px-4 py-2 rounded text-center font-medium"
          >
            Reserva tu valoración
          </Link>
        </div>
      )}
    </nav>
  );
}

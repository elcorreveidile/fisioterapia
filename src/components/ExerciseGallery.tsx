'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

type Exercise = {
  src: string;
  label: string;
};

export default function ExerciseGallery({ exercises }: { exercises: Exercise[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const isOpen = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const show = useCallback(
    (next: number) => setIndex((next + exercises.length) % exercises.length),
    [exercises.length]
  );

  // Teclado: Esc cierra, flechas navegan
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') setIndex((i) => (i! + 1) % exercises.length);
      else if (e.key === 'ArrowLeft') setIndex((i) => (i! - 1 + exercises.length) % exercises.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close, exercises.length]);

  // Bloquea el scroll del fondo mientras el visor está abierto
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const current = isOpen ? exercises[index] : null;

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise, i) => (
          <button
            key={exercise.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ver en grande: ${exercise.label}`}
            className="group block text-left bg-white rounded-lg overflow-hidden border border-petrol/15 shadow-sm cursor-zoom-in transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={exercise.src}
                alt={`Pauta de ejercicio: ${exercise.label}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <span className="block px-4 py-3 text-sm font-medium text-petrol">
              {exercise.label}
            </span>
          </button>
        ))}
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Pauta de ejercicio: ${current.label}`}
          onClick={close}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/85 backdrop-blur-sm p-4 sm:p-8"
        >
          {/* Cerrar */}
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="absolute top-4 right-4 text-sand/90 hover:text-sand text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
          >
            ×
          </button>

          {/* Anterior */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              show(index! - 1);
            }}
            aria-label="Anterior"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-sand/90 hover:text-sand text-4xl w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
          >
            ‹
          </button>

          {/* Imagen */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl h-[78vh]"
          >
            <Image
              src={current.src}
              alt={`Pauta de ejercicio: ${current.label}`}
              fill
              sizes="(max-width: 1024px) 92vw, 1024px"
              className="object-contain"
              priority
            />
          </div>

          {/* Siguiente */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              show(index! + 1);
            }}
            aria-label="Siguiente"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-sand/90 hover:text-sand text-4xl w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
          >
            ›
          </button>

          {/* Pie: nombre + contador */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-4 text-center text-sand"
          >
            <p className="font-medium">{current.label}</p>
            <p className="text-sm text-sand/70">
              {index! + 1} / {exercises.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

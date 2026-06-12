import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-sand flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-6xl font-serif text-petrol mb-4">404</h1>
        <p className="text-2xl text-ink-light mb-8">Página no encontrada</p>
        <Link
          href="/"
          className="inline-block bg-petrol text-sand px-6 py-3 rounded hover:bg-petrol-dark transition-colors font-medium"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

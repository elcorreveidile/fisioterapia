'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales incorrectas');
      } else if (result?.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError('Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded shadow-lg overflow-hidden">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl text-petrol">│</span>
              <span className="font-serif text-2xl text-petrol">Eje Fisioterapia</span>
            </div>
            <h1 className="text-xl font-semibold text-petrol break-words">Panel de administración</h1>
            <p className="text-ink-light text-sm mt-2">Introduce tus credenciales para acceder</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-petrol mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded border border-petrol/20 focus:border-petrol focus:outline-none"
                placeholder="admin@ejefisioterapia-demo.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-petrol mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded border border-petrol/20 focus:border-petrol focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-petrol text-sand px-6 py-3 rounded hover:bg-petrol-dark transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-ink-light break-words">
            <p className="mb-2">
              <strong>Demo:</strong> admin@ejefisioterapia-demo.com / admin123
            </p>
            <p>
              <a href="/" className="text-petrol hover:text-amber transition-colors">
                ← Volver a la web
              </a>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-ink-light">
          <p>⚠️ Panel de administración. Acceso restringido.</p>
        </div>
      </div>
    </div>
  );
}

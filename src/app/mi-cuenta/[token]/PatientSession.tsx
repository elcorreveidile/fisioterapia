'use client';

import { useEffect } from 'react';

export default function PatientSession({ token }: { token: string }) {
  // Guarda el token como sesión para no tener que volver a pedir el enlace.
  useEffect(() => {
    document.cookie = `patient_access=${token}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
  }, [token]);

  const logout = () => {
    document.cookie = 'patient_access=; path=/; max-age=0; samesite=lax';
    window.location.href = '/mi-cuenta';
  };

  return (
    <button
      type="button"
      onClick={logout}
      className="text-sm text-sand/90 hover:text-sand underline"
    >
      Cerrar sesión
    </button>
  );
}

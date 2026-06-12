import Link from 'next/link';

export default function ReservaPage() {
  return (
    <div className="flex flex-col">
      {/* Navegación */}
      <nav className="bg-petrol text-sand py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl font-semibold">Eje Fisioterapia</span>
          </Link>
          <div className="hidden md:flex gap-6 text-sm">
            <Link href="/" className="hover:text-amber transition-colors">
              Inicio
            </Link>
            <Link href="/servicios" className="hover:text-amber transition-colors">
              Servicios
            </Link>
            <Link href="/tarifas" className="hover:text-amber transition-colors">
              Tarifas
            </Link>
            <Link href="/metodo" className="hover:text-amber transition-colors">
              El método
            </Link>
            <Link href="/contacto" className="hover:text-amber transition-colors">
              Contacto
            </Link>
          </div>
          <span className="bg-amber text-ink px-4 py-2 rounded font-medium text-sm">
            Reserva tu valoración
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-sand py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-petrol mb-4">Reserva tu cita</h1>
          <p className="text-ink-light text-lg max-w-2xl">
            Elige el servicio que necesitas y selecciona el hueco que mejor te encaje.
          </p>
        </div>
      </section>

      {/* Placeholder */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-sand p-12 rounded border-2 border-petrol/20">
            <h2 className="text-petrol text-2xl mb-4">Motor de reservas en desarrollo</h2>
            <p className="text-ink-light mb-8">
              Esta funcionalidad está siendo implementada. Incluirá:
            </p>
            <ul className="text-ink-light space-y-2 text-left max-w-md mx-auto mb-8">
              <li>✓ Selección de servicio y fisioterapeuta</li>
              <li>✓ Calendario de disponibilidad en tiempo real</li>
              <li>✓ Prevención de solapamientos a nivel de base de datos</li>
              <li>✓ Confirmación por email con enlace de cancelación</li>
              <li>✓ Recordatorios automáticos 24h antes</li>
              <li>✓ Uso de bonos existentes</li>
            </ul>
            <p className="text-ink-light mb-8">
              Mientras tanto, puedes reservar por teléfono o WhatsApp:
            </p>
            <a
              href="tel:+34600123456"
              className="inline-block bg-petrol text-sand px-8 py-4 rounded hover:bg-petrol-dark transition-colors font-medium"
            >
              Llamar: +34 600 123 456
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-petrol text-sand py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="border-t border-petrol/30 pt-8 text-sm opacity-60 text-center">
            <p>© 2026 Eje Fisioterapia. Clínica ficticia — proyecto demo.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

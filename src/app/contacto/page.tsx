import Link from 'next/link';

export default function ContactoPage() {
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
            <Link href="/contacto" className="text-amber">
              Contacto
            </Link>
          </div>
          <Link
            href="/reserva"
            className="bg-amber text-ink px-4 py-2 rounded hover:bg-amber-dark transition-colors font-medium text-sm"
          >
            Reserva tu valoración
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-sand py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-petrol mb-4">Contacto</h1>
          <p className="text-ink-light text-lg max-w-2xl">
            Estamos en Granada centro. Puedes venir, llamarnos o escribirnos por WhatsApp.
          </p>
        </div>
      </section>

      {/* Información de contacto */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-petrol mb-8">Datos de contacto</h2>
            <dl className="space-y-6">
              <div>
                <dt className="font-semibold text-petrol mb-1">Dirección</dt>
                <dd className="text-ink-light">Calle Ejemplo, 12 · 18001 Granada</dd>
              </div>
              <div>
                <dt className="font-semibold text-petrol mb-1">Teléfono</dt>
                <dd className="text-ink-light">+34 600 123 456</dd>
              </div>
              <div>
                <dt className="font-semibold text-petrol mb-1">WhatsApp</dt>
                <dd className="text-ink-light">+34 600 123 456</dd>
              </div>
              <div>
                <dt className="font-semibold text-petrol mb-1">Email</dt>
                <dd className="text-ink-light">hola@ejefisioterapia-demo.com</dd>
              </div>
            </dl>

            <div className="mt-8">
              <h3 className="font-semibold text-petrol mb-4">Horario</h3>
              <p className="text-ink-light">
                Lunes a viernes: 9:00–14:00 y 16:00–20:30
              </p>
            </div>
          </div>

          <div className="bg-sand rounded aspect-square flex items-center justify-center min-h-[400px]">
            <p className="text-petrol text-center px-8">[Mapa de Granada con marca]</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-sand">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-petrol mb-6">¿Prefieres reservar ahora?</h2>
          <p className="text-ink-light mb-8">
            Puedes ver nuestra disponibilidad y reservar cita directamente desde la web.
          </p>
          <Link
            href="/reserva"
            className="inline-block bg-petrol text-sand px-8 py-4 rounded hover:bg-petrol-dark transition-colors font-medium"
          >
            Ver disponibilidad y reservar
          </Link>
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

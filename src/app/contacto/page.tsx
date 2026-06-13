import Link from 'next/link';
import ContactForm from './ContactForm';
import SiteNav from '@/components/SiteNav';

export default function ContactoPage() {
  return (
    <div className="flex flex-col">
      {/* Navegación */}
      <SiteNav active="/contacto" />

      {/* Header */}
      <section className="hero-surface py-20 px-6">
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

          <div className="rounded overflow-hidden border border-petrol/15 min-h-[400px] aspect-square">
            <iframe
              title="Ubicación de Eje Fisioterapia en Granada"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-3.6126%2C37.1700%2C-3.5840%2C37.1850&layer=mapnik&marker=37.1773%2C-3.5986"
              loading="lazy"
              className="w-full h-full"
              style={{ border: 0 }}
            />
          </div>
        </div>
      </section>

      {/* Formulario de contacto */}
      <section className="py-20 px-6 bg-sand">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-petrol text-center mb-2">Escríbenos</h2>
          <p className="text-ink-light text-center mb-8">
            Cuéntanos qué necesitas y te respondemos lo antes posible.
          </p>
          <ContactForm />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-white">
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
      <footer className="bg-petrol surface-texture-light text-sand py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="border-t border-petrol/30 pt-8 text-sm opacity-60 text-center">
            <p>© 2026 Eje Fisioterapia. Clínica ficticia — proyecto demo. · v1.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

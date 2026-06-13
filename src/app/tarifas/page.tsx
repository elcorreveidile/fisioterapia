import Link from 'next/link';
import SiteNav from '@/components/SiteNav';

export default function TarifasPage() {
  return (
    <div className="flex flex-col">
      {/* Navegación */}
      <SiteNav active="/tarifas" />

      {/* Header */}
      <section className="hero-surface py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-petrol mb-4">Tarifas</h1>
          <p className="text-ink-light text-lg max-w-2xl">
            Precios transparentes, sin letra pequeña. Sin permanencias, sin sorpresas.
          </p>
        </div>
      </section>

      {/* Tabla de tarifas */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-petrol">
                <th className="text-left py-4 px-4 font-serif text-xl text-petrol">Servicio</th>
                <th className="text-center py-4 px-4 font-serif text-xl text-petrol">Duración</th>
                <th className="text-right py-4 px-4 font-serif text-xl text-petrol">Precio</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Valoración Inicial', duration: '60\'', price: '45€' },
                { name: 'Fisioterapia General', duration: '45\'', price: '40€' },
                { name: 'Fisioterapia Deportiva', duration: '60\'', price: '50€' },
                { name: 'Suelo Pélvico', duration: '45\'', price: '45€' },
                { name: 'ATM y Bruxismo', duration: '45\'', price: '40€' },
                { name: 'Fisioterapia Respiratoria', duration: '45\'', price: '40€' },
                { name: 'Masaje de Descarga', duration: '30\'', price: '30€' },
              ].map((service, i) => (
                <tr key={i} className="border-b border-petrol/20 hover:bg-sand/50">
                  <td className="py-4 px-4 font-medium">{service.name}</td>
                  <td className="text-center py-4 px-4 text-ink-light">{service.duration}</td>
                  <td className="text-right py-4 px-4 font-semibold text-petrol">{service.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bonos */}
      <section className="py-20 px-6 bg-sand">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-petrol text-center mb-16">Bonos</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                sessions: 5,
                discount: '10%',
                example: '180€ (en lugar de 200€)',
                description: 'Bono de 5 sesiones de Fisioterapia General',
              },
              {
                sessions: 10,
                discount: '15%',
                example: '340€ (en lugar de 400€)',
                description: 'Bono de 10 sesiones de Fisioterapia General',
              },
            ].map((bono, i) => (
              <div key={i} className="bg-white p-8 rounded border-2 border-petrol text-center">
                <h3 className="font-serif text-2xl text-petrol mb-4">Bono {bono.sessions} sesiones</h3>
                <div className="text-4xl font-bold text-amber mb-4">{bono.discount} dto.</div>
                <p className="text-ink-light mb-6">{bono.description}</p>
                <p className="text-lg font-semibold text-petrol mb-6">{bono.example}</p>
                <ul className="text-sm text-ink-light space-y-2 mb-6 text-left">
                  <li>✓ Sin permanencia</li>
                  <li>✓ Sin fecha de caducidad (6 meses)</li>
                  <li>✓ Válido para cualquier fisioterapeuta</li>
                  <li>✓ Compartible entre miembros de la familia</li>
                </ul>
                <Link
                  href="/contacto"
                  className="inline-block bg-petrol text-sand px-6 py-3 rounded hover:bg-petrol-dark transition-colors font-medium"
                >
                  Consultar disponibilidad
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-ink-light mt-8 text-sm">
            El bono se paga en la primera visita. No incluye Valoración Inicial ni Fisioterapia Deportiva.
          </p>
        </div>
      </section>

      {/* Aclaraciones */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-petrol mb-8">Preguntas frecuentes</h2>
          <dl className="space-y-6">
            {[
              {
                q: '¿Necesito pasar por valoración inicial?',
                a: 'Sí, si es tu primera vez. La valoración inicial nos permite hacer un diagnóstico preciso y planificar el tratamiento.',
              },
              {
                q: '¿Las sesiones son individuales?',
                a: 'Sí, siempre. Una persona, un fisio, una hora. No compartes sesión con nadie.',
              },
              {
                q: '¿Qué incluye la sesión?',
                a: 'Valoración del día, tratamiento manual, ejercicios y pauta detallada para casa.',
              },
              {
                q: '¿Puedo pagar con tarjeta?',
                a: 'Sí, aceptamos tarjeta, efectivo y transferencia.',
              },
              {
                q: '¿Qué pasa si falto a mi cita?',
                a: 'Si cancelas con más de 24h de antelación, no se cobrará. Si cancelas después o no presentas, se cobrará el 50% de la sesión.',
              },
            ].map((faq, i) => (
              <div key={i}>
                <dt className="font-semibold text-petrol mb-2">{faq.q}</dt>
                <dd className="text-ink-light">{faq.a}</dd>
              </div>
            ))}
          </dl>
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

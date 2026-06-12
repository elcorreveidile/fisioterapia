import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Navegación */}
      <nav className="bg-petrol text-sand py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl font-semibold">Eje Fisioterapia</span>
          </div>
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
          <Link
            href="/reserva"
            className="bg-amber text-ink px-4 py-2 rounded hover:bg-amber-dark transition-colors font-medium text-sm"
          >
            Reserva tu valoración
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-[80vh] flex items-center bg-sand py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-petrol mb-6">
              Entiende tu dolor.
            </h1>
            <p className="text-ink-light text-lg mb-8 leading-relaxed">
              Fisioterapia de una persona, un fisio y una hora. Sales tratado — y sabiendo qué hacer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/reserva"
                className="bg-petrol text-sand px-6 py-3 rounded hover:bg-petrol-dark transition-colors font-medium text-center"
              >
                Reserva tu valoración
              </Link>
              <Link
                href="/tarifas"
                className="border-2 border-petrol text-petrol px-6 py-3 rounded hover:bg-petrol hover:text-sand transition-colors font-medium text-center"
              >
                Ver tarifas
              </Link>
            </div>
          </div>
          <div className="bg-sand-dark rounded-lg aspect-[4/3] flex items-center justify-center">
            <p className="text-petrol text-center px-8">
              [Fotografía: manos de fisio trabajando, paciente en movimiento]
            </p>
          </div>
        </div>
      </section>

      {/* Tres pilares */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-petrol text-center mb-16">
            Tres cosas que nos hacen diferentes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4 text-petrol">60 minutos</div>
              <h3 className="font-serif text-xl mb-2">Tiempo real de tratamiento</h3>
              <p className="text-ink-light">
                No hay camillas en cadena ni sesiones exprés. Cada hora es tuya: evaluación, tratamiento y explicación.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4 text-amber">Educación</div>
              <h3 className="font-serif text-xl mb-2">Entiendes qué te pasa</h3>
              <p className="text-ink-light">
                Saldrás de cada sesión sabiendo el nombre de tu dolor, por qué ha aparecido y qué puedes hacer tú.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4 text-petrol">Pauta escrita</div>
              <h3 className="font-serif text-xl mb-2">Sabes qué hacer en casa</h3>
              <p className="text-ink-light">
                Ejercicios específicos con explicación detallada. No es "descansa": es activa y personalizada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios destacados */}
      <section className="py-20 px-6 bg-sand">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-petrol text-center mb-16">
            Servicios
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Fisioterapia General',
                duration: '45\'',
                price: '40€',
                description: 'Tratamiento individualizado con pauta de ejercicios para casa.',
              },
              {
                title: 'Fisioterapia Deportiva',
                duration: '60\'',
                price: '50€',
                description: 'Readaptación funcional para atletas y deportistas amateurs.',
              },
              {
                title: 'Valoración Inicial',
                duration: '60\'',
                price: '45€',
                description: 'Exploración física completa y plan de tratamiento personalizado.',
              },
            ].map((service, i) => (
              <div key={i} className="bg-white p-6 rounded border border-petrol/20">
                <h3 className="font-serif text-xl mb-2">{service.title}</h3>
                <p className="text-sm text-ink-light mb-4">{service.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-amber font-medium">{service.duration}</span>
                  <span className="text-petrol font-semibold">{service.price}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/servicios"
              className="text-petrol hover:text-amber transition-colors font-medium"
            >
              Ver todos los servicios →
            </Link>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-petrol text-center mb-16">
            Tu equipo
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: 'Carlos Molina García',
                bio: 'Especialista en fisioterapia deportiva y readaptación funcional. Más de 10 años tratando a atletas de élite y pacientes que quieren volver a moverse sin dolor.',
              },
              {
                name: 'Laura Fernández Ruiz',
                bio: 'Experta en suelo pélvico, fisioterapia respiratoria y rehabilitación postural. Me gusta que cada paciente entienda qué le pasa y por qué.',
              },
            ].map((prof, i) => (
              <div key={i} className="text-center">
                <div className="w-32 h-32 bg-sand rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-petrol text-sm">[Foto]</span>
                </div>
                <h3 className="font-serif text-xl mb-2">{prof.name}</h3>
                <p className="text-ink-light text-sm">{prof.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Opiniones */}
      <section className="py-20 px-6 bg-sand">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-petrol text-center mb-16">
            Lo que dicen nuestros pacientes
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                text: 'Por primera vez entiendo por qué me dolía la espalda. Me ha dado ejercicios y en dos semanas he vuelto a correr.',
                author: 'María L.',
              },
              {
                text: 'No es una sesión de magnetoterapia aparcada. Me ha tratado, me ha explicado y me ha dado pauta para casa.',
                author: 'Juan G.',
              },
              {
                text: 'La hora se me hace corta. Da gusto que te expliquen y te enseñen a manejarte tú solo.',
                author: 'Ana M.',
              },
            ].map((opinion, i) => (
              <div key={i} className="bg-white p-6 rounded">
                <p className="text-ink-light mb-4 italic">&ldquo;{opinion.text}&rdquo;</p>
                <p className="font-medium text-petrol">— {opinion.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mapa */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-petrol text-center mb-16">
            Estamos aquí
          </h2>
          <div className="bg-sand rounded aspect-video flex items-center justify-center mb-8">
            <p className="text-petrol">[Mapa de Granada: Calle ficticia]</p>
          </div>
          <div className="text-center">
            <p className="text-ink-light mb-4">
              Calle Ejemplo, 12 · 18001 Granada
            </p>
            <Link
              href="/contacto"
              className="text-petrol hover:text-amber transition-colors font-medium"
            >
              Ver datos de contacto →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-petrol text-sand py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">│</span>
                <span className="font-serif text-lg">Eje Fisioterapia</span>
              </div>
              <p className="text-sm opacity-80">
                Entiende tu dolor.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><Link href="/servicios">Fisioterapia General</Link></li>
                <li><Link href="/servicios">Deportiva</Link></li>
                <li><Link href="/servicios">Suelo Pélvico</Link></li>
                <li><Link href="/servicios">ATM y Bruxismo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Clínica</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><Link href="/metodo">El método</Link></li>
                <li><Link href="/tarifas">Tarifas</Link></li>
                <li><Link href="/contacto">Contacto</Link></li>
                <li><Link href="/legal">Aviso legal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Reserva</h4>
              <Link
                href="/reserva"
                className="bg-amber text-ink px-4 py-2 rounded hover:bg-amber-dark transition-colors font-medium text-sm inline-block"
              >
                Reserva tu cita
              </Link>
            </div>
          </div>
          <div className="border-t border-petrol/30 pt-8 text-sm opacity-60 text-center">
            <p>© 2026 Eje Fisioterapia. Clínica ficticia — proyecto demo.</p>
            <p className="mt-2">
              Ninguna persona, dirección ni número de colegiado son reales. El contenido sanitario es ilustrativo.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from 'next/link';

export default function MetodoPage() {
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
            <Link href="/metodo" className="text-amber">
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
      <section className="bg-sand py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-petrol mb-4">Por qué una hora</h1>
          <p className="text-ink-light text-lg max-w-2xl">
            La fisioterapia que ofrecemos es diferente porque el tiempo es tuyo: de evaluación, de tratamiento y de explicación.
          </p>
        </div>
      </section>

      {/* Una hora, por qué */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-petrol mb-6">Una hora entera</h2>
              <p className="text-ink-light mb-4 leading-relaxed">
                En muchas clínicas la sesión dura 20-30 minutos. El resto del tiempo estás en camilla con magnetoterapia, luz o algo que se deja aplicándose solo.
              </p>
              <p className="text-ink-light mb-4 leading-relaxed">
                Aquí no. La hora es tuya: el fisio está contigo todo el tiempo. Evaluando, tratando, explicando. No hay tiempos muertos ni máquinas delegadas.
              </p>
              <p className="text-ink-light leading-relaxed">
                ¿Por qué? Porque la fisioterapia de verdad necesita tiempo: para observar, para palpación, para corregir, para enseñar. Para que entiendas qué te pasa.
              </p>
            </div>
            <div className="bg-sand rounded aspect-square flex items-center justify-center">
              <p className="text-petrol text-center px-8">[Ilustración: reloj con 60 minutos, manos trabajando]</p>
            </div>
          </div>
        </div>
      </section>

      {/* Explicamos, por qué */}
      <section className="py-20 px-6 bg-sand">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-sand-dark rounded aspect-square flex items-center justify-center">
              <p className="text-petrol text-center px-8">[Fotografía: fisio explicando a paciente con ejercicios]</p>
            </div>
            <div>
              <h2 className="text-petrol mb-6">Explicamos qué te pasa</h2>
              <p className="text-ink-light mb-4 leading-relaxed">
                Si sabes el nombre de tu dolor, dejas de tener miedo. Si entiendes por qué ha aparecido, puedes evitar que vuelva.
              </p>
              <p className="text-ink-light mb-4 leading-relaxed">
                En cada sesión te explicamos: qué músculo está afectado, qué postura o hábito lo provoca, qué podemos hacer y qué tienes que hacer tú.
              </p>
              <p className="text-ink-light leading-relaxed">
                Es fisioterapia pedagógica: el objetivo no es que vengas cada semana, sino que aprendas a manejarte tú solo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pauta para casa, por qué */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-petrol mb-6">Sales con pauta para casa</h2>
              <p className="text-ink-light mb-4 leading-relaxed">
                "Descansa en casa" no es una pauta. Aquí sales con 2-3 ejercicios específicos, explicados y por escrito.
              </p>
              <p className="text-ink-light mb-4 leading-relaxed">
                Los ejercicios los trabajamos juntos en la sesión, para que los hagas bien. Y te los llevas por escrito (o por email, si prefieres) para repasar en casa.
              </p>
              <p className="text-ink-light leading-relaxed">
                ¿El resultado? Recuperaciones más rápidas, menos recidivas y más autonomía. Tú sabes qué hacer si vuelve el dolor.
              </p>
            </div>
            <div className="bg-sand rounded aspect-square flex items-center justify-center">
              <p className="text-petrol text-center px-8">[Ilustración: papel con ejercicios]</p>
            </div>
          </div>
        </div>
      </section>

      {/* No hay camillas en cadena */}
      <section className="py-20 px-6 bg-sand">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-petrol text-center mb-12">No hay camillas en cadena</h2>
          <p className="text-ink-light text-center max-w-2xl mx-auto mb-12 text-lg">
            Atendemos a una persona cada hora. No somos un centro con diez camillas donde el fisio va rotando cada 15 minutos.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded">
              <div className="text-4xl font-bold text-petrol mb-4">1</div>
              <h3 className="font-serif text-xl mb-2">Paciente</h3>
              <p className="text-ink-light">Por sesión, para que toda la atención sea para ti.</p>
            </div>
            <div className="bg-white p-8 rounded">
              <div className="text-4xl font-bold text-petrol mb-4">1</div>
              <h3 className="font-serif text-xl mb-2">Fisioterapeuta</h3>
              <p className="text-ink-light">Contigo todo el tiempo, sin rotar entre camillas.</p>
            </div>
            <div className="bg-white p-8 rounded">
              <div className="text-4xl font-bold text-petrol mb-4">1h</div>
              <h3 className="font-serif text-xl mb-2">Tiempo real</h3>
              <p className="text-ink-light">De tratamiento, explicación y pauta. Sin tiempos muertos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-petrol text-sand">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl mb-6">¿Quieres probar este método?</h2>
          <p className="text-xl mb-8 opacity-90">
            Empieza con una valoración inicial: 60 minutos para entender qué te pasa y qué podemos hacer.
          </p>
          <Link
            href="/reserva"
            className="inline-block bg-amber text-ink px-8 py-4 rounded hover:bg-amber-dark transition-colors font-medium text-lg"
          >
            Reserva tu valoración (45€)
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

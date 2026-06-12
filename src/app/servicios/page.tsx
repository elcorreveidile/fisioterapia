import Link from 'next/link';

const services = [
  {
    slug: 'fisioterapia-general',
    name: 'Fisioterapia General',
    description: 'Sesión individualizada de fisioterapia: valoración, tratamiento manual y pauta de ejercicios para casa.',
    fullDescription: 'En cada sesión evaluamos tu estado actual, aplicamos tratamiento manual específico (masaje, movilizaciones, estiramientos) y te damos una pauta personalizada de ejercicios para casa. No es una sesión de 20 minutos con magnetoterapia aparcada: es una hora completa de atención.',
    duration: 45,
    price: 40,
    whatYouGet: 'Diagnóstico claro + tratamiento manual + 2-3 ejercicios específicos con pauta escrita y explicación detallada.',
    indications: 'Dolor musculoesquelético, contracturas, limitaciones de movilidad, recuperación postural.',
  },
  {
    slug: 'fisioterapia-deportiva',
    name: 'Fisioterapia Deportiva',
    description: 'Readaptación funcional y tratamiento de lesiones deportivas. Recupera tu máximo nivel y previene recidivas.',
    fullDescription: 'Valoración funcional específica para tu deporte, tratamiento de la lesión y plan de retorno progresivo a la actividad. Trabajamos tanto la recuperación como la prevención de nuevas lesiones mediante ejercicios de potenciación y corrección de patrones de movimiento.',
    duration: 60,
    price: 50,
    whatYouGet: 'Valoración funcional + plan de retorno al deporte + ejercicios específicos de prevención.',
    indications: 'Lesiones deportivas (rodilla, tobillo, hombro), prevención de recidivas, mejora de rendimiento.',
  },
  {
    slug: 'suelo-pelvico',
    name: 'Suelo Pélvico',
    description: 'Rehabilitación del suelo pélvico para incontinencia, prolapsos, posparto y disfunciones sexuales.',
    fullDescription: 'Valoración perineal específica (si procede), ejercicios de rehabilitación del suelo pélvico, reeducación de hábitos y pauta de autocuidado. Trabajamos tanto la recuperación como la prevención de disfunciones del suelo pélvico.',
    duration: 45,
    price: 45,
    whatYouGet: 'Valoración perineal + plan de ejercicios progresivos + hábitos diarios para mejorar y mantener.',
    indications: 'Incontinencia urinaria, prolapsos, posparto, disfunciones sexuales, dolor pélvico.',
  },
  {
    slug: 'atm-bruxismo',
    name: 'ATM y Bruxismo',
    description: 'Tratamiento de dolor mandibular, clics al abrir la boca y dolor de cabeza por tensión.',
    fullDescription: 'Tratamiento de la articulación temporomandibular (ATM) y de los músculos masticadores mediante técnicas manuales, liberación miofascial y pauta de automasaje y ejercicios de movilidad. También trabajamos en hábitos y posturas que pueden estar contribuyendo al problema.',
    duration: 45,
    price: 40,
    whatYouGet: 'Liberación mandibular + pauta de automasaje + ejercicios de movilidad + hábitos a vigilar.',
    indications: 'Dolor mandibular, clics al abrir/cerrar boca, bruxismo, dolores de cabeza de origen tensional.',
  },
  {
    slug: 'fisioterapia-respiratoria',
    name: 'Fisioterapia Respiratoria',
    description: 'Tratamiento de asma, EPOC, bronquitis crónica y patologías respiratorias con ejercicio terapéutico.',
    fullDescription: 'Valoración de la mecánica respiratoria, técnicas de drenaje bronquial, ejercicio terapéutico adaptado a tu capacidad y pauta de ejercicio respiratorio para casa. También enseñamos técnicas de manejo de crisis.',
    duration: 45,
    price: 40,
    whatYouGet: 'Técnica de drenaje + plan de ejercicio respiratorio + pauta de manejo de crisis.',
    indications: 'Asma, EPOC, bronquitis crónica, patologías respiratorias, disnea de esfuerzo.',
  },
  {
    slug: 'masaje-descarga',
    name: 'Masaje de Descarga',
    description: 'Masaje terapéutico para liberar tensión muscular. No es fisioterapia: es pura relajación y descarga.',
    fullDescription: 'Sesión de masaje terapéutico para liberar tensión muscular acumulada por estrés, posturas o actividad física. No incluye valoración ni diagnóstico: es puramente de bienestar y relajación.',
    duration: 30,
    price: 30,
    whatYouGet: 'Sensación de alivio inmediato + recomendaciones de autocuidado básico.',
    indications: 'Tensión muscular, estrés, sobrecarga por esfuerzo, necesidad de relajación.',
  },
  {
    slug: 'valoracion-inicial',
    name: 'Valoración Inicial',
    description: 'Primera visita: exploración física completa, análisis de tu dolor y plan de tratamiento personalizado.',
    fullDescription: 'Exploración física completa: observación de la postura, movilidad, fuerza, pruebas ortopédicas específicas según tu dolor. Te explico qué te pasa, por qué ha aparecido y cuántas sesiones podrías necesitar. Al final, te doy una primera pauta de ejercicios.',
    duration: 60,
    price: 45,
    whatYouGet: 'Diagnóstico preciso + número de sesiones estimadas + primera pauta de ejercicios para empezar.',
    indications: 'Primera visita, dolor no diagnosticado, necesidad de plan de tratamiento completo.',
  },
];

export default function ServiciosPage() {
  return (
    <div className="flex flex-col">
      {/* Navegación (igual que home) */}
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
            <Link href="/servicios" className="text-amber">
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

      {/* Header */}
      <section className="bg-sand py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-petrol mb-4">Servicios</h1>
          <p className="text-ink-light text-lg max-w-2xl">
            Cada servicio incluye tiempo de tratamiento y, lo más importante, una pauta personalizada para que sepas qué hacer en casa.
          </p>
        </div>
      </section>

      {/* Lista de servicios */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto space-y-12">
          {services.map((service, i) => (
            <div key={i} className="bg-sand p-8 rounded border border-petrol/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-petrol mb-2">{service.name}</h2>
                  <p className="text-sm text-amber font-medium">{service.duration} minutos</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-petrol">{service.price}€</p>
                </div>
              </div>
              <p className="text-ink-light mb-6">{service.fullDescription}</p>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-petrol mb-2">Qué te llevas a casa</h3>
                  <p className="text-sm text-ink-light">{service.whatYouGet}</p>
                </div>
                <div>
                  <h3 className="font-medium text-petrol mb-2">Para qué dolencias</h3>
                  <p className="text-sm text-ink-light">{service.indications}</p>
                </div>
              </div>
              <Link
                href={`/reserva?service=${service.slug}`}
                className="inline-block bg-petrol text-sand px-6 py-3 rounded hover:bg-petrol-dark transition-colors font-medium"
              >
                Reservar este servicio
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer (igual que home) */}
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

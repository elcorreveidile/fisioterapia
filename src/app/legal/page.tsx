import Link from 'next/link';

export default function LegalPage() {
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
          <Link
            href="/reserva"
            className="bg-amber text-ink px-4 py-2 rounded hover:bg-amber-dark transition-colors font-medium text-sm"
          >
            Reserva tu valoración
          </Link>
        </div>
      </nav>

      {/* Contenido */}
      <section className="bg-sand py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-petrol mb-8">Aviso legal, privacidad y cookies</h1>

          <div className="space-y-12">
            <section>
              <h2 className="text-petrol mb-4">Aviso legal</h2>
              <p className="text-ink-light mb-4">
                En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico, se informa:
              </p>
              <ul className="text-ink-light space-y-2 list-disc list-inside">
                <li>Titular: [Nombre de la empresa real del cliente]</li>
                <li>Domicilio: Calle Ejemplo, 12 · 18001 Granada</li>
                <li>CIF: [CIF real]</li>
                <li>Email: hola@dominio-real.com</li>
                <li>Actividad: Fisioterapia y rehabilitación</li>
              </ul>
            </section>

            <section>
              <h2 className="text-petrol mb-4">Propiedad intelectual e industrial</h2>
              <p className="text-ink-light">
                Todos los contenidos de este sitio web (textos, imágenes, logos, diseños) son propiedad del titular o de terceros que han autorizado su uso. Queda prohibida su reproducción, distribución o modificación sin autorización expresa.
              </p>
            </section>

            <section>
              <h2 className="text-petrol mb-4">Protección de datos personales</h2>
              <p className="text-ink-light mb-4">
                Los datos personales facilitados a través de este formulario de reserva serán tratados por [Nombre de la empresa real] con la finalidad de gestionar las citas y el historial clínico del paciente.
              </p>
              <p className="text-ink-light mb-4">
                <strong>Base legal:</strong> Consentimiento del interesado y, en su caso, cumplimiento de obligations legales en materia sanitaria.
              </p>
              <p className="text-ink-light mb-4">
                <strong>Datos de salud:</strong> De acuerdo con el RGPD, los datos de salud (categoría especial) requieren consentimiento explícito. El paciente podrá revocarlo en cualquier momento.
              </p>
              <p className="text-ink-light mb-4">
                <strong>Derechos:</strong> Tiene derecho a acceder, rectificar, suprimir, limitar u oponerse al tratamiento de sus datos, así como a la portabilidad de los mismos. Para ejercerlos, escriba a hola@dominio-real.com.
              </p>
              <p className="text-ink-light">
                <strong>Conservación:</strong> Los datos se conservarán mientras exista relación clínica y, posteriormente, durante el tiempo legalmente establecido (mínimo 5 años según Ley 41/2002 de autonomía del paciente).
              </p>
            </section>

            <section>
              <h2 className="text-petrol mb-4">Cookies</h2>
              <p className="text-ink-light mb-4">
                Este sitio web utiliza cookies técnicas esenciales para el funcionamiento del formulario de reserva. No se utilizan cookies de publicidad o análisis de terceros.
              </p>
              <p className="text-ink-light">
                Puede configurar su navegador para rechazar cookies, aunque ello puede afectar al funcionamiento de algunos servicios de la web.
              </p>
            </section>

            <section>
              <h2 className="text-petrol mb-4">Jurisdicción y legislación aplicable</h2>
              <p className="text-ink-light">
                Las relaciones entre el titular y los usuarios se rigen por la legislación española. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de Granada.
              </p>
            </section>

            <section className="bg-white p-6 rounded border-2 border-amber">
              <h2 className="text-amber mb-4">⚠️ Aviso importante: esta es una clínica ficticia</h2>
              <p className="text-ink-light mb-4">
                <strong>Eje Fisioterapia</strong> es un proyecto demo del catálogo Por 2 Duros. No es una clínica real.
              </p>
              <p className="text-ink-light mb-4">
                Toda la información contenida en este sitio web es ficticia:
              </p>
              <ul className="text-ink-light space-y-2 list-disc list-inside">
                <li>Los nombres de los fisioterapeutas son inventados</li>
                <li>Los números de colegiado (XXXX) son placeholders</li>
                <li>La dirección es ficticia</li>
                <li>Los teléfonos y emails son de demo</li>
                <li>Los pacientes y opiniones son ficticios</li>
              </ul>
              <p className="text-ink-light mt-4">
                El contenido sanitario es meramente ilustrativo y no sustituye el consejo de un profesional sanitario cualificado.
              </p>
              <p className="text-ink-light mt-4">
                Este proyecto está destinado exclusivamente a ser mostrado como ejemplo a clínicas de fisioterapia reales que estén interesadas en adquirir una solución similar.
              </p>
              <p className="text-ink-light mt-4">
                Más información en <a href="https://por2duros.com" className="text-petrol underline">por2duros.com</a>
              </p>
            </section>
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

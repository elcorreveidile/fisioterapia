import { db } from './index';
import {
  professionals,
  services,
  patients,
  availabilityRules,
  bookings,
  vouchers,
  exercises,
  patientExercises,
  treatmentNotes,
  scheduledEmails,
  users,
} from './schema';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Iniciando semilla...');

  // Limpiar datos existentes
  console.log('🧹 Limpiando datos existentes...');
  await db.delete(scheduledEmails);
  await db.delete(patientExercises);
  await db.delete(treatmentNotes);
  await db.delete(bookings);
  await db.delete(vouchers);
  await db.delete(availabilityRules);
  await db.delete(exercises);
  await db.delete(patients);
  await db.delete(services);
  await db.delete(professionals);
  await db.delete(users);

  // Usuario admin
  console.log('🔐 Creando usuario admin...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await db.insert(users).values({
    id: randomUUID(),
    name: 'Admin',
    email: 'admin@ejefisioterapia-demo.com',
    password: hashedPassword,
    role: 'admin',
  });

  // Profesionales
  console.log('👨‍⚕️ Creando profesionales...');
  const [prof1, prof2] = await db
    .insert(professionals)
    .values([
      {
        name: 'Carlos',
        surname: 'Molina García',
        colegiadoNumber: 'XXXX',
        email: 'carlos@ejefisioterapia-demo.com',
        phone: '+34 600 123 456',
        bio: 'Especialista en fisioterapia deportiva y readaptación funcional. Más de 10 años tratando a atletas de élite y pacientes que quieren volver a moverse sin dolor.',
        imageUrl: null,
        active: true,
      },
      {
        name: 'Laura',
        surname: 'Fernández Ruiz',
        colegiadoNumber: 'XXXX',
        email: 'laura@ejefisioterapia-demo.com',
        phone: '+34 600 234 567',
        bio: 'Experta en suelo pélvico, fisioterapia respiratoria y rehabilitación postural. Me gusta que cada paciente entienda qué le pasa y por qué.',
        imageUrl: null,
        active: true,
      },
    ])
    .returning();

  // Servicios
  console.log('💼 Creando servicios...');
  const [serv1, serv2, serv3, serv4, serv5, serv6, serv7] = await db
    .insert(services)
    .values([
      {
        name: 'Fisioterapia General',
        description: 'Sesión individualizada de fisioterapia: valoración, tratamiento manual y pauta de ejercicios para casa.',
        duration: 45,
        price: 4000, // 40€
        category: 'general',
        whatYouGet: 'Diagnóstico claro + tratamiento + 2-3 ejercicios específicos con pauta escrita',
        active: true,
      },
      {
        name: 'Fisioterapia Deportiva',
        description: 'Readaptación funcional y tratamiento de lesiones deportivas. Recupera tu máximo nivel y previene recidivas.',
        duration: 60,
        price: 5000, // 50€
        category: 'deportiva',
        whatYouGet: 'Valoración funcional + plan de retorno + ejercicios específicos para tu deporte',
        active: true,
      },
      {
        name: 'Suelo Pélvico',
        description: 'Rehabilitación del suelo pélvico para incontinencia, prolapsos, posparto y disfunciones sexuales.',
        duration: 45,
        price: 4500, // 45€
        category: 'suelo_pelvico',
        whatYouGet: 'Valoración perineal + plan de ejercicios + hábitos diarios',
        active: true,
      },
      {
        name: 'ATM y Bruxismo',
        description: 'Tratamiento de dolor mandibular, clics al abrir la boca y dolor de cabeza por tensión.',
        duration: 45,
        price: 4000, // 40€
        category: 'atm',
        whatYouGet: 'Liberación mandibular + pauta de automasaje + ejercicios de movilidad',
        active: true,
      },
      {
        name: 'Fisioterapia Respiratoria',
        description: 'Tratamiento de asma, EPOC, bronquitis crónica y patologías respiratorias con ejercicio terapéutico.',
        duration: 45,
        price: 4000, // 40€
        category: 'respiratoria',
        whatYouGet: 'Técnica de drenaje + plan de ejercicio respiratorio + pauta de crisis',
        active: true,
      },
      {
        name: 'Masaje de Descarga',
        description: 'Masaje terapéutico para liberar tensión muscular. No es fisioterapia: es pura relajación y descarga.',
        duration: 30,
        price: 3000, // 30€
        category: 'masaje',
        whatYouGet: 'Sensación de alivio inmediato + recomendaciones de autocuidado',
        active: true,
      },
      {
        name: 'Valoración Inicial',
        description: 'Primera visita: exploración física completa, análisis de tu dolor y plan de tratamiento personalizado.',
        duration: 60,
        price: 4500, // 45€
        category: 'valoracion',
        whatYouGet: 'Diagnóstico preciso + número de sesiones estimadas + primera pauta de ejercicios',
        active: true,
      },
    ])
    .returning();

  // Pacientes
  console.log('👥 Creando pacientes...');
  const [pat1, pat2, pat3] = await db
    .insert(patients)
    .values([
      {
        name: 'María López Sánchez',
        email: 'maria.lopez.demo@example.com',
        phone: '+34 611 111 111',
        generalNotes: 'Paciente motivada, buena adherencia a las pautas.',
        demo: true,
      },
      {
        name: 'Juan García Torres',
        email: 'juan.garcia.demo@example.com',
        phone: '+34 622 222 222',
        generalNotes: 'Deportista amateur, lesionado corriendo. Sigue bien los ejercicios.',
        demo: true,
      },
      {
        name: 'Ana Martínez Ruiz',
        email: 'ana.martinez.demo@example.com',
        phone: '+34 633 333 333',
        generalNotes: 'Dolor cervical por trabajo oficina. Postura mejorable.',
        demo: true,
      },
    ])
    .returning();

  // Reglas de disponibilidad (L-V 9:00-14:00 y 16:00-20:30)
  console.log('📅 Creando disponibilidad...');
  await db.insert(availabilityRules).values(
    [prof1, prof2].flatMap((prof) =>
      [1, 2, 3, 4, 5].flatMap((day) => [
        {
          professionalId: prof.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '14:00',
          active: true,
        },
        {
          professionalId: prof.id,
          dayOfWeek: day,
          startTime: '16:00',
          endTime: '20:30',
          active: true,
        },
      ])
    )
  );

  // Ejercicios
  console.log('💪 Creando biblioteca de ejercicios...');
  const [
    ex1,
    ex2,
    ex3,
    ex4,
    ex5,
    ex6,
    ex7,
    ex8,
    ex9,
    ex10,
    ex11,
    ex12,
    ex13,
    ex14,
    ex15,
    ex16,
    ex17,
    ex18,
    ex19,
    ex20,
  ] = await db
    .insert(exercises)
    .values([
      {
        title: 'Estiramiento cervical',
        description: 'Inclina la cabeza suavemente hacia cada lado para mejorar la movilidad cervical y aliviar la tensión. Mantén 20 segundos.',
        category: 'cervical',
        imageUrl: '/images/ejercicio-estiramiento-cervical.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Estiramiento de cuello',
        description: 'Movilidad suave del cuello en flexión e inclinación para reducir la tensión muscular.',
        category: 'cervical',
        imageUrl: '/images/ejercicio-estiramiento-cuello.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Rotación de hombros',
        description: 'Círculos amplios y controlados con los hombros, hacia delante y hacia atrás.',
        category: 'hombro',
        imageUrl: '/images/ejercicio-rotacion-hombros.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Estabilización de hombros',
        description: 'Retracción escapular para fortalecer la postura y estabilizar la cintura escapular.',
        category: 'hombro',
        imageUrl: '/images/ejercicio-estabilizacion-hombros.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Elevación lateral de hombros',
        description: 'Eleva los brazos hasta la altura de los hombros con peso ligero para fortalecer el deltoides.',
        category: 'hombro',
        imageUrl: '/images/ejercicio-elevacion-lateral-hombros.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Extensión de rodilla',
        description: 'Sentado, extiende la rodilla para fortalecer el cuádriceps. Baja con control.',
        category: 'rodilla',
        imageUrl: '/images/ejercicio-extension-rodilla.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Flexión de rodilla',
        description: 'En posición sentada con banda, flexiona la rodilla para mejorar fuerza y control.',
        category: 'rodilla',
        imageUrl: '/images/ejercicio-flexion-rodillas.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Sentadilla en pared',
        description: 'Espalda apoyada en la pared, mantén la posición a 90° para ganar fuerza isométrica.',
        category: 'rodilla',
        imageUrl: '/images/ejercicio-sentadilla-pared.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Puente de glúteos',
        description: 'Tumbado, eleva las caderas activando glúteos y core. Mantén unos segundos.',
        category: 'cadera',
        imageUrl: '/images/ejercicio-puente-gluteos.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Círculos de cadera',
        description: 'De pie y con apoyo, dibuja círculos con la pierna para movilizar la cadera.',
        category: 'cadera',
        imageUrl: '/images/ejercicio-circulos-cadera.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Elevación de pierna recta',
        description: 'Eleva la pierna estirada para fortalecer el core y los flexores de cadera.',
        category: 'cadera',
        imageUrl: '/images/ejercicio-elevacion-pierna.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Estiramiento de banda iliotibial',
        description: 'Estiramiento lateral del muslo y la cadera para reducir la tensión de la banda iliotibial.',
        category: 'cadera',
        imageUrl: '/images/ejercicio-estiramiento-banda-iliotibial.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Movilidad de tobillo',
        description: 'Dibuja el abecedario con el pie para mejorar la movilidad del tobillo.',
        category: 'tobillo',
        imageUrl: '/images/ejercicio-movilidad-tobillo.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Rotación de tobillo',
        description: 'Círculos controlados con el tobillo en ambos sentidos.',
        category: 'tobillo',
        imageUrl: '/images/ejercicio-rotacion-tobillo.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Gato-vaca',
        description: 'A cuatro patas, alterna arquear y hundir la columna para mejorar la movilidad.',
        category: 'columna',
        imageUrl: '/images/ejercicio-gato-vaca.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Postura toracolumbar',
        description: 'Movilización de la columna toracolumbar para aliviar tensión y mejorar la postura.',
        category: 'columna',
        imageUrl: '/images/ejercicio-postura-toracolumbar.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Plancha abdominal',
        description: 'Mantén el cuerpo alineado apoyado en antebrazos para fortalecer el core.',
        category: 'core',
        imageUrl: '/images/ejercicio-plancha-abdominal.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Bird-dog',
        description: 'A cuatro patas, extiende brazo y pierna contrarios manteniendo el core estable.',
        category: 'core',
        imageUrl: '/images/ejercicio-bird-dog.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Respiración diafragmática',
        description: 'Respira hinchando el abdomen para activar el diafragma y relajar.',
        category: 'respiratoria',
        imageUrl: '/images/ejercicio-respiracion-diafragmentaria.png',
        videoUrl: null,
        active: true,
      },
      {
        title: 'Relajación mandibular',
        description: 'Automasaje y movilidad suave de la mandíbula para aliviar la tensión de la ATM.',
        category: 'atm',
        imageUrl: '/images/ejercicio-relajacion-mandibula.png',
        videoUrl: null,
        active: true,
      },
    ])
    .returning();

  // Bonos
  console.log('🎫 Creando bonos...');
  const [bon1] = await db
    .insert(vouchers)
    .values([
      {
        patientId: pat1.id,
        type: '5',
        sessionsRemaining: 3,
        expirationDate: new Date('2026-12-31'),
        purchaseDate: new Date('2026-06-01'),
        notes: 'Bono 5 sesiones comprado en junio',
        demo: true,
      },
      {
        patientId: pat2.id,
        type: '10',
        sessionsRemaining: 8,
        expirationDate: new Date('2027-06-01'),
        purchaseDate: new Date('2026-05-15'),
        notes: 'Bono 10 sesiones',
        demo: true,
      },
    ])
    .returning();

  // Reservas (varios estados y fechas)
  console.log('📋 Creando reservas...');
  const now = new Date('2026-06-12T10:00:00');

  const [book1, book2, book3, book4, book5, book6, book7] = await db
    .insert(bookings)
    .values([
      {
        patientId: pat1.id,
        professionalId: prof1.id,
        serviceId: serv1.id,
        start: new Date(now.getTime() + 2 * 60 * 60 * 1000), // +2 horas
        end: new Date(now.getTime() + 2 * 60 * 60 * 1000 + 45 * 60 * 1000),
        status: 'confirmed',
        cancellationToken: randomUUID(),
        voucherId: bon1.id,
        demo: true,
      },
      {
        patientId: pat2.id,
        professionalId: prof2.id,
        serviceId: serv2.id,
        start: new Date(now.getTime() + 24 * 60 * 60 * 1000), // +24 horas
        end: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: 'pending',
        cancellationToken: randomUUID(),
        demo: true,
      },
      {
        patientId: pat3.id,
        professionalId: prof1.id,
        serviceId: serv4.id,
        start: new Date(now.getTime() - 24 * 60 * 60 * 1000), // -24 horas
        end: new Date(now.getTime() - 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        status: 'completed',
        cancellationToken: randomUUID(),
        demo: true,
      },
      {
        patientId: pat1.id,
        professionalId: prof2.id,
        serviceId: serv3.id,
        start: new Date(now.getTime() - 48 * 60 * 60 * 1000), // -48 horas
        end: new Date(now.getTime() - 48 * 60 * 60 * 1000 + 45 * 60 * 1000),
        status: 'completed',
        cancellationToken: randomUUID(),
        voucherId: bon1.id,
        demo: true,
      },
      {
        patientId: pat2.id,
        professionalId: prof1.id,
        serviceId: serv2.id,
        start: new Date(now.getTime() - 72 * 60 * 60 * 1000), // -72 horas
        end: new Date(now.getTime() - 72 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: 'no_show',
        cancellationToken: randomUUID(),
        demo: true,
      },
      {
        patientId: pat3.id,
        professionalId: prof2.id,
        serviceId: serv1.id,
        start: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // +5 días
        end: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        status: 'confirmed',
        cancellationToken: randomUUID(),
        demo: true,
      },
      {
        patientId: pat1.id,
        professionalId: prof1.id,
        serviceId: serv2.id,
        start: new Date(now.getTime() - 96 * 60 * 60 * 1000), // -96 horas
        end: new Date(now.getTime() - 96 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: 'cancelled',
        cancellationToken: randomUUID(),
        voucherId: bon1.id,
        demo: true,
      },
    ])
    .returning();

  // Notas de tratamiento (para sesiones completadas)
  console.log('📝 Creando notas de tratamiento...');
  await db.insert(treatmentNotes).values([
    {
      patientId: pat3.id,
      bookingId: book3.id,
      professionalId: prof1.id,
      notes:
        'Motivo: Dolor cervical subagudo por trabajo oficina.\nHallazgos: Restricción rotación derecha, puntos gatillo en trapecio superior.\nTratamiento: Masaje transversal + movilización + calor.\nPlan: 3 sesiones más + pauta de ejercicios.',
    },
    {
      patientId: pat1.id,
      bookingId: book4.id,
      professionalId: prof2.id,
      notes:
        'Motivo: Revisión suelo pélvico posparto 6 meses.\nHallazgos: Tono muscular mejorado, todavía algo débil.\nTratamiento: Contracciones graduadas + biofeedback.\nPlan: Continuar pauta casa, revisión en 3 semanas.',
    },
  ]);

  // Asignación de ejercicios (pautas)
  console.log('🏋️ Creando pautas de ejercicios...');
  await db.insert(patientExercises).values([
    {
      patientId: pat3.id,
      exerciseId: ex1.id,
      professionalId: prof1.id,
      series: 3,
      repetitions: '20 segundos',
      frequency: '3x al día',
      observations: 'Muy suave, sin forzar',
      token: randomUUID(),
      active: true,
    },
    {
      patientId: pat3.id,
      exerciseId: ex13.id,
      professionalId: prof1.id,
      series: 2,
      repetitions: '30 segundos',
      frequency: '2x al día',
      observations: 'Mantén buena postura',
      token: randomUUID(),
      active: true,
    },
    {
      patientId: pat1.id,
      exerciseId: ex10.id,
      professionalId: prof2.id,
      series: 3,
      repetitions: '5-10 segundos',
      frequency: '4x al día',
      observations: 'Progresiva: aumenta 2 segundos cada semana',
      token: randomUUID(),
      active: true,
    },
  ]);

  // Emails programados (para recordatorios)
  console.log('📧 Creando emails programados...');
  await db.insert(scheduledEmails).values([
    {
      bookingId: book2.id,
      type: 'reminder_24h',
      scheduledFor: new Date(now.getTime() + 24 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000), // 24h antes
      sent: false,
    },
    {
      bookingId: book6.id,
      type: 'reminder_24h',
      scheduledFor: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000), // 24h antes
      sent: false,
    },
  ]);

  console.log('✅ Semilla completada con éxito!');
  console.log('');
  console.log('📊 Resumen:');
  console.log(`   - Profesionales: 2`);
  console.log(`   - Servicios: 7`);
  console.log(`   - Pacientes: 3`);
  console.log(`   - Ejercicios: 20`);
  console.log(`   - Bonos: 2`);
  console.log(`   - Reservas: 7`);
  console.log(`   - Pautas: 3 pacientes`);
  console.log('');
  console.log('🔐 Usuario admin demo:');
  console.log('   Email: admin@ejefisioterapia-demo.com');
  console.log('   Contraseña: admin123');
  console.log('   ⚠️  CAMBIAR CONTRASEÑA EN PRODUCCIÓN');
  console.log('');
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Error en semilla:', error);
  process.exit(1);
});

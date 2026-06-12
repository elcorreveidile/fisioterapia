'use client';

import { useState, Suspense, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

function ReservaContent() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get('service');

  const [step, setStep] = useState<'service' | 'professional' | 'datetime' | 'data' | 'confirm' | 'success'>('service');
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date; professionalId: number } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  // Datos mock para ahora (después vendrán de Server Actions)
  const services = [
    { id: 1, name: 'Fisioterapia General', duration: 45, price: 40, slug: 'fisioterapia-general' },
    { id: 2, name: 'Fisioterapia Deportiva', duration: 60, price: 50, slug: 'fisioterapia-deportiva' },
    { id: 3, name: 'Suelo Pélvico', duration: 45, price: 45, slug: 'suelo-pelvico' },
    { id: 4, name: 'ATM y Bruxismo', duration: 45, price: 40, slug: 'atm-bruxismo' },
    { id: 5, name: 'Fisioterapia Respiratoria', duration: 45, price: 40, slug: 'fisioterapia-respiratoria' },
    { id: 6, name: 'Masaje de Descarga', duration: 30, price: 30, slug: 'masaje-descarga' },
    { id: 7, name: 'Valoración Inicial', duration: 60, price: 45, slug: 'valoracion-inicial' },
  ];

  const professionals = [
    { id: 1, name: 'Carlos Molina García', bio: 'Especialista en fisioterapia deportiva' },
    { id: 2, name: 'Laura Fernández Ruiz', bio: 'Experta en suelo pélvico y respiratoria' },
  ];

  // Mock slots (después se calcularán con Server Actions)
  const mockSlots = [
    { start: addDays(new Date(), 1), end: addDays(new Date(), 1), professionalId: 1 },
    { start: addDays(new Date(), 1), end: addDays(new Date(), 1), professionalId: 2 },
    { start: addDays(new Date(), 2), end: addDays(new Date(), 2), professionalId: 1 },
    { start: addDays(new Date(), 2), end: addDays(new Date(), 2), professionalId: 2 },
  ];

  const handleServiceSelect = (serviceId: number) => {
    setSelectedService(serviceId);
    setStep('professional');
  };

  const handleProfessionalSelect = (profId: number) => {
    setSelectedProfessional(profId);
    setStep('datetime');
  };

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
    setStep('data');
  };

  const handleDataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setError('');
    startTransition(async () => {
      try {
        // Aquí se llamaría al Server Action para crear la reserva
        // await createBooking({ ... });
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
        setStep('success');
      } catch (err: any) {
        setError(err.message || 'Error al crear la reserva');
      }
    });
  };

  const Button = ({ children, onClick, disabled = false, className = '', variant = 'primary' }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || isPending}
      className={`${className} ${
        variant === 'primary'
          ? 'bg-petrol text-sand px-6 py-3 rounded hover:bg-petrol-dark transition-colors font-medium'
          : 'text-petrol hover:text-amber transition-colors'
      } disabled:opacity-50 relative`}
    >
      {isPending && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      <span className={isPending ? 'opacity-0' : ''}>{children}</span>
    </button>
  );

  if (step === 'success') {
    return (
      <div className="flex flex-col">
        <nav className="bg-petrol text-sand py-4 px-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">│</span>
              <span className="font-serif text-xl font-semibold">Eje Fisioterapia</span>
            </Link>
          </div>
        </nav>

        <section className="min-h-[60vh] flex items-center justify-center bg-sand py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white p-12 rounded border-2 border-petrol">
              <div className="w-20 h-20 bg-amber/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-serif text-petrol mb-4">¡Reserva confirmada!</h1>
              <p className="text-ink-light mb-8">
                Hemos enviado un email con los detalles de tu cita.
              </p>
              <div className="bg-sand p-6 rounded mb-8">
                <p className="font-medium text-petrol mb-2">Próximos pasos:</p>
                <ul className="text-sm text-ink-light space-y-1">
                  <li>✓ Revisa tu email para ver los detalles</li>
                  <li>✓ Recibirás un recordatorio 24h antes</li>
                  <li>✓ Puedes cancelar desde el enlace del email</li>
                </ul>
              </div>
              <Link
                href="/"
                className="inline-block bg-petrol text-sand px-8 py-4 rounded hover:bg-petrol-dark transition-colors font-medium"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

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
      <section className="bg-sand py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-petrol mb-4">Reserva tu cita</h1>
          <p className="text-ink-light">
            Sigue los pasos para reservar tu cita en menos de 90 segundos.
          </p>
        </div>
      </section>

      {/* Progreso */}
      <section className="bg-white py-6 px-6 border-b border-petrol/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            {['Servicio', 'Profesional', 'Fecha y hora', 'Tus datos', 'Confirmar'].map((label, i) => {
              const steps = ['service', 'professional', 'datetime', 'data', 'confirm', 'success'] as const;
              const currentStep = steps.indexOf(step);
              const stepNumber = i + 1;
              const isCompleted = i < currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isCompleted ? 'bg-petrol text-sand' : isCurrent ? 'bg-petrol text-sand' : 'bg-sand text-ink-light'
                  }`}>
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                  <span className={`hidden md:block transition-colors ${isCompleted || isCurrent ? 'text-petrol' : 'text-ink-light'}`}>
                    {label}
                  </span>
                  {i < 4 && <div className={`w-8 h-0.5 transition-colors ${i < currentStep ? 'bg-petrol' : 'bg-sand'}`}></div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-20 px-6 bg-sand">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {step === 'service' && (
            <div>
              <h2 className="text-petrol mb-8">Elige el servicio que necesitas</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className="bg-white p-6 rounded border-2 border-petrol/20 hover:border-petrol transition-colors text-left"
                  >
                    <h3 className="font-serif text-xl mb-2">{service.name}</h3>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-amber">{service.duration} minutos</span>
                      <span className="text-petrol font-semibold">{service.price}€</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'professional' && (
            <div>
              <h2 className="text-petrol mb-8">Elige tu fisioterapeuta</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {professionals.map((prof) => (
                  <button
                    key={prof.id}
                    onClick={() => handleProfessionalSelect(prof.id)}
                    className="bg-white p-6 rounded border-2 border-petrol/20 hover:border-petrol transition-colors text-left"
                  >
                    <h3 className="font-serif text-xl mb-2">{prof.name}</h3>
                    <p className="text-sm text-ink-light">{prof.bio}</p>
                  </button>
                ))}
                <button
                  onClick={() => handleProfessionalSelect(0)}
                  className="bg-white p-6 rounded border-2 border-petrol/20 hover:border-petrol transition-colors text-center"
                >
                  <h3 className="font-serif text-xl mb-2">El primero disponible</h3>
                  <p className="text-sm text-ink-light">Me da igual el fisio, quiero el hueco más pronto</p>
                </button>
              </div>
              <Button onClick={() => setStep('service')} variant="secondary" className="mt-8">
                ← Volver a servicios
              </Button>
            </div>
          )}

          {step === 'datetime' && (
            <div>
              <h2 className="text-petrol mb-8">Elige fecha y hora</h2>
              <div className="space-y-4">
                {mockSlots.map((slot, i) => {
                  const prof = professionals.find(p => p.id === slot.professionalId);
                  return (
                    <button
                      key={i}
                      onClick={() => handleSlotSelect(slot)}
                      className="w-full bg-white p-6 rounded border-2 border-petrol/20 hover:border-petrol transition-colors text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-petrol">
                            {format(slot.start, "EEEE, d 'de' MMMM", { locale: es })}
                          </p>
                          <p className="text-ink-light">
                            {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-petrol">{prof?.name}</p>
                          <p className="text-sm text-amber">Disponible</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <Button onClick={() => setStep('professional')} variant="secondary" className="mt-8">
                ← Volver a profesionales
              </Button>
            </div>
          )}

          {step === 'data' && (
            <div>
              <h2 className="text-petrol mb-8">Tus datos</h2>
              <form onSubmit={handleDataSubmit} className="max-w-md space-y-6">
                <div>
                  <label className="block text-sm font-medium text-petrol mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded border border-petrol/20 focus:border-petrol focus:outline-none transition-colors"
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-petrol mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded border border-petrol/20 focus:border-petrol focus:outline-none transition-colors"
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-petrol mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded border border-petrol/20 focus:border-petrol focus:outline-none transition-colors"
                    disabled={isPending}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Continuar
                </Button>
                <Button onClick={() => setStep('datetime')} variant="secondary" className="w-full">
                  ← Volver a fecha y hora
                </Button>
              </form>
            </div>
          )}

          {step === 'confirm' && (
            <div>
              <h2 className="text-petrol mb-8">Confirma tu reserva</h2>
              <div className="bg-white p-8 rounded border-2 border-petrol/20 mb-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-ink-light">Servicio</p>
                    <p className="font-medium text-petrol">
                      {services.find(s => s.id === selectedService)?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-ink-light">Profesional</p>
                    <p className="font-medium text-petrol">
                      {selectedProfessional === 0
                        ? 'El primero disponible'
                        : professionals.find(p => p.id === selectedProfessional)?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-ink-light">Fecha y hora</p>
                    <p className="font-medium text-petrol">
                      {selectedSlot && format(selectedSlot.start, "EEEE, d 'de' MMMM 'de' yyyy', 'HH:mm'", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-ink-light">Precio</p>
                    <p className="font-medium text-petrol">
                      {services.find(s => s.id === selectedService)?.price}€
                    </p>
                  </div>
                  <div className="pt-4 border-t border-petrol/20">
                    <p className="text-sm text-ink-light">Tus datos</p>
                    <p className="font-medium text-petrol">{formData.name}</p>
                    <p className="text-sm text-ink-light">{formData.email}</p>
                    <p className="text-sm text-ink-light">{formData.phone}</p>
                  </div>
                </div>
              </div>
              <Button onClick={handleConfirm} className="w-full text-lg">
                Confirmar reserva
              </Button>
              <Button onClick={() => setStep('data')} variant="secondary" className="w-full mt-4">
                ← Volver a tus datos
              </Button>
            </div>
          )}
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

export default function ReservaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-petrol border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-petrol">Cargando...</p>
        </div>
      </div>
    }>
      <ReservaContent />
    </Suspense>
  );
}

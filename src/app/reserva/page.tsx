'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

function ReservaContent() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get('service');

  const [step, setStep] = useState<'service' | 'professional' | 'datetime' | 'data' | 'confirm'>('service');
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date; professionalId: number } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

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
    // Aquí se llamará al Server Action para crear la reserva
    alert('Funcionalidad en desarrollo. Pronto podrás reservar de verdad.');
  };

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
              const steps = ['service', 'professional', 'datetime', 'data', 'confirm'] as const;
              const currentStep = steps.indexOf(step);
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i <= currentStep ? 'bg-petrol text-sand' : 'bg-sand text-ink-light'
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`hidden md:block ${i <= currentStep ? 'text-petrol' : 'text-ink-light'}`}>
                    {label}
                  </span>
                  {i < 4 && <div className={`w-8 h-0.5 ${i < currentStep ? 'bg-petrol' : 'bg-sand'}`}></div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-20 px-6 bg-sand">
        <div className="max-w-4xl mx-auto">
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
              <button
                onClick={() => setStep('service')}
                className="mt-8 text-petrol hover:text-amber transition-colors"
              >
                ← Volver a servicios
              </button>
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
              <button
                onClick={() => setStep('professional')}
                className="mt-8 text-petrol hover:text-amber transition-colors"
              >
                ← Volver a profesionales
              </button>
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
                    className="w-full px-4 py-3 rounded border border-petrol/20 focus:border-petrol focus:outline-none"
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
                    className="w-full px-4 py-3 rounded border border-petrol/20 focus:border-petrol focus:outline-none"
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
                    className="w-full px-4 py-3 rounded border border-petrol/20 focus:border-petrol focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-petrol text-sand px-6 py-3 rounded hover:bg-petrol-dark transition-colors font-medium"
                >
                  Continuar
                </button>
                <button
                  type="button"
                  onClick={() => setStep('datetime')}
                  className="w-full text-petrol hover:text-amber transition-colors"
                >
                  ← Volver a fecha y hora
                </button>
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
              <button
                onClick={handleConfirm}
                className="w-full bg-petrol text-sand px-6 py-4 rounded hover:bg-petrol-dark transition-colors font-medium text-lg"
              >
                Confirmar reserva
              </button>
              <button
                onClick={() => setStep('data')}
                className="w-full mt-4 text-petrol hover:text-amber transition-colors"
              >
                ← Volver a tus datos
              </button>
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <ReservaContent />
    </Suspense>
  );
}

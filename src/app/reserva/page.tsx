'use client';

import { useState, useEffect, useCallback, Suspense, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  getServices,
  getProfessionals,
  getAvailableSlots,
  createBooking,
} from '@/app/actions/bookings';
import type { AvailableSlot } from '@/app/actions/booking-types';
import SiteNav from '@/components/SiteNav';

type Service = { id: number; name: string; duration: number; price: number };
type Professional = { id: number; name: string; surname: string; bio: string | null };

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function ReservaContent() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get('service');

  const [step, setStep] = useState<'service' | 'professional' | 'datetime' | 'data' | 'confirm' | 'success'>('service');
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(tomorrow());
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [formData, setFormData] = useState({
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || '',
    phone: searchParams.get('phone') || '',
  });
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  // Cargar servicios y profesionales reales
  useEffect(() => {
    (async () => {
      try {
        const [svcs, pros] = await Promise.all([getServices(), getProfessionals()]);
        setServices(svcs.map((s) => ({ id: s.id, name: s.name, duration: s.duration, price: Math.round(s.price / 100) })));
        setProfessionals(pros);
        if (preselectedService) {
          const match = svcs.find((s) => s.category === preselectedService || s.name === preselectedService);
          // (el slug viene por nombre de categoría; si no casa, se ignora)
          if (match) {
            setSelectedService(match.id);
            setStep('professional');
          }
        }
      } catch {
        setError('No se pudieron cargar los servicios.');
      }
    })();
  }, [preselectedService]);

  const loadSlots = useCallback(
    async (date: string, serviceId: number, professionalId: number | null) => {
      setLoadingSlots(true);
      setSlots([]);
      try {
        const result = await getAvailableSlots(
          serviceId,
          new Date(date + 'T12:00:00'),
          professionalId && professionalId !== 0 ? professionalId : undefined
        );
        setSlots(result);
      } catch {
        setError('No se pudieron cargar los huecos disponibles.');
      } finally {
        setLoadingSlots(false);
      }
    },
    []
  );

  const handleServiceSelect = (serviceId: number) => {
    setSelectedService(serviceId);
    setStep('professional');
  };

  const handleProfessionalSelect = (profId: number) => {
    setSelectedProfessional(profId);
    setStep('datetime');
    if (selectedService) loadSlots(selectedDate, selectedService, profId);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (selectedService) loadSlots(date, selectedService, selectedProfessional);
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setStep('data');
  };

  const handleDataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setError('');
    if (!selectedService || !selectedSlot) return;
    startTransition(async () => {
      try {
        await createBooking({
          serviceId: selectedService,
          professionalId: selectedSlot.professionalId,
          start: selectedSlot.start,
          patientName: formData.name,
          patientEmail: formData.email,
          patientPhone: formData.phone,
        });
        setStep('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear la reserva');
      }
    });
  };

  const Button = ({ children, onClick, type, className = '', variant = 'primary' }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit';
    className?: string;
    variant?: 'primary' | 'secondary';
  }) => (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={isPending}
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
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </span>
      )}
      <span className={isPending ? 'opacity-0' : ''}>{children}</span>
    </button>
  );

  const selectedServiceObj = services.find((s) => s.id === selectedService);

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
        <section className="min-h-[60vh] flex items-center justify-center hero-surface py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white p-12 rounded border-2 border-petrol">
              <div className="w-20 h-20 bg-amber/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-serif text-petrol mb-4">¡Reserva recibida!</h1>
              <p className="text-ink-light mb-8">Te hemos enviado un email con los detalles de tu cita.</p>
              <div className="bg-sand p-6 rounded mb-8 text-left inline-block">
                <p className="font-medium text-petrol mb-2">Próximos pasos:</p>
                <ul className="text-sm text-ink-light space-y-1">
                  <li>✓ Revisa tu email para ver los detalles</li>
                  <li>✓ Recibirás un recordatorio 24h antes</li>
                  <li>✓ Consulta tus citas en tu área de paciente</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/mi-cuenta" className="inline-block bg-petrol text-sand px-8 py-4 rounded hover:bg-petrol-dark transition-colors font-medium">
                  Ir a mi área
                </Link>
                <Link href="/" className="inline-block border-2 border-petrol text-petrol px-8 py-4 rounded hover:bg-petrol hover:text-sand transition-colors font-medium">
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <SiteNav active="/reserva" />

      <section className="bg-sand py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-petrol mb-4">Reserva tu cita</h1>
          <p className="text-ink-light">Sigue los pasos para reservar tu cita.</p>
        </div>
      </section>

      <section className="bg-white py-6 px-6 border-b border-petrol/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            {['Servicio', 'Profesional', 'Fecha y hora', 'Tus datos', 'Confirmar'].map((label, i) => {
              const steps = ['service', 'professional', 'datetime', 'data', 'confirm', 'success'] as const;
              const currentStep = steps.indexOf(step);
              const isCompleted = i < currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isCompleted || isCurrent ? 'bg-petrol text-sand' : 'bg-sand text-ink-light'
                  }`}>
                    {isCompleted ? '✓' : i + 1}
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

      <section className="py-16 px-6 bg-sand">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
          )}

          {step === 'service' && (
            <div>
              <h2 className="text-petrol mb-8">Elige el servicio que necesitas</h2>
              {services.length === 0 ? (
                <p className="text-ink-light">Cargando servicios…</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <button key={service.id} onClick={() => handleServiceSelect(service.id)}
                      className="bg-white p-6 rounded border-2 border-petrol/20 hover:border-petrol transition-colors text-left">
                      <h3 className="font-serif text-xl mb-2">{service.name}</h3>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-amber">{service.duration} minutos</span>
                        <span className="text-petrol font-semibold">{service.price}€</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'professional' && (
            <div>
              <h2 className="text-petrol mb-8">Elige tu fisioterapeuta</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {professionals.map((prof) => (
                  <button key={prof.id} onClick={() => handleProfessionalSelect(prof.id)}
                    className="bg-white p-6 rounded border-2 border-petrol/20 hover:border-petrol transition-colors text-left">
                    <h3 className="font-serif text-xl mb-2">{prof.name} {prof.surname}</h3>
                    {prof.bio && <p className="text-sm text-ink-light">{prof.bio}</p>}
                  </button>
                ))}
                <button onClick={() => handleProfessionalSelect(0)}
                  className="bg-white p-6 rounded border-2 border-petrol/20 hover:border-petrol transition-colors text-center">
                  <h3 className="font-serif text-xl mb-2">El primero disponible</h3>
                  <p className="text-sm text-ink-light">Me da igual el fisio, quiero el hueco más pronto</p>
                </button>
              </div>
              <Button onClick={() => setStep('service')} variant="secondary" className="mt-8">← Volver a servicios</Button>
            </div>
          )}

          {step === 'datetime' && (
            <div>
              <h2 className="text-petrol mb-6">Elige fecha y hora</h2>
              <div className="bg-white p-4 rounded border border-petrol/20 mb-6 inline-block">
                <label className="block text-sm font-medium text-petrol mb-1">Fecha</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="px-4 py-2 rounded border border-petrol/20"
                />
              </div>

              {loadingSlots ? (
                <p className="text-ink-light">Buscando huecos disponibles…</p>
              ) : slots.length === 0 ? (
                <div className="bg-white p-8 rounded border-2 border-petrol/20 text-center text-ink-light">
                  No hay huecos disponibles ese día. Prueba con otra fecha.
                </div>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot, i) => (
                    <button key={i} onClick={() => handleSlotSelect(slot)}
                      className="w-full bg-white p-5 rounded border-2 border-petrol/20 hover:border-petrol transition-colors text-left">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-petrol">{format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}</p>
                          <p className="text-sm text-ink-light">{format(slot.start, "EEEE d 'de' MMMM", { locale: es })}</p>
                        </div>
                        <p className="text-sm text-petrol font-medium">{slot.professional.name} {slot.professional.surname}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <Button onClick={() => setStep('professional')} variant="secondary" className="mt-8">← Volver a profesionales</Button>
            </div>
          )}

          {step === 'data' && (
            <div>
              <h2 className="text-petrol mb-8">Tus datos</h2>
              <form onSubmit={handleDataSubmit} className="max-w-md space-y-6">
                <div>
                  <label className="block text-sm font-medium text-petrol mb-2">Nombre completo</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded border border-petrol/20 focus:border-petrol focus:outline-none transition-colors" disabled={isPending} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-petrol mb-2">Email</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded border border-petrol/20 focus:border-petrol focus:outline-none transition-colors" disabled={isPending} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-petrol mb-2">Teléfono</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded border border-petrol/20 focus:border-petrol focus:outline-none transition-colors" disabled={isPending} />
                </div>
                <Button type="submit" className="w-full">Continuar</Button>
                <Button onClick={() => setStep('datetime')} variant="secondary" className="w-full">← Volver a fecha y hora</Button>
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
                    <p className="font-medium text-petrol">{selectedServiceObj?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-ink-light">Profesional</p>
                    <p className="font-medium text-petrol">{selectedSlot ? `${selectedSlot.professional.name} ${selectedSlot.professional.surname}` : ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-ink-light">Fecha y hora</p>
                    <p className="font-medium text-petrol">
                      {selectedSlot && format(selectedSlot.start, "EEEE, d 'de' MMMM 'de' yyyy', 'HH:mm'", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-ink-light">Precio</p>
                    <p className="font-medium text-petrol">{selectedServiceObj?.price}€</p>
                  </div>
                  <div className="pt-4 border-t border-petrol/20">
                    <p className="text-sm text-ink-light">Tus datos</p>
                    <p className="font-medium text-petrol">{formData.name}</p>
                    <p className="text-sm text-ink-light">{formData.email}</p>
                    <p className="text-sm text-ink-light">{formData.phone}</p>
                  </div>
                </div>
              </div>
              <Button onClick={handleConfirm} className="w-full text-lg">Confirmar reserva</Button>
              <Button onClick={() => setStep('data')} variant="secondary" className="w-full mt-4">← Volver a tus datos</Button>
            </div>
          )}
        </div>
      </section>

      <footer className="bg-petrol surface-texture-light text-sand py-12 px-6">
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

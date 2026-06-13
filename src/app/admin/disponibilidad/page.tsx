'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Professional {
  id: number;
  name: string;
  surname: string;
}

interface AvailabilityRule {
  id: number;
  professionalId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface BlockedSlot {
  id: number;
  professionalId: number;
  start: Date;
  end: Date;
  reason: string | null;
}

const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function DisponibilidadPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AvailabilityRule | null>(null);
  const [ruleForm, setRuleForm] = useState({
    professionalId: 0,
    dayOfWeek: 0,
    startTime: '09:00',
    endTime: '14:00',
  });
  const [slotForm, setSlotForm] = useState({
    professionalId: 0,
    start: '',
    end: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch professionals
      const profsResponse = await fetch('/api/admin/professionals');
      if (profsResponse.ok) {
        const profsData = await profsResponse.json();
        setProfessionals(profsData);
        if (profsData.length > 0 && !selectedProfessional) {
          setSelectedProfessional(profsData[0].id);
        }
      }

      // Fetch rules
      const rulesResponse = await fetch('/api/admin/availability');
      if (rulesResponse.ok) {
        const rulesData = await rulesResponse.json();
        setRules(rulesData);
      }

      // Fetch blocked slots
      const slotsResponse = await fetch(`/api/admin/blocked-slots?professionalId=${selectedProfessional || ''}`);
      if (slotsResponse.ok) {
        const slotsData = await slotsResponse.json();
        setBlockedSlots(slotsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRule ? `/api/admin/availability/${editingRule.id}` : '/api/admin/availability';
      const method = editingRule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleForm),
      });

      if (response.ok) {
        await fetchData();
        setShowRuleModal(false);
        setEditingRule(null);
        setRuleForm({
          professionalId: selectedProfessional || 0,
          dayOfWeek: 0,
          startTime: '09:00',
          endTime: '14:00',
        });
      }
    } catch (error) {
      console.error('Error saving rule:', error);
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm('¿Eliminar este horario?')) return;

    try {
      const response = await fetch(`/api/admin/availability/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const handleEditRule = (rule: AvailabilityRule) => {
    setEditingRule(rule);
    setRuleForm({
      professionalId: rule.professionalId,
      dayOfWeek: rule.dayOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
    });
    setShowRuleModal(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/blocked-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...slotForm,
          start: new Date(slotForm.start).toISOString(),
          end: new Date(slotForm.end).toISOString(),
        }),
      });

      if (response.ok) {
        await fetchData();
        setShowSlotModal(false);
        setSlotForm({
          professionalId: selectedProfessional || 0,
          start: '',
          end: '',
          reason: '',
        });
      }
    } catch (error) {
      console.error('Error saving slot:', error);
    }
  };

  const handleDeleteSlot = async (id: number) => {
    if (!confirm('¿Eliminar este bloqueo?')) return;

    try {
      const response = await fetch(`/api/admin/blocked-slots/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  const rulesByProfessional = rules.reduce((acc, rule) => {
    if (!acc[rule.professionalId]) {
      acc[rule.professionalId] = [];
    }
    acc[rule.professionalId].push(rule);
    return acc;
  }, {} as Record<number, AvailabilityRule[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <div className="text-ink-light">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-petrol text-sand py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl">Eje Fisioterapia</span>
            <span className="text-sm opacity-70">· Disponibilidad</span>
          </div>
          <a href="/admin" className="text-sm hover:text-amber transition-colors">
            ← Volver al dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif text-petrol">Configuración de Disponibilidad</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingRule(null);
                setRuleForm({
                  professionalId: selectedProfessional || 0,
                  dayOfWeek: 0,
                  startTime: '09:00',
                  endTime: '14:00',
                });
                setShowRuleModal(true);
              }}
              className="px-6 py-3 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors font-medium"
            >
              + Añadir horario
            </button>
            <button
              onClick={() => {
                setSlotForm({
                  professionalId: selectedProfessional || 0,
                  start: '',
                  end: '',
                  reason: '',
                });
                setShowSlotModal(true);
              }}
              className="px-6 py-3 bg-amber text-petrol rounded hover:bg-amber-dark transition-colors font-medium"
            >
              + Bloquear hueco
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reglas de disponibilidad */}
          <div className="space-y-6">
            <h2 className="text-xl font-serif text-petrol">Horarios semanales</h2>

            {professionals.map((professional) => {
              const professionalRules = rulesByProfessional[professional.id] || [];

              return (
                <div key={professional.id} className="bg-white p-6 rounded border-2 border-petrol/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-petrol">{professional.name} {professional.surname}</h3>
                  </div>

                  {professionalRules.length === 0 ? (
                    <p className="text-sm text-ink-light">Sin horarios configurados</p>
                  ) : (
                    <div className="space-y-2">
                      {professionalRules.map((rule) => (
                        <div key={rule.id} className="flex items-center justify-between p-2 bg-sand rounded">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-petrol w-24">
                              {dayNames[rule.dayOfWeek]}
                            </span>
                            <span className="text-sm text-ink-light">
                              {rule.startTime} - {rule.endTime}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditRule(rule)}
                              className="text-xs text-petrol hover:text-amber"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Huecos bloqueados */}
          <div className="space-y-6">
            <h2 className="text-xl font-serif text-petrol">Huecos bloqueados</h2>

            <div className="bg-white p-6 rounded border-2 border-petrol/20">
              <div className="mb-4">
                <label className="block text-sm font-medium text-petrol mb-2">
                  Filtrar por profesional
                </label>
                <select
                  value={selectedProfessional || ''}
                  onChange={(e) => setSelectedProfessional(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-petrol/20 rounded"
                >
                  {professionals.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.name} {prof.surname}
                    </option>
                  ))}
                </select>
              </div>

              {blockedSlots.length === 0 ? (
                <p className="text-sm text-ink-light">No hay huecos bloqueados</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {blockedSlots.map((slot) => (
                    <div key={slot.id} className="p-3 bg-sand rounded">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-petrol">
                          {format(new Date(slot.start), 'd MMM', { locale: es })}
                        </div>
                        <div className="text-sm text-ink-light">
                          {format(new Date(slot.start), 'HH:mm')} - {format(new Date(slot.end), 'HH:mm')}
                        </div>
                      </div>
                      {slot.reason && (
                        <div className="text-sm text-ink-light mt-1">
                          Motivo: {slot.reason}
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal para regla */}
        {showRuleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-serif text-petrol mb-4">
                {editingRule ? 'Editar horario' : 'Nuevo horario'}
              </h2>

              <form onSubmit={handleSaveRule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-petrol mb-2">
                    Profesional
                  </label>
                  <select
                    value={ruleForm.professionalId}
                    onChange={(e) => setRuleForm({ ...ruleForm, professionalId: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded border border-petrol/20"
                    required
                  >
                    {professionals.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.name} {prof.surname}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-petrol mb-2">
                    Día de la semana
                  </label>
                  <select
                    value={ruleForm.dayOfWeek}
                    onChange={(e) => setRuleForm({ ...ruleForm, dayOfWeek: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded border border-petrol/20"
                    required
                  >
                    {dayNames.map((name, index) => (
                      <option key={index} value={index}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-petrol mb-2">
                      Hora inicio
                    </label>
                    <input
                      type="time"
                      value={ruleForm.startTime}
                      onChange={(e) => setRuleForm({ ...ruleForm, startTime: e.target.value })}
                      className="w-full px-4 py-2 rounded border border-petrol/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-petrol mb-2">
                      Hora fin
                    </label>
                    <input
                      type="time"
                      value={ruleForm.endTime}
                      onChange={(e) => setRuleForm({ ...ruleForm, endTime: e.target.value })}
                      className="w-full px-4 py-2 rounded border border-petrol/20"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors"
                  >
                    {editingRule ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRuleModal(false);
                      setEditingRule(null);
                    }}
                    className="px-4 py-2 bg-sand text-petrol rounded hover:bg-sand-warm transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para bloquear hueco */}
        {showSlotModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-serif text-petrol mb-4">
                Bloquear hueco
              </h2>

              <form onSubmit={handleSaveSlot} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-petrol mb-2">
                    Profesional
                  </label>
                  <select
                    value={slotForm.professionalId}
                    onChange={(e) => setSlotForm({ ...slotForm, professionalId: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded border border-petrol/20"
                    required
                  >
                    {professionals.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.name} {prof.surname}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-petrol mb-2">
                      Fecha y hora inicio
                    </label>
                    <input
                      type="datetime-local"
                      value={slotForm.start}
                      onChange={(e) => setSlotForm({ ...slotForm, start: e.target.value })}
                      className="w-full px-4 py-2 rounded border border-petrol/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-petrol mb-2">
                      Fecha y hora fin
                    </label>
                    <input
                      type="datetime-local"
                      value={slotForm.end}
                      onChange={(e) => setSlotForm({ ...slotForm, end: e.target.value })}
                      className="w-full px-4 py-2 rounded border border-petrol/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-petrol mb-2">
                    Motivo (opcional)
                  </label>
                  <input
                    type="text"
                    value={slotForm.reason}
                    onChange={(e) => setSlotForm({ ...slotForm, reason: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-petrol/20"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors"
                  >
                    Bloquear
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSlotModal(false)}
                    className="px-4 py-2 bg-sand text-petrol rounded hover:bg-sand-warm transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Información */}
        <div className="mt-6 bg-amber/10 p-6 rounded border-2 border-amber">
          <h3 className="font-semibold text-petrol mb-2">💡 Información sobre disponibilidad</h3>
          <div className="text-sm text-ink-light space-y-1">
            <p>• Los horarios semanales definen cuándo está disponible cada profesional</p>
            <p>• Los huecos bloqueados tienen prioridad sobre los horarios semanales</p>
            <p>• Los pacientes solo pueden reservar en horarios disponibles y no bloqueados</p>
            <p>• Los bloques se usan para vacaciones, días concretos, o ausencias temporales</p>
          </div>
        </div>
      </main>
    </div>
  );
}

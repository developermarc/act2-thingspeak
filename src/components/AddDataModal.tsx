import { useState, useEffect, useRef } from 'react';
import { Plus, X, Loader2, CheckCircle2 } from 'lucide-react';
import thingSpeakApi, { type ActivityData } from '../services/thingSpeakApi';

interface AddDataModalProps {
  onSuccess?: () => void;
}

interface FieldConfig {
  key: keyof ActivityData;
  label: string;        // Label corta para el grid
  ariaLabel: string;    // Label completa para accesibilidad
  unit: string;
  defaultValue: number;
}

const FIELDS: FieldConfig[] = [
  { key: 'cargaCognitiva',     label: 'Carga Cog.',   ariaLabel: 'Carga Cognitiva',      unit: '%',  defaultValue: 50  },
  { key: 'nivelCoherencia',    label: 'Coherencia',   ariaLabel: 'Nivel de Coherencia',  unit: '/100', defaultValue: 50  },
  { key: 'intensidadEmocional',label: 'Int. Emoc.',   ariaLabel: 'Intensidad Emocional', unit: '/100', defaultValue: 50  },
  { key: 'latenciaInferencia', label: 'Latencia',     ariaLabel: 'Latencia de Inferencia', unit: 'ms', defaultValue: 120 },
];

const DEFAULT_FORM: ActivityData = {
  cargaCognitiva: 50,
  nivelCoherencia: 50,
  intensidadEmocional: 50,
  latenciaInferencia: 120,
  consumoEnergetico: 45,
};

export function AddDataModal({ onSuccess }: AddDataModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ActivityData>(DEFAULT_FORM);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus trap y cierre con Escape
  useEffect(() => {
    if (!isOpen) return;

    // Focus al primer input al abrir
    const timer = setTimeout(() => firstInputRef.current?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setShowSuccess(false);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await thingSpeakApi.writeChannelFeed(formData);
      setShowSuccess(true);
      onSuccess?.();
      setTimeout(close, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al enviar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Añadir nuevo registro de datos"
        aria-haspopup="dialog"
        className="
          fixed bottom-8 right-8 z-40
          p-4 rounded-full
          bg-primary/80 backdrop-blur-md text-white
          shadow-lg shadow-primary/30
          border border-white/20
          hover:scale-105 hover:bg-primary
          transition-all duration-300
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30
        "
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} aria-hidden="true" />
      </button>

      {/* Overlay + Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          role="presentation"
        >
          {/*
            ── LIQUID GLASS MODAL ──────────────────────────────────────────
            Luz de arriba-derecha → highlight blanco en borde superior/izquierdo,
            sombra de color en borde inferior/derecho.
            Gradiente: más sólido arriba (white/70) → más transparente abajo (white/40).
            Backdrop blur para que se vea lo de atrás pero sin perder legibilidad.
          */}
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="
              relative w-full max-w-md
              rounded-3xl overflow-hidden
              animate-in zoom-in-95 duration-200
            "
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.60) 100%)',
              backdropFilter: 'blur(32px) saturate(1.8) brightness(1.06)',
              WebkitBackdropFilter: 'blur(32px) saturate(1.8) brightness(1.06)',
              borderTop: '1px solid rgba(255,255,255,0.85)',
              borderLeft: '1px solid rgba(255,255,255,0.60)',
              borderRight: '1px solid rgba(0,152,205,0.18)',
              borderBottom: '1px solid rgba(0,152,205,0.22)',
              boxShadow: `
                inset 0 1.5px 0 rgba(255,255,255,0.90),
                inset 0 -1px 0 rgba(0,152,205,0.10),
                0 24px 60px rgba(0,0,0,0.18),
                0 4px 16px rgba(0,0,0,0.10)
              `,
            }}
          >
            {/* Capa de refracción interna (gradiente diagonal) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 45%, rgba(0,152,205,0.04) 100%)',
              }}
            />

            {/* Contenido — posición relativa para estar sobre la capa de refracción */}
            <div className="relative z-10 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2
                  id="modal-title"
                  className="text-xl font-bold tracking-tight text-foreground"
                >
                  Nuevo Registro
                </h2>
                <button
                  onClick={close}
                  aria-label="Cerrar formulario"
                  className="
                    p-2 rounded-full
                    text-muted-foreground hover:text-foreground
                    hover:bg-black/8
                    transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
                  "
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {showSuccess ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex flex-col items-center justify-center py-10 gap-4 text-emerald-600"
                >
                  <CheckCircle2 className="w-16 h-16 animate-bounce" aria-hidden="true" />
                  <p className="text-lg font-semibold text-foreground">¡Datos enviados con éxito!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

                  {/* Grid 2 cols — labels cortas para no romper el layout */}
                  <fieldset className="contents">
                    <legend className="sr-only">Métricas de actividad</legend>
                    <div className="grid grid-cols-2 gap-3">
                      {FIELDS.map((field, idx) => (
                        <div key={field.key} className="flex flex-col gap-1">
                          <label
                            htmlFor={`field-${field.key}`}
                            className="text-xs font-semibold text-foreground/75 uppercase tracking-wider"
                          >
                            <span aria-hidden="true">{field.label}</span>
                            <span className="sr-only">{field.ariaLabel}</span>
                            {field.unit && (
                              <span className="ml-1 text-muted-foreground/60 normal-case tracking-normal font-normal" aria-hidden="true">
                                ({field.unit})
                              </span>
                            )}
                          </label>
                          <input
                            ref={idx === 0 ? firstInputRef : undefined}
                            id={`field-${field.key}`}
                            type="number"
                            name={field.key}
                            value={formData[field.key] as number}
                            onChange={handleChange}
                            aria-label={`${field.ariaLabel} en ${field.unit}`}
                            className="
                              w-full
                              bg-white dark:bg-black/60
                              border border-black/15 dark:border-white/15
                              rounded-xl px-3 py-2
                              text-sm font-medium text-foreground
                              placeholder-muted-foreground
                              focus:outline-none focus:ring-2 focus:ring-primary/50
                              focus:border-primary/50
                              transition-all
                            "
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </fieldset>

                  {/* Consumo energético — full width */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="field-consumoEnergetico"
                      className="text-xs font-semibold text-foreground/75 uppercase tracking-wider"
                    >
                      Consumo Energético
                      <span className="ml-1 text-muted-foreground/60 normal-case tracking-normal font-normal">(W)</span>
                    </label>
                    <input
                      id="field-consumoEnergetico"
                      type="number"
                      name="consumoEnergetico"
                      value={formData.consumoEnergetico}
                      onChange={handleChange}
                      aria-label="Consumo Energético en vatios"
                      className="
                        w-full
                        bg-white dark:bg-black/60
                        border border-black/15 dark:border-white/15
                        rounded-xl px-3 py-2
                        text-sm font-medium text-foreground
                        focus:outline-none focus:ring-2 focus:ring-primary/50
                        focus:border-primary/50
                        transition-all
                      "
                      required
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div
                      role="alert"
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm font-medium"
                    >
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="
                      mt-2 w-full
                      bg-primary hover:bg-primary/90
                      text-white font-semibold
                      py-3 rounded-xl
                      shadow-lg shadow-primary/25
                      transition-all duration-200
                      disabled:opacity-70 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2
                      focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30
                    "
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      'Añadir Datos a ThingSpeak'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
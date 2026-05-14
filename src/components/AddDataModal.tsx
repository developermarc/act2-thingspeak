import { useState } from 'react';
import { Plus, X, Loader2, CheckCircle2 } from 'lucide-react';
import thingSpeakApi, { type ActivityData } from '../services/thingSpeakApi';

interface AddDataModalProps {
  onSuccess?: () => void;
}

export function AddDataModal({ onSuccess }: AddDataModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ActivityData>({
    cargaCognitiva: 50,
    nivelCoherencia: 50,
    intensidadEmocional: 50,
    latenciaInferencia: 120,
    consumoEnergetico: 45,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await thingSpeakApi.writeChannelFeed(formData);
      setShowSuccess(true);
      if (onSuccess) onSuccess();
      
      // Close modal after showing success message for a bit
      setTimeout(() => {
        setIsOpen(false);
        setShowSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al enviar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (Glass effect) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 p-4 rounded-full bg-primary/80 backdrop-blur-md text-white shadow-lg shadow-primary/30 border border-white/20 hover:scale-105 hover:bg-primary transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/30"
        title="Añadir nuevo registro"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card dark:bg-black/90 border border-border shadow-2xl rounded-3xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold tracking-tight mb-6">Nuevo Registro</h2>

            {showSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4 text-emerald-500">
                <CheckCircle2 className="w-16 h-16 animate-bounce" />
                <p className="text-lg font-medium text-foreground">¡Datos enviados con éxito!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Carga Cognitiva (%)</label>
                    <input
                      type="number"
                      name="cargaCognitiva"
                      value={formData.cargaCognitiva}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nivel Coherencia</label>
                    <input
                      type="number"
                      name="nivelCoherencia"
                      value={formData.nivelCoherencia}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Intensidad Emocional</label>
                    <input
                      type="number"
                      name="intensidadEmocional"
                      value={formData.intensidadEmocional}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Latencia (ms)</label>
                    <input
                      type="number"
                      name="latenciaInferencia"
                      value={formData.latenciaInferencia}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Consumo Energético (W)</label>
                  <input
                    type="number"
                    name="consumoEnergetico"
                    value={formData.consumoEnergetico}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 w-full bg-primary text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Añadir Datos a ThingSpeak'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

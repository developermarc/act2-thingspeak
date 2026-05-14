import { useState, useRef, useEffect } from 'react';
import { type LucideIcon, Info, X } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value?: number | string | null;
  unit?: string;
  icon: LucideIcon;
  colorClass?: string;
  description?: string;
}

export function MetricCard({
  title,
  value,
  unit = '',
  icon: Icon,
  colorClass = 'text-primary',
  description,
}: MetricCardProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!tooltipOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setTooltipOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [tooltipOpen]);

  return (
    <div
      className="
        bg-gradient-to-br from-white/90 to-white/30
        dark:from-black/60 dark:to-black/20
        backdrop-blur-xl
        border border-white/50 dark:border-white/10
        shadow-md shadow-inner
        rounded-2xl
        p-3 sm:p-4
        flex flex-col justify-center gap-2 sm:gap-3
        transition-all
        hover:from-white/100 hover:to-white/40
        dark:hover:from-black/70 dark:hover:to-black/30
        relative overflow-visible
        min-w-0
      "
    >
      {/* Botón info */}
      {description && (
        <div className="absolute top-2 right-2 z-30">
          <button
            ref={buttonRef}
            onClick={() => setTooltipOpen((prev) => !prev)}
            aria-label={`Más información sobre ${title}`}
            aria-expanded={tooltipOpen}
            aria-haspopup="dialog"
            className="
              p-1 rounded-full
              text-muted-foreground/40 hover:text-foreground/80
              hover:bg-muted/50 transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
            "
          >
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
          </button>

          {tooltipOpen && (
            <div
              ref={tooltipRef}
              role="dialog"
              aria-label={`Información: ${title}`}
              className="
                absolute right-0 top-full mt-2
                w-48 sm:w-52
                p-3
                bg-white/90 dark:bg-black/90
                backdrop-blur-xl
                border border-white/40 dark:border-white/10
                shadow-xl rounded-xl
                z-50
                animate-in fade-in zoom-in-95 duration-150
              "
            >
              <button
                onClick={() => setTooltipOpen(false)}
                aria-label="Cerrar información"
                className="absolute top-2 right-2 p-0.5 rounded-full text-muted-foreground/50 hover:text-foreground/80 transition-colors"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
              <p className="text-xs text-foreground/80 leading-relaxed font-medium pr-4">
                {description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* En móvil: icono encima, título debajo (flex-col) → el título tiene
          todo el ancho disponible y nunca se recorta.
          En sm+: vuelven a estar en fila (flex-row).                         */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 pr-5">
        <div
          className={`p-2 bg-muted rounded-xl shrink-0 self-start sm:self-auto ${colorClass}`}
          aria-hidden="true"
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
        </div>
        {/* min-w-0 para que el flex child pueda encogerse;
            break-words para que palabras largas partan si hace falta */}
        <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground leading-tight min-w-0 break-words">
          {title}
        </h3>
      </div>

      {/* Valor */}
      <div
        className="flex items-baseline gap-1"
        aria-label={`${title}: ${value ?? 'sin datos'} ${unit}`}
      >
        <span className="text-2xl sm:text-3xl font-bold tracking-tight">
          {value !== undefined && value !== null ? value : '--'}
        </span>
        <span className="text-xs sm:text-sm font-medium text-muted-foreground" aria-hidden="true">
          {unit}
        </span>
      </div>
    </div>
  );
}
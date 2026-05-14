import { type LucideIcon, Info } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value?: number | string | null;
  unit?: string;
  icon: LucideIcon;
  colorClass?: string;
  description?: string;
}

export function MetricCard({ title, value, unit = '', icon: Icon, colorClass = 'text-primary', description }: MetricCardProps) {
  return (
    <div className="bg-gradient-to-br from-white/90 to-white/30 dark:from-black/60 dark:to-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-md shadow-[0_4px_24px_0_rgba(0,0,0,0.05)] shadow-inner rounded-2xl p-5 flex flex-col justify-center gap-3 transition-all hover:from-white/100 hover:to-white/40 dark:hover:from-black/70 dark:hover:to-black/30 relative">
      
      {description && (
        <div className="absolute top-4 right-4 z-10">
          <div className="peer p-1 rounded-full text-muted-foreground/30 hover:text-foreground/80 hover:bg-muted/50 transition-colors cursor-help">
            <Info className="w-4 h-4" />
          </div>
          <div className="absolute right-0 top-full mt-2 w-48 p-3 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-xl rounded-xl opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-200 pointer-events-none z-20">
            <p className="text-xs text-foreground/80 leading-relaxed font-medium">
              {description}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className={`p-3 bg-muted rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6" strokeWidth={2} />
        </div>
        <h3 className="text-sm font-semibold text-muted-foreground leading-tight">{title}</h3>
      </div>

      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-3xl font-bold tracking-tight">
          {value !== undefined && value !== null ? value : '--'}
        </span>
        <span className="text-sm font-medium text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

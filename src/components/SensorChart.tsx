import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Info } from 'lucide-react';

interface SensorChartProps {
  title: string;
  data: any[];
  dataKey: string;
  color?: string;
  unit?: string;
  description?: string;
}

export function SensorChart({ title, data, dataKey, color = "var(--color-primary)", unit = "", description }: SensorChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gradient-to-br from-white/90 to-white/40 dark:from-black/70 dark:to-black/30 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-lg shadow-inner rounded-xl p-3 flex flex-col gap-1">
          <p className="text-xs font-semibold text-muted-foreground">
            {label ? new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold" style={{ color: payload[0].color }}>
              {payload[0].value}
            </span>
            <span className="text-xs font-medium text-muted-foreground">{unit}</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
            {title}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white/90 to-white/30 dark:from-black/60 dark:to-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-md shadow-[0_4px_24px_0_rgba(0,0,0,0.05)] shadow-inner rounded-2xl p-6 flex flex-col gap-4 h-full transition-all hover:from-white/100 hover:to-white/40 dark:hover:from-black/70 dark:hover:to-black/30 relative">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground/90">{title}</h3>
        {/* Botón Info con Tooltip CSS */}
        {description && (
          <div className="relative z-20">
            <div className="peer p-1 rounded-full text-muted-foreground/40 hover:text-foreground/80 hover:bg-muted/50 transition-colors cursor-help">
              <Info className="w-4 h-4" />
            </div>
            <div className="absolute right-0 top-full mt-2 w-56 p-3 bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-xl rounded-xl opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-200 pointer-events-none">
              <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                {description}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 w-full min-h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.6} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="createdAt" 
              tickFormatter={(val) => {
                if (!val) return '';
                const date = new Date(val);
                return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
              }}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}${unit}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#color-${dataKey})`} 
              activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { Brain, Activity, HeartPulse, Zap, Battery, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import thingSpeakApi, { type MappedActivityData } from './services/thingSpeakApi';
import { MetricCard } from './components/MetricCard';
import { SensorChart } from './components/SensorChart';
import { AddDataModal } from './components/AddDataModal';

const App = () => {
  const [data, setData] = useState<MappedActivityData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [pageOffset, setPageOffset] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
 
  const fetchData = useCallback(async () => {
    try {
      const response = await thingSpeakApi.readChannelFeed(100);
      const mappedData = thingSpeakApi.mapFeedsToActivityData(response);
      const cleanData = mappedData.filter(d => d.cargaCognitiva !== null);
      setData(cleanData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, []);
 
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);
 
  const startIndex = Math.max(0, data.length - (pageOffset + 1) * itemsPerPage);
  const endIndex = data.length - pageOffset * itemsPerPage;
  const visibleData = data.slice(startIndex, endIndex);
 
  const canGoBack = startIndex > 0;
  const canGoForward = pageOffset > 0;
 
  const latest = visibleData.length > 0 ? visibleData[visibleData.length - 1] : null;
 
  const wattsData = visibleData.map(d => d.consumoEnergetico).filter(v => v !== null) as number[];
  const maxWatts = wattsData.length > 0 ? Math.max(...wattsData) : 100;
  const avgWatts = wattsData.length > 0 ? Math.round(wattsData.reduce((a, b) => a + b, 0) / wattsData.length) : 0;
 
  const radius = 60;
  const circumference = Math.PI * radius;
  const percentage = maxWatts > 0 ? (avgWatts / maxWatts) : 0;
  const strokeDashoffset = circumference - (percentage * circumference);
 
  return (
    <div className="content">
      <AddDataModal onSuccess={() => { setPageOffset(0); fetchData(); }} />
      <header className="flex flex-col mx-8 lg:mx-20 mt-4 mb-2 gap-1">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
          NeuroBotics
        </h1>
        <h2 className="text-xs md:text-sm font-semibold text-muted-foreground tracking-widest uppercase">
          Actividad 2 Grupal: Grupo 10
        </h2>
      </header>
 
      {/* Top Section: 2 Columns */}
      <section className="grid grid-cols-1 lg:grid-cols-4 mx-8 lg:mx-20 gap-5 mt-6 lg:h-[45vh]">
 
        {/* Col 1: Imagen con Tarjeta de Consumo
            FIX MOBILE: altura fija en móvil para que la imagen sea visible */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-lg border border-border h-[280px] sm:h-[320px] lg:h-full relative group bg-black">
          <img
            src="robot-welcome.webp"
            alt="Robot de bienvenida."
            className="w-full h-full object-cover object-center lg:object-left opacity-90"
          />
          <div className="absolute inset-0 bg-primary/20 mix-blend-overlay pointer-events-none" />
 
          {/* FIX MOBILE: card de consumo más pequeña en móvil, se posiciona abajo-izquierda
              en móvil para no tapar el robot, y vuelve al centro-izquierda en desktop */}
          <div className="absolute inset-0 flex items-end lg:items-center justify-start p-4 lg:pl-16">
            <div className="
              px-5 py-4 lg:px-8 lg:py-6
              flex flex-col items-center justify-center text-center gap-1
              transform group-hover:scale-105 transition-transform duration-300
              bg-primary/10 backdrop-blur-xl border border-white/30
              shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] shadow-inner rounded-3xl
              w-[180px] sm:w-[200px] lg:min-w-[240px]
            ">
              <div className="flex flex-col items-center gap-1 mb-1 lg:mb-2">
                <div className="p-1.5 lg:p-2 bg-primary/20 rounded-xl text-white shadow-inner border border-white/20">
                  <Battery className="w-4 h-4 lg:w-6 lg:h-6 drop-shadow-md" strokeWidth={2.5} />
                </div>
                <h2 className="text-[9px] lg:text-[10px] font-bold text-white/90 uppercase tracking-widest drop-shadow-sm">
                  Consumo Energético
                </h2>
              </div>
 
              {/* Arc Gauge — más pequeño en móvil */}
              <div className="relative flex flex-col items-center justify-center w-full px-2">
                <svg viewBox="0 0 140 80" className="w-full h-auto drop-shadow-md max-w-[120px] lg:max-w-full">
                  <path
                    d="M 10 70 A 60 60 0 0 1 130 70"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 70 A 60 60 0 0 1 130 70"
                    fill="none"
                    stroke="currentColor"
                    className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-1000 ease-out"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="absolute bottom-0 flex flex-col items-center justify-end pb-1">
                  <span className="text-2xl lg:text-4xl font-black text-white tracking-tighter drop-shadow-md leading-none">
                    {avgWatts}
                  </span>
                  <span className="text-white/80 text-[9px] lg:text-[10px] font-bold uppercase tracking-wider mt-1 drop-shadow-sm">
                    W Promedio
                  </span>
                </div>
              </div>
 
              <div className="flex justify-between w-full px-2 lg:px-4 mt-1 lg:mt-2">
                <span className="text-white/50 text-[9px] lg:text-[10px] font-bold tracking-wider">0W</span>
                <span className="text-white/50 text-[9px] lg:text-[10px] font-bold tracking-wider">MÁX: {maxWatts}W</span>
              </div>
            </div>
          </div>
        </div>
 
        {/* Col 2: Actualización + 2 Gráficas */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {pageOffset === 0 ? (
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              ) : (
                <span className="relative flex h-3 w-3 shrink-0 bg-muted-foreground rounded-full" />
              )}
              <span className="text-xs font-semibold text-muted-foreground truncate">
                {pageOffset === 0 ? `En vivo: ${lastUpdate.toLocaleTimeString()}` : 'Modo Histórico'}
              </span>
            </div>
 
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2 py-1 shadow-sm hover:bg-muted/50 transition-colors">
                <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <select
                  className="bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer appearance-none pr-1"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setPageOffset(0);
                  }}
                  title="Filtrar cantidad de datos"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
 
              <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-0.5 shadow-sm">
                <button
                  onClick={() => setPageOffset(prev => prev + 1)}
                  disabled={!canGoBack}
                  className="p-1 rounded-md text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Ir al pasado"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPageOffset(prev => prev - 1)}
                  disabled={!canGoForward}
                  className="p-1 rounded-md text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Ir al futuro"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
 
          <div className="flex-1 min-h-0">
            <SensorChart
              title="Carga Cognitiva (%)"
              data={visibleData}
              dataKey="cargaCognitiva"
              color="var(--color-primary)"
              unit="%"
              description="Evolución del nivel de procesamiento de la CPU/red neuronal de la IA a lo largo del tiempo."
            />
          </div>
          <div className="flex-1 min-h-0">
            <SensorChart
              title="Nivel Coherencia"
              data={visibleData}
              dataKey="nivelCoherencia"
              color="var(--color-primary)"
              description="Tendencia de la estabilidad lógica y congruencia de las respuestas generadas por la IA."
            />
          </div>
        </div>
      </section>
 
      {/* Bottom Section */}
      <section className="mx-8 lg:mx-20 mt-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
 
          {/* FIX METRICCARD: el grid interno usa items-stretch y cada card
              tiene overflow-hidden para que nada se salga */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4 items-stretch">
            <MetricCard
              title="Carga Cognitiva"
              value={latest?.cargaCognitiva}
              unit="%"
              icon={Brain}
              colorClass="text-primary"
              description="Nivel de uso de la red neuronal de la IA. Altos valores indican la resolución de problemas lógicos densos."
            />
            <MetricCard
              title="Nivel Coherencia"
              value={latest?.nivelCoherencia}
              unit="/100"
              icon={Activity}
              colorClass="text-primary"
              description="Estabilidad lógica de la IA. Una caída indica posibles alucinaciones o conflictos en sus parámetros."
            />
            <MetricCard
              title="Intens. Emocional"
              value={latest?.intensidadEmocional}
              unit="/100"
              icon={HeartPulse}
              colorClass="text-red-500"
              description="Fuerza de la simulación emocional. Valores extremos podrían alterar la toma de decisiones racionales."
            />
            <MetricCard
              title="Latencia Infer."
              value={latest?.latenciaInferencia}
              unit="ms"
              icon={Zap}
              colorClass="text-emerald-500"
              description="Tiempo de respuesta a estímulos. Valores bajos son vitales para mantener reflejos rápidos e interacciones fluidas."
            />
          </div>
 
          <div className="lg:col-span-1 h-[250px] lg:h-full">
            <SensorChart
              title="Intens. Emocional"
              data={visibleData}
              dataKey="intensidadEmocional"
              color="var(--color-red-500)"
              description="Fluctuación de los parámetros de simulación emocional del androide en base a los estímulos recibidos."
            />
          </div>
 
          <div className="lg:col-span-1 h-[250px] lg:h-full">
            <SensorChart
              title="Latencia Inferencia"
              data={visibleData}
              dataKey="latenciaInferencia"
              color="var(--color-emerald-500)"
              unit="ms"
              description="Tiempo de latencia en el procesamiento de respuestas (a menor valor, más rápido reacciona la IA)."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;

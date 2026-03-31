import { useState, useMemo } from 'react';
import { useCRM } from './CRMProvider';
import { formatCurrency, DEAL_STAGES, Deal } from '@/lib/types';
import { TrendingUp, Handshake, Users, Building2, ExternalLink, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const STAGE_COLORS: Record<string, string> = {
  'Réponse positive': '#3b82f6',
  'Audit en cours': '#8b5cf6',
  'Visio/Closing': '#f59e0b',
  'Signé': '#22c55e',
  'Perdu': '#ef4444',
};

export default function DashboardView() {
  const { deals, clients, setViewMode } = useCRM();

  const activeDeals = deals.filter(d => d.stage !== 'Signé' && d.stage !== 'Perdu');
  const signedDeals = deals.filter(d => d.stage === 'Signé');
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const mrrSigned = signedDeals.reduce((sum, d) => sum + d.mrr, 0);
  const mrrPipeline = activeDeals.reduce((sum, d) => sum + d.mrr, 0);
  const conversionRate = deals.length > 0 ? Math.round((signedDeals.length / deals.length) * 100) : 0;

  const [hoveredDeal, setHoveredDeal] = useState<Deal | null>(null);

  const points = useMemo(() => {
    return activeDeals.map((deal, i) => {
      const angle = (i * 137.5) * (Math.PI / 180);
      const normalizedValue = Math.min(Math.max(deal.value / 50000, 0.1), 1);
      const radius = 280 - (normalizedValue * 180);

      const x = 300 + Math.cos(angle) * radius;
      const y = 300 + Math.sin(angle) * radius;

      return { ...deal, x, y, radius };
    });
  }, [activeDeals]);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-6 relative px-2 sm:px-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 z-10 relative mt-4">
        <GlassStat label="Pipeline Actif" value={formatCurrency(pipelineValue)} icon={TrendingUp} />
        <GlassStat label="MRR Signé" value={formatCurrency(mrrSigned)} icon={DollarSign} color="green" />
        <GlassStat label="MRR Pipeline" value={formatCurrency(mrrPipeline)} icon={DollarSign} color="blue" />
        <GlassStat label="Deals Actifs" value={String(activeDeals.length)} icon={Handshake} />
        <GlassStat label="Clients" value={String(clients.length)} icon={Building2} />
        <GlassStat label="Taux de Conv." value={`${conversionRate}%`} icon={Users} />
      </div>

      {/* Main Radial Graph Area */}
      <div className="flex-1 glass-panel rounded-2xl relative overflow-hidden flex items-center justify-center min-h-[400px]">
        <div className="absolute inset-0 dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_10%,transparent_100%)]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="absolute top-6 left-6 z-10">
          <h2 className="text-xl sm:text-2xl font-light tracking-wide text-slate-800 dark:text-white">Deal Proximity Map</h2>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">Analyse de la proximité de closing</p>
        </div>

        {/* SVG Radial Graph */}
        <svg viewBox="0 0 600 600" className="w-full h-full max-w-[700px] max-h-[700px] drop-shadow-2xl relative z-10">
          {[100, 150, 200, 250, 300].map(r => (
            <circle key={r} cx="300" cy="300" r={r} fill="none" className="stroke-slate-200 dark:stroke-white/5" strokeWidth="1.5" strokeDasharray="4 6" />
          ))}

          <circle cx="300" cy="300" r={65} className="fill-white/80 dark:fill-black/60 stroke-slate-200 dark:stroke-white/10 backdrop-blur-xl" strokeWidth="1" />
          <text x="300" y="295" textAnchor="middle" fontSize="48" fontWeight="300" className="font-sans tracking-tighter fill-slate-800 dark:fill-white">{activeDeals.length}</text>
          <text x="300" y="325" textAnchor="middle" fontSize="12" fontWeight="400" className="uppercase tracking-widest fill-slate-500 dark:fill-white/50">Active Deals</text>

          {points.map(deal => {
            const color = STAGE_COLORS[deal.stage] || '#fff';
            const isHovered = hoveredDeal?.id === deal.id;
            return (
              <g key={deal.id}
                className="cursor-pointer transition-all duration-300 origin-center"
                onMouseEnter={() => setHoveredDeal(deal)}
                onMouseLeave={() => setHoveredDeal(null)}
                style={{ transform: isHovered ? 'scale(1.5)' : 'scale(1)', transformOrigin: `${deal.x}px ${deal.y}px` }}
              >
                <circle cx={deal.x} cy={deal.y} r={12} fill={color} opacity="0.15" />
                <circle
                  cx={deal.x}
                  cy={deal.y}
                  r={isHovered ? 6 : 5}
                  fill={color}
                  stroke={isHovered ? 'currentColor' : 'rgba(0,0,0,0.2)'}
                  className="dark:stroke-[rgba(0,0,0,0.5)]"
                  strokeWidth="1.5"
                  style={{ filter: isHovered ? `drop-shadow(0 0 8px ${color})` : 'none' }}
                />
              </g>
            );
          })}
        </svg>

        {hoveredDeal && (
          <div className="absolute top-1/2 left-1/2 ml-4 -mt-24 pointer-events-none z-50">
            <div className="glass-panel w-72 rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] border-slate-200 dark:border-white/20 bg-white/80 dark:bg-black/60 text-left">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-5 line-clamp-1">{hoveredDeal.name}</h3>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-white/40">Valeur</span>
                  <span className="font-medium text-slate-800 dark:text-white">{formatCurrency(hoveredDeal.value)}</span>
                </div>
                {hoveredDeal.mrr > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-white/40">MRR</span>
                    <span className="font-medium text-green-600">{formatCurrency(hoveredDeal.mrr)}/mois</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-white/40">Stage</span>
                  <span className="font-medium flex items-center gap-1.5" style={{ color: STAGE_COLORS[hoveredDeal.stage] }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'currentColor' }} />
                    {hoveredDeal.stage}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-white/40">Échéance</span>
                  <span className="text-slate-700 dark:text-white/80">{hoveredDeal.expected_close_date ? format(parseISO(hoveredDeal.expected_close_date), 'dd MMM yyyy', { locale: fr }) : 'Non définie'}</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setViewMode('deals')}
                  className="w-full h-8 rounded-lg bg-gradient-to-r from-blue-600/5 to-violet-600/5 dark:from-blue-600/10 dark:to-violet-600/10 border border-blue-500/20 text-[11px] font-medium text-blue-600 dark:text-blue-400 transition-all flex items-center justify-center gap-2 pointer-events-auto hover:bg-blue-500/10 hover:border-blue-500/40"
                >
                  Analyser l'opportunité
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GlassStat({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color?: string }) {
  const colorClass = color === 'green' ? 'text-green-500 dark:text-green-400' : color === 'blue' ? 'text-blue-500 dark:text-blue-400' : 'text-blue-500 dark:text-blue-400';
  const bgClass = color === 'green' ? 'bg-green-500/10 border-green-500/20' : color === 'blue' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-500/10 border-blue-500/20';

  return (
    <div className="glass-panel rounded-xl p-3 flex items-center gap-3 border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/50 dark:hover:bg-white/[0.04] transition-colors">
      <div className={`w-9 h-9 rounded-full ${bgClass} flex items-center justify-center border shrink-0`}>
        <Icon className={`w-4 h-4 ${colorClass}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] text-slate-500 dark:text-white/50 uppercase tracking-widest font-medium mb-0.5 truncate">{label}</p>
        <p className="text-lg font-light text-slate-800 dark:text-white tracking-tight truncate">{value}</p>
      </div>
    </div>
  );
}

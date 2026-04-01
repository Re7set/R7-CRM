import { useState, useMemo } from 'react';
import { useCRM } from './CRMProvider';
import { formatCurrency, DEAL_STAGES, Deal } from '@/lib/types';
import { TrendingUp, Handshake, Users, Building2, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

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
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 z-10 relative mt-4"
      >
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}><GlassStat label="Pipeline Actif" value={formatCurrency(pipelineValue)} icon={TrendingUp} /></motion.div>
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}><GlassStat label="Deals Actifs" value={String(activeDeals.length)} icon={Handshake} /></motion.div>
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}><GlassStat label="Clients" value={String(clients.length)} icon={Building2} /></motion.div>
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}><GlassStat label="Taux de Conv." value={`${conversionRate}%`} icon={Users} /></motion.div>
      </motion.div>

      {/* Main Radial Graph Area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 glass-panel rounded-2xl relative overflow-hidden flex items-center justify-center min-h-[400px] border border-white/10 dark:border-white/5"
      >
        
        {/* Decorative Grid / Glows */}
        <div className="absolute inset-0 dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_10%,transparent_100%)]"></div>
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-[120px] pointer-events-none"
        ></motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute top-8 left-8 z-10"
        >
          <h2 className="text-2xl font-light tracking-wide text-slate-800 dark:text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            Deal Proximity Map
          </h2>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-1 pl-4">Analyse algorithmique de proximité de closing</p>
        </motion.div>

        {/* SVG Radial Graph */}
        <svg viewBox="0 0 600 600" className="w-full h-full max-w-[750px] max-h-[750px] drop-shadow-2xl relative z-10">
          {/* Concentric Circles */}
          {[100, 150, 200, 250, 300].map((r, i) => (
            <motion.circle 
              key={r} cx="300" cy="300" r={r} fill="none" 
              className="stroke-slate-200 dark:stroke-white/5" 
              strokeWidth="1.5" strokeDasharray="4 6" 
              initial={{ r: 0, opacity: 0 }}
              animate={{ r, opacity: 1 }}
              transition={{ delay: i * 0.1 + 0.3, duration: 0.8, type: "spring" }}
            />
          ))}

          {/* Center Text */}
          <motion.g 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, type: "spring", bounce: 0.4 }}
          >
            <circle cx="300" cy="300" r={65} className="fill-white/80 dark:fill-[#0B0C10]/80 stroke-slate-200 dark:stroke-white/10 backdrop-blur-xl shadow-xl" strokeWidth="1" />
            <text x="300" y="295" textAnchor="middle" fontSize="56" fontWeight="200" className="font-sans tracking-tighter fill-slate-800 dark:fill-white">{activeDeals.length}</text>
            <text x="300" y="325" textAnchor="middle" fontSize="11" fontWeight="500" className="uppercase tracking-[0.2em] fill-slate-500 dark:fill-white/50">Active Deals</text>
          </motion.g>

          {/* Points */}
          {points.map((deal, i) => {
            const color = STAGE_COLORS[deal.stage as keyof typeof STAGE_COLORS] || '#fff';
            const isHovered = hoveredDeal?.id === deal.id;
            return (
              <motion.g key={deal.id} 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isHovered ? 1.5 : 1, opacity: 1 }}
                transition={{ delay: i * 0.05 + 0.5, duration: 0.4 }}
                className="cursor-pointer transition-all duration-300 origin-center"
                onMouseEnter={() => setHoveredDeal(deal)}
                onMouseLeave={() => setHoveredDeal(null)}
                style={{ transformOrigin: `${deal.x}px ${deal.y}px` }}
              >
                {/* Outer Glow */}
                <circle cx={deal.x} cy={deal.y} r={14} fill={color} opacity="0.1" />
                {/* Point */}
                <circle
                  cx={deal.x}
                  cy={deal.y}
                  r={isHovered ? 6 : 4.5}
                  fill={color}
                  stroke={isHovered ? 'currentColor' : 'rgba(0,0,0,0.2)'}
                  className="dark:stroke-[rgba(0,0,0,0.5)]"
                  strokeWidth="1.5"
                  style={{ filter: isHovered ? `drop-shadow(0 0 10px ${color})` : 'none' }}
                />
              </motion.g>
            );
          })}
        </svg>

        {/* Hover Tooltip (CyberX Glass Card) */}
        {hoveredDeal && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute top-1/2 left-1/2 ml-6 -mt-32 pointer-events-none z-50"
          >
            <div className="glass-panel w-[300px] rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0A0A10]/90 text-left backdrop-blur-3xl">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-6 line-clamp-1">{hoveredDeal.name}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-white/40 font-light">Niveau d'impact</span>
                  <span className="font-semibold text-slate-800 dark:text-white tracking-tight">{formatCurrency(hoveredDeal.value)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-white/40 font-light">Zone de risque</span>
                  <span className="font-medium flex items-center gap-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5" style={{ color: STAGE_COLORS[hoveredDeal.stage as keyof typeof STAGE_COLORS] }}>
                    <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: 'currentColor' }} />
                    <span className="text-xs">{hoveredDeal.stage}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-white/40 font-light">Echéance cible</span>
                  <span className="text-slate-700 dark:text-white/80 font-medium">{hoveredDeal.expected_close_date ? format(parseISO(hoveredDeal.expected_close_date), 'dd MMM yyyy', { locale: fr }) : 'Non definie'}</span>
                </div>
              </div>
              <div className="mt-8 pt-5 border-t border-slate-200 dark:border-white/10">
                <button 
                  onClick={() => setViewMode('deals')} 
                  className="w-full h-9 rounded-xl bg-blue-600/5 dark:bg-blue-600/10 border border-blue-500/20 text-xs font-semibold text-blue-600 dark:text-blue-400 transition-all flex items-center justify-center gap-2 pointer-events-auto hover:bg-blue-600/10 hover:border-blue-500/40 shadow-sm"
                >
                  Analyser l'opportunité <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function GlassStat({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass-panel rounded-2xl p-5 flex items-center gap-5 border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] hover:bg-white/60 dark:hover:bg-white/[0.06] transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.12)] cursor-default"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 dark:from-blue-500/20 dark:to-violet-500/20 flex items-center justify-center border border-blue-500/20 shrink-0 shadow-inner">
        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
      </div>
      <div>
        <p className="text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-[0.2em] font-semibold mb-1">{label}</p>
        <p className="text-3xl font-light text-slate-800 dark:text-white tracking-tighter">{value}</p>
      </div>
    </motion.div>
  );
}

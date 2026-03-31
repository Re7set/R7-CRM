import { useCRM } from './CRMProvider';
import { DealStage, Deal, Profession, PROFESSIONS, PROFESSION_LABELS, formatCurrency, getStageBadgeClass } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Plus, User } from 'lucide-react';
import React, { useCallback, useState } from 'react';

export default function PipelineView() {
  const { deals, clients, pipelineStages, teamMembers, filterStage, filterProfession, searchQuery, addDeal, updateDeal, setSelectedDeal, setFilterProfession } = useCRM();

  let filtered = deals;
  if (filterStage !== 'all') {
    filtered = filtered.filter(d => d.stage === filterStage);
  }
  if (filterProfession !== 'all') {
    filtered = filtered.filter(d => d.profession === filterProfession);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(d => d.name.toLowerCase().includes(q));
  }

  const visibleStages = pipelineStages.filter(s => s.visible).sort((a, b) => a.position - b.position);

  const handleDrop = useCallback((stage: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('application/deal-id');
    if (id) updateDeal(id, { stage: stage as DealStage });
  }, [updateDeal]);

  const getClientName = (id: string | null) => clients.find(c => c.id === id)?.name || '';
  const getTeamMemberName = (id: string | null) => teamMembers.find(m => m.id === id)?.name || '';

  return (
    <div className="space-y-3">
      {/* Profession filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setFilterProfession('all')}
          className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${filterProfession === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/60'}`}
        >
          Tous
        </button>
        {PROFESSIONS.map(p => (
          <button
            key={p}
            onClick={() => setFilterProfession(filterProfession === p ? 'all' : p)}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${filterProfession === p ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/60'}`}
          >
            {PROFESSION_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin" style={{ minHeight: 'calc(100vh - 240px)' }}>
        {visibleStages.map(stage => {
          const stageDeals = filtered.filter(d => d.stage === stage.name);
          const totalValue = stageDeals.reduce((s, d) => s + d.value, 0);
          const totalMRR = stageDeals.reduce((s, d) => s + d.mrr, 0);

          return (
            <PipelineColumn
              key={stage.id}
              stageName={stage.name}
              color={stage.color}
              deals={stageDeals}
              totalValue={totalValue}
              totalMRR={totalMRR}
              getClientName={getClientName}
              getTeamMemberName={getTeamMemberName}
              onDrop={handleDrop(stage.name)}
              onAdd={async () => {
                const deal = await addDeal({ name: 'Nouveau deal', stage: stage.name as DealStage, value: 0 });
                setSelectedDeal(deal);
              }}
              onSelect={setSelectedDeal}
            />
          );
        })}
      </div>
    </div>
  );
}

function PipelineColumn({
  stageName, color, deals, totalValue, totalMRR, getClientName, getTeamMemberName, onDrop, onAdd, onSelect,
}: {
  stageName: string;
  color: string;
  deals: Deal[];
  totalValue: number;
  totalMRR: number;
  getClientName: (id: string | null) => string;
  getTeamMemberName: (id: string | null) => string;
  onDrop: (e: React.DragEvent) => void;
  onAdd: () => void;
  onSelect: (d: Deal) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`flex-1 min-w-[220px] max-w-[300px] rounded-lg bg-muted/30 flex flex-col transition-all ${dragOver ? 'ring-2 ring-primary/30' : ''}`}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { setDragOver(false); onDrop(e); }}
    >
      <div className="px-3 py-2.5 flex items-center justify-between rounded-t-lg" style={{ backgroundColor: `hsl(${color} / 0.12)` }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${color})` }} />
          <span className="text-xs font-bold uppercase tracking-wide">{stageName}</span>
          <span className="text-[10px] text-muted-foreground font-mono bg-background/80 rounded px-1.5 py-0.5">{deals.length}</span>
        </div>
        <button onClick={onAdd} className="text-muted-foreground hover:text-primary transition-colors w-6 h-6 flex items-center justify-center rounded hover:bg-background/80">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 py-1.5 text-[10px] font-mono text-muted-foreground border-b border-border/20 flex justify-between">
        <span>{formatCurrency(totalValue)}</span>
        {totalMRR > 0 && <span className="text-primary">{formatCurrency(totalMRR)}/m</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1.5">
          {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} clientName={getClientName(deal.client_id)} assignedName={getTeamMemberName(deal.assigned_to)} onClick={() => onSelect(deal)} />
          ))}
          {deals.length === 0 && (
            <div className="text-center text-[11px] text-muted-foreground/40 py-10 font-medium">
              Glisser un deal ici
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DealCard({ deal, clientName, assignedName, onClick }: { deal: Deal; clientName: string; assignedName: string; onClick: () => void }) {
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('application/deal-id', deal.id); e.dataTransfer.effectAllowed = 'move'; }}
      onClick={onClick}
      className="bg-card rounded-lg border border-border/50 p-2.5 cursor-pointer hover:shadow-md hover:border-border transition-all group"
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-xs font-semibold truncate">{deal.name}</span>
        {deal.profession && (
          <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0">
            {PROFESSION_LABELS[deal.profession]}
          </Badge>
        )}
      </div>
      {clientName && (
        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{clientName}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-mono font-bold">{formatCurrency(deal.value)}</span>
        <div className="flex items-center gap-1.5">
          {deal.mrr > 0 && (
            <span className="text-[10px] font-mono text-primary">{formatCurrency(deal.mrr)}/m</span>
          )}
          {deal.probability > 0 && (
            <span className="text-[10px] text-muted-foreground">{deal.probability}%</span>
          )}
        </div>
      </div>
      {(assignedName || deal.onboarding_started_at) && (
        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/30">
          {assignedName && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <User className="w-3 h-3" />{assignedName}
            </span>
          )}
          {deal.stage === 'Signé' && deal.onboarding_started_at && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 border-green-500/30 text-green-600">
              Onboarding
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

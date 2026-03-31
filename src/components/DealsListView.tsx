import { useCRM } from './CRMProvider';
import { DEAL_STAGES, DealStage, getStageBadgeClass, formatCurrency, PROFESSION_LABELS } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Trash2, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';

export default function DealsListView() {
  const { deals, clients, searchQuery, filterStage, updateDeal, deleteDeal, setSelectedDeal } = useCRM();
  const [closedOpen, setClosedOpen] = useState(false);

  let filtered = deals;
  if (filterStage !== 'all') {
    filtered = filtered.filter(d => d.stage === filterStage);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.notes.toLowerCase().includes(q)
    );
  }

  const CLOSED = ['Signé', 'Perdu'];
  const active = filtered.filter(d => !CLOSED.includes(d.stage));
  const closed = filtered.filter(d => CLOSED.includes(d.stage));

  const getClientName = (id: string | null) => clients.find(c => c.id === id)?.name || '—';

  const tableHeader = (
    <TableHeader>
      <TableRow className="bg-muted/30 border-b border-border/40">
        <TableHead className="text-[10px] uppercase tracking-wider font-bold min-w-[180px]">Deal</TableHead>
        <TableHead className="w-[120px] text-[10px] uppercase tracking-wider font-bold">Client</TableHead>
        <TableHead className="w-[100px] text-[10px] uppercase tracking-wider font-bold">Profession</TableHead>
        <TableHead className="w-[80px] text-[10px] uppercase tracking-wider font-bold text-right">Valeur</TableHead>
        <TableHead className="w-[80px] text-[10px] uppercase tracking-wider font-bold text-right">MRR</TableHead>
        <TableHead className="w-[120px] text-[10px] uppercase tracking-wider font-bold">Stage</TableHead>
        <TableHead className="w-[60px] text-[10px] uppercase tracking-wider font-bold text-right">Proba</TableHead>
        <TableHead className="w-[85px] text-[10px] uppercase tracking-wider font-bold">Close</TableHead>
        <TableHead className="w-[40px]"></TableHead>
      </TableRow>
    </TableHeader>
  );

  const renderRow = (deal: typeof deals[0]) => (
    <TableRow key={deal.id} className="group hover:bg-muted/20 transition-colors cursor-pointer border-b border-border/20" onClick={() => setSelectedDeal(deal)}>
      <TableCell className="py-2.5 px-3">
        <span className="text-xs font-semibold">{deal.name}</span>
      </TableCell>
      <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{getClientName(deal.client_id)}</TableCell>
      <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{deal.profession ? PROFESSION_LABELS[deal.profession] : '—'}</TableCell>
      <TableCell className="py-2.5 px-3 text-xs font-mono text-right">{formatCurrency(deal.value)}</TableCell>
      <TableCell className="py-2.5 px-3 text-xs font-mono text-right">{deal.mrr > 0 ? formatCurrency(deal.mrr) : '—'}</TableCell>
      <TableCell className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
        <Select value={deal.stage} onValueChange={(v) => updateDeal(deal.id, { stage: v as DealStage })}>
          <SelectTrigger className="h-6 text-[10px] border-transparent bg-transparent shadow-none px-0">
            <Badge className={`text-[10px] px-1.5 py-0 font-semibold ${getStageBadgeClass(deal.stage)}`}>
              {deal.stage}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            {DEAL_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="py-2.5 px-3 text-xs font-mono text-right">{deal.probability}%</TableCell>
      <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">
        {deal.expected_close_date ? format(parseISO(deal.expected_close_date), 'd MMM', { locale: fr }) : '—'}
      </TableCell>
      <TableCell className="py-2.5 px-1" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => deleteDeal(deal.id)}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded-md hover:bg-destructive/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="px-5 py-3.5 border-b border-border/40 flex items-center gap-2.5">
          <h2 className="text-sm font-bold">Deals actifs</h2>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">{active.length}</span>
        </div>
        <ScrollArea className="max-h-[calc(100vh-380px)]">
          <Table>
            {tableHeader}
            <TableBody>
              {active.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-16 text-sm">Aucun deal actif</TableCell></TableRow>
              ) : active.map(renderRow)}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {closed.length > 0 && (
        <Collapsible open={closedOpen} onOpenChange={setClosedOpen}>
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-[var(--shadow-sm)] opacity-80">
            <CollapsibleTrigger className="w-full px-5 py-3.5 border-b border-border/40 flex items-center gap-2.5 hover:bg-muted/20 transition-colors">
              {closedOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <h2 className="text-sm font-bold text-muted-foreground">Signés / Perdus</h2>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">{closed.length}</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ScrollArea className="max-h-[300px]">
                <Table>
                  {tableHeader}
                  <TableBody>{closed.map(renderRow)}</TableBody>
                </Table>
              </ScrollArea>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}
    </div>
  );
}

import { useCRM } from './CRMProvider';
import { PROFESSION_LABELS, WARM_STATUS_LABELS, getWarmStatusBadgeClass, formatCurrency } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Flame } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function WarmPoolView() {
  const { deals, clients, activities, teamMembers, searchQuery, filterProfession, setSelectedDeal } = useCRM();

  let warmDeals = deals.filter(d => d.warm_status === 'opened' || d.warm_status === 'clicked');

  if (filterProfession !== 'all') {
    warmDeals = warmDeals.filter(d => d.profession === filterProfession);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    warmDeals = warmDeals.filter(d => d.name.toLowerCase().includes(q));
  }

  const getClientName = (id: string | null) => clients.find(c => c.id === id)?.name || '—';
  const getAssignedName = (id: string | null) => teamMembers.find(m => m.id === id)?.name || '—';
  const getLastActivity = (dealId: string) => {
    const act = activities.find(a => a.deal_id === dealId);
    return act ? format(parseISO(act.date), 'd MMM', { locale: fr }) : '—';
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="px-5 py-3.5 border-b border-border/40 flex items-center gap-2.5">
          <Flame className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm font-bold">Warm Pool</h2>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">{warmDeals.length}</span>
          <span className="text-[10px] text-muted-foreground ml-1">Leads ayant ouvert/cliqué sans répondre</span>
        </div>
        <ScrollArea className="max-h-[calc(100vh-280px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b border-border/40">
                <TableHead className="text-[10px] uppercase tracking-wider font-bold min-w-[180px]">Deal</TableHead>
                <TableHead className="w-[120px] text-[10px] uppercase tracking-wider font-bold">Client</TableHead>
                <TableHead className="w-[110px] text-[10px] uppercase tracking-wider font-bold">Profession</TableHead>
                <TableHead className="w-[90px] text-[10px] uppercase tracking-wider font-bold">Statut</TableHead>
                <TableHead className="w-[80px] text-[10px] uppercase tracking-wider font-bold text-right">Valeur</TableHead>
                <TableHead className="w-[90px] text-[10px] uppercase tracking-wider font-bold">Dernière act.</TableHead>
                <TableHead className="w-[90px] text-[10px] uppercase tracking-wider font-bold">Assigné</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warmDeals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-16 text-sm">
                    Aucun lead warm en attente
                  </TableCell>
                </TableRow>
              ) : warmDeals.map(deal => (
                <TableRow
                  key={deal.id}
                  className="group hover:bg-muted/20 transition-colors cursor-pointer border-b border-border/20"
                  onClick={() => setSelectedDeal(deal)}
                >
                  <TableCell className="py-2.5 px-3">
                    <span className="text-xs font-semibold">{deal.name}</span>
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{getClientName(deal.client_id)}</TableCell>
                  <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{deal.profession ? PROFESSION_LABELS[deal.profession] : '—'}</TableCell>
                  <TableCell className="py-2.5 px-3">
                    <Badge className={`text-[10px] ${getWarmStatusBadgeClass(deal.warm_status)}`}>
                      {WARM_STATUS_LABELS[deal.warm_status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-xs font-mono text-right">{formatCurrency(deal.value)}</TableCell>
                  <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{getLastActivity(deal.id)}</TableCell>
                  <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{getAssignedName(deal.assigned_to)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}

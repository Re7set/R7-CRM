import { useCRM } from './CRMProvider';
import { getClientStatusBadgeClass, CLIENT_STATUSES, CLIENT_STATUS_LABELS, ClientStatus, formatCurrency } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';

const statusLabels = CLIENT_STATUS_LABELS;

export default function ClientsListView() {
  const { clients, deals, searchQuery, filterClientStatus, updateClient, deleteClient, setSelectedClient } = useCRM();

  let filtered = clients;
  if (filterClientStatus !== 'all') {
    filtered = filtered.filter(c => c.status === filterClientStatus);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-[var(--shadow-sm)]">
      <div className="px-5 py-3.5 border-b border-border/40 flex items-center gap-2.5">
        <h2 className="text-sm font-bold">Clients</h2>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">{filtered.length}</span>
      </div>
      <ScrollArea className="max-h-[calc(100vh-220px)]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border/40">
              <TableHead className="text-[10px] uppercase tracking-wider font-bold min-w-[180px]">Nom</TableHead>
              <TableHead className="w-[120px] text-[10px] uppercase tracking-wider font-bold">Industrie</TableHead>
              <TableHead className="w-[100px] text-[10px] uppercase tracking-wider font-bold">Statut</TableHead>
              <TableHead className="w-[160px] text-[10px] uppercase tracking-wider font-bold">Email</TableHead>
              <TableHead className="w-[120px] text-[10px] uppercase tracking-wider font-bold">Tel</TableHead>
              <TableHead className="w-[80px] text-[10px] uppercase tracking-wider font-bold text-right">Deals</TableHead>
              <TableHead className="w-[100px] text-[10px] uppercase tracking-wider font-bold text-right">Valeur</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-16 text-sm">
                  Aucun client
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(client => {
                const clientDeals = deals.filter(d => d.client_id === client.id);
                const totalValue = clientDeals.reduce((s, d) => s + d.value, 0);
                return (
                  <TableRow key={client.id} className="group hover:bg-muted/20 transition-colors cursor-pointer border-b border-border/20" onClick={() => setSelectedClient(client)}>
                    <TableCell className="py-2.5 px-3">
                      <span className="text-xs font-semibold">{client.name}</span>
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{client.industry || '—'}</TableCell>
                    <TableCell className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                      <Select value={client.status} onValueChange={(v) => updateClient(client.id, { status: v as ClientStatus })}>
                        <SelectTrigger className="h-6 text-[10px] border-transparent bg-transparent shadow-none px-0">
                          <Badge className={`text-[10px] px-1.5 py-0 font-semibold ${getClientStatusBadgeClass(client.status)}`}>
                            {statusLabels[client.status]}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {CLIENT_STATUSES.map(s => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-muted-foreground truncate">{client.email || '—'}</TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{client.phone || '—'}</TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-right font-mono">{clientDeals.length}</TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-right font-mono">{totalValue > 0 ? formatCurrency(totalValue) : '—'}</TableCell>
                    <TableCell className="py-2.5 px-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded-md hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

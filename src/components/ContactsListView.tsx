import { useCRM } from './CRMProvider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function ContactsListView() {
  const { contacts, clients, searchQuery, deleteContact, setSelectedContact } = useCRM();

  let filtered = contacts;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(c =>
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q)
    );
  }

  const getClientName = (clientId: string | null) => {
    if (!clientId) return '—';
    return clients.find(c => c.id === clientId)?.name || '—';
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-[var(--shadow-sm)]">
      <div className="px-5 py-3.5 border-b border-border/40 flex items-center gap-2.5">
        <h2 className="text-sm font-bold">Contacts</h2>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">{filtered.length}</span>
      </div>
      <ScrollArea className="max-h-[calc(100vh-220px)]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border/40">
              <TableHead className="text-[10px] uppercase tracking-wider font-bold min-w-[180px]">Nom</TableHead>
              <TableHead className="w-[180px] text-[10px] uppercase tracking-wider font-bold">Email</TableHead>
              <TableHead className="w-[120px] text-[10px] uppercase tracking-wider font-bold">Tel</TableHead>
              <TableHead className="w-[130px] text-[10px] uppercase tracking-wider font-bold">Fonction</TableHead>
              <TableHead className="w-[150px] text-[10px] uppercase tracking-wider font-bold">Entreprise</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-16 text-sm">
                  Aucun contact
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(contact => (
                <TableRow key={contact.id} className="group hover:bg-muted/20 transition-colors cursor-pointer border-b border-border/20" onClick={() => setSelectedContact(contact)}>
                  <TableCell className="py-2.5 px-3">
                    <span className="text-xs font-semibold">{contact.first_name} {contact.last_name}</span>
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-xs text-muted-foreground truncate">{contact.email || '—'}</TableCell>
                  <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{contact.phone || '—'}</TableCell>
                  <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{contact.role || '—'}</TableCell>
                  <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{getClientName(contact.client_id)}</TableCell>
                  <TableCell className="py-2.5 px-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => deleteContact(contact.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded-md hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

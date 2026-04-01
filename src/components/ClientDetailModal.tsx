import { useCRM } from './CRMProvider';
import { CLIENT_STATUSES, CLIENT_STATUS_LABELS, ClientStatus, formatCurrency, getClientStatusBadgeClass } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Handshake, Users, Plus } from 'lucide-react';

const statusLabels = CLIENT_STATUS_LABELS;

export default function ClientDetailModal() {
  const { selectedClient, setSelectedClient, updateClient, deleteClient, contacts, deals, addDeal, addContact, setSelectedDeal, setSelectedContact } = useCRM();

  if (!selectedClient) return null;
  const client = selectedClient;
  const clientContacts = contacts.filter(c => c.client_id === client.id);
  const clientDeals = deals.filter(d => d.client_id === client.id);

  const update = (updates: Partial<typeof client>) => updateClient(client.id, updates);

  return (
    <Dialog open={!!selectedClient} onOpenChange={(open) => { if (!open) setSelectedClient(null); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            <Input
              value={client.name}
              onChange={(e) => update({ name: e.target.value })}
              className="text-lg font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0"
            />
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Statut</label>
                <Select value={client.status} onValueChange={(v) => update({ status: v as ClientStatus })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CLIENT_STATUSES.map(s => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Industrie</label>
                <Input value={client.industry} onChange={(e) => update({ industry: e.target.value })} className="h-8 text-xs" placeholder="Industrie" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Email</label>
                <Input value={client.email} onChange={(e) => update({ email: e.target.value })} className="h-8 text-xs" placeholder="email@..." />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Telephone</label>
                <Input value={client.phone} onChange={(e) => update({ phone: e.target.value })} className="h-8 text-xs" placeholder="+32..." />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Site web</label>
                <Input value={client.website} onChange={(e) => update({ website: e.target.value })} className="h-8 text-xs" placeholder="https://..." />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Adresse</label>
                <Input value={client.address} onChange={(e) => update({ address: e.target.value })} className="h-8 text-xs" placeholder="Adresse" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Notes</label>
              <Textarea value={client.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Notes..." className="text-xs min-h-[60px] resize-none" />
            </div>

            {/* Contacts */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Contacts ({clientContacts.length})</span>
                </div>
                <Button
                  variant="ghost" size="sm" className="h-6 text-xs gap-1 text-muted-foreground hover:text-primary"
                  onClick={async () => {
                    const contact = await addContact({ first_name: 'Nouveau', last_name: 'Contact', client_id: client.id });
                    setSelectedClient(null);
                    setTimeout(() => setSelectedContact(contact), 100);
                  }}
                >
                  <Plus className="w-3 h-3" /> Ajouter
                </Button>
              </div>
              {clientContacts.length > 0 ? (
                <div className="space-y-1">
                  {clientContacts.map(c => (
                    <button key={c.id} onClick={() => { setSelectedClient(null); setTimeout(() => setSelectedContact(c), 100); }}
                      className="w-full text-left px-3 py-2 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <span className="text-xs font-medium">{c.first_name} {c.last_name}</span>
                      {c.role && <span className="text-[10px] text-muted-foreground ml-2">{c.role}</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Aucun contact</p>
              )}
            </div>

            {/* Deals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Handshake className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Deals ({clientDeals.length})</span>
                </div>
                <Button
                  variant="ghost" size="sm" className="h-6 text-xs gap-1 text-muted-foreground hover:text-primary"
                  onClick={async () => {
                    const deal = await addDeal({ name: client.name, client_id: client.id, value: 0, stage: 'Réponse positive' as any });
                    setSelectedClient(null);
                    setTimeout(() => setSelectedDeal(deal), 100);
                  }}
                >
                  <Plus className="w-3 h-3" /> Créer deal
                </Button>
              </div>
              {clientDeals.length > 0 ? (
                <div className="space-y-1">
                  {clientDeals.map(d => (
                    <button key={d.id} onClick={() => { setSelectedClient(null); setTimeout(() => setSelectedDeal(d), 100); }}
                      className="w-full text-left px-3 py-2 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors flex items-center justify-between">
                      <span className="text-xs font-medium">{d.name}</span>
                      <span className="text-xs font-mono">{formatCurrency(d.value)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Aucun deal</p>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-between pt-3 border-t">
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1" onClick={() => { deleteClient(client.id); setSelectedClient(null); }}>
            <Trash2 className="w-3.5 h-3.5" /> Supprimer
          </Button>
          <Button size="sm" onClick={() => setSelectedClient(null)}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useCRM } from './CRMProvider';
import { formatCurrency } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Handshake } from 'lucide-react';

export default function ContactDetailModal() {
  const { selectedContact, setSelectedContact, updateContact, deleteContact, clients, deals, setSelectedDeal } = useCRM();

  if (!selectedContact) return null;
  const contact = selectedContact;
  const contactDeals = deals.filter(d => d.contact_id === contact.id);

  const update = (updates: Partial<typeof contact>) => updateContact(contact.id, updates);

  return (
    <Dialog open={!!selectedContact} onOpenChange={(open) => { if (!open) setSelectedContact(null); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex gap-2">
            <Input
              value={contact.first_name}
              onChange={(e) => update({ first_name: e.target.value })}
              className="text-lg font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 flex-1"
              placeholder="Prenom"
            />
            <Input
              value={contact.last_name}
              onChange={(e) => update({ last_name: e.target.value })}
              className="text-lg font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 flex-1"
              placeholder="Nom"
            />
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Email</label>
                <Input value={contact.email} onChange={(e) => update({ email: e.target.value })} className="h-8 text-xs" placeholder="email@..." />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Telephone</label>
                <Input value={contact.phone} onChange={(e) => update({ phone: e.target.value })} className="h-8 text-xs" placeholder="+32..." />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Fonction</label>
                <Input value={contact.role} onChange={(e) => update({ role: e.target.value })} className="h-8 text-xs" placeholder="CEO, CTO..." />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Entreprise</label>
                <Select value={contact.client_id || '_none'} onValueChange={(v) => update({ client_id: v === '_none' ? null : v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Entreprise" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Aucune</SelectItem>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Notes</label>
              <Textarea value={contact.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Notes..." className="text-xs min-h-[60px] resize-none" />
            </div>

            {/* Deals */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Handshake className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Deals ({contactDeals.length})</span>
              </div>
              {contactDeals.length > 0 ? (
                <div className="space-y-1">
                  {contactDeals.map(d => (
                    <button key={d.id} onClick={() => { setSelectedContact(null); setTimeout(() => setSelectedDeal(d), 100); }}
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
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1" onClick={() => { deleteContact(contact.id); setSelectedContact(null); }}>
            <Trash2 className="w-3.5 h-3.5" /> Supprimer
          </Button>
          <Button size="sm" onClick={() => setSelectedContact(null)}>Appliquer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useCRM } from './CRMProvider';
import {
  DEAL_STAGES, DealStage, ACTIVITY_TYPES, ActivityType, getActivityTypeLabel, formatCurrency, getStageBadgeClass,
  PROFESSIONS, Profession, PROFESSION_LABELS,
  OFFER_TYPES, OfferType, OFFER_TYPE_LABELS,
  DEAL_SOURCES, DealSource, DEAL_SOURCE_LABELS,
  WARM_STATUS_LABELS, getWarmStatusBadgeClass,
} from '@/lib/types';
import { useTags, useDealTags } from '@/hooks/useTagsComments';
import { useDealOnboardingItemsQuery, useInitializeOnboarding, useToggleOnboardingItem } from '@/hooks/useSupabaseQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Trash2, Phone, Mail, Calendar as CalIcon, FileText, Plus, ExternalLink, CheckCircle2, ListChecks } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const activityIcons: Record<string, any> = {
  call: Phone, email: Mail, meeting: CalIcon, note: FileText,
  lemlist_email: Mail, stan_call: Phone, lemlist_open: Mail, lemlist_click: ExternalLink,
};

export default function DealModal() {
  const { selectedDeal, setSelectedDeal, updateDeal, deleteDeal, clients, contacts, activities, addActivity, teamMembers } = useCRM();
  const { tags } = useTags();
  const { tagIds, addTagToDeal, removeTagFromDeal } = useDealTags(selectedDeal?.id ?? null);

  const [newActivityType, setNewActivityType] = useState<ActivityType>('note');
  const [newActivityDesc, setNewActivityDesc] = useState('');

  // Onboarding
  const { data: onboardingItems = [] } = useDealOnboardingItemsQuery(selectedDeal?.id ?? null);
  const initOnboarding = useInitializeOnboarding();
  const toggleItem = useToggleOnboardingItem();

  if (!selectedDeal) return null;

  const deal = selectedDeal;
  const dealActivities = activities.filter(a => a.deal_id === deal.id).slice(0, 20);
  const clientContacts = contacts.filter(c => c.client_id === deal.client_id);

  const update = (updates: Partial<typeof deal>) => updateDeal(deal.id, updates);

  const handleAddActivity = () => {
    if (!newActivityDesc.trim()) return;
    addActivity({ type: newActivityType, description: newActivityDesc, deal_id: deal.id, client_id: deal.client_id });
    setNewActivityDesc('');
  };

  const onboardingProgress = onboardingItems.length > 0
    ? Math.round((onboardingItems.filter(i => i.is_completed).length / onboardingItems.length) * 100)
    : 0;

  return (
    <Dialog open={!!selectedDeal} onOpenChange={(open) => { if (!open) setSelectedDeal(null); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            <Input
              value={deal.name}
              onChange={(e) => update({ name: e.target.value })}
              className="text-lg font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0"
            />
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 pb-4">
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => {
                const active = tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => active ? removeTagFromDeal(tag.id) : addTagToDeal(tag.id)}
                    className={cn(
                      'inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all',
                      active ? 'border-foreground/30 font-semibold' : 'border-transparent opacity-50 hover:opacity-80'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${tag.color})` }} />
                    {tag.name}
                  </button>
                );
              })}
              {deal.warm_status && deal.warm_status !== 'none' && (
                <Badge className={`text-[10px] ${getWarmStatusBadgeClass(deal.warm_status)}`}>
                  {WARM_STATUS_LABELS[deal.warm_status]}
                </Badge>
              )}
            </div>

            {/* Infos métier */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Profession</label>
                <Select value={deal.profession || '_none'} onValueChange={(v) => update({ profession: v === '_none' ? null : v as Profession })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Profession" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Non défini</SelectItem>
                    {PROFESSIONS.map(p => <SelectItem key={p} value={p}>{PROFESSION_LABELS[p]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Barreau / Ordre</label>
                <Input
                  value={deal.barreau_ordre}
                  onChange={(e) => update({ barreau_ordre: e.target.value })}
                  placeholder="Ex: Paris, Lyon..."
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Type d'offre</label>
                <Select value={deal.offer_type || '_none'} onValueChange={(v) => update({ offer_type: v === '_none' ? null : v as OfferType })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Offre" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Non défini</SelectItem>
                    {OFFER_TYPES.map(o => <SelectItem key={o} value={o}>{OFFER_TYPE_LABELS[o]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Source</label>
                <Select value={deal.source || 'other'} onValueChange={(v) => update({ source: v as DealSource })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEAL_SOURCES.map(s => <SelectItem key={s} value={s}>{DEAL_SOURCE_LABELS[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Client / Contact / Stage */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Client</label>
                <Select value={deal.client_id || '_none'} onValueChange={(v) => update({ client_id: v === '_none' ? null : v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Client" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Aucun</SelectItem>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Contact</label>
                <Select value={deal.contact_id || '_none'} onValueChange={(v) => update({ contact_id: v === '_none' ? null : v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Contact" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Aucun</SelectItem>
                    {clientContacts.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Stage</label>
                <Select value={deal.stage} onValueChange={(v) => update({ stage: v as DealStage })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEAL_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Assigné à</label>
                <Select value={deal.assigned_to || '_none'} onValueChange={(v) => update({ assigned_to: v === '_none' ? null : v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Personne" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Non assigné</SelectItem>
                    {teamMembers.filter(m => m.is_active).map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Financier */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Valeur (EUR)</label>
                <Input
                  type="number"
                  value={deal.value}
                  onChange={(e) => update({ value: parseFloat(e.target.value) || 0 })}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">MRR</label>
                <Input
                  type="number"
                  value={deal.mrr}
                  onChange={(e) => update({ mrr: parseFloat(e.target.value) || 0 })}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">MRR Cible</label>
                <Input
                  type="number"
                  value={deal.mrr_cible}
                  onChange={(e) => update({ mrr_cible: parseFloat(e.target.value) || 0 })}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            {/* Date, Proba, Validation */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Date de close</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("h-8 w-full text-xs justify-start font-normal", !deal.expected_close_date && "text-muted-foreground")}>
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {deal.expected_close_date ? format(parseISO(deal.expected_close_date), 'd MMM yyyy', { locale: fr }) : 'Choisir'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={deal.expected_close_date ? parseISO(deal.expected_close_date) : undefined}
                      onSelect={d => update({ expected_close_date: d ? format(d, 'yyyy-MM-dd') : '' })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                  Probabilité {deal.probability}%
                </label>
                <Slider
                  value={[deal.probability]}
                  onValueChange={([v]) => update({ probability: v })}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Validation Sibyle + Lien audit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={deal.sibyle_validation}
                  onCheckedChange={(v) => update({ sibyle_validation: v })}
                />
                <label className="text-xs">Validation Sibyle</label>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Lien rapport audit</label>
                <div className="flex gap-1">
                  <Input
                    value={deal.audit_report_url}
                    onChange={(e) => update({ audit_report_url: e.target.value })}
                    placeholder="https://..."
                    className="h-8 text-xs flex-1"
                  />
                  {deal.audit_report_url && (
                    <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
                      <a href={deal.audit_report_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Notes</label>
              <Textarea
                value={deal.notes}
                onChange={(e) => update({ notes: e.target.value })}
                placeholder="Notes sur ce deal..."
                className="text-xs min-h-[60px] resize-none"
              />
            </div>

            {/* Onboarding Checklist (Signé stage) */}
            {deal.stage === 'Signé' && (
              <div className="space-y-2 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-green-600" />
                    <label className="text-xs font-semibold">Onboarding J0–J+30</label>
                    {onboardingItems.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">{onboardingProgress}%</span>
                    )}
                  </div>
                  {onboardingItems.length === 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => initOnboarding.mutate(deal.id)}
                      disabled={initOnboarding.isPending}
                    >
                      Initialiser
                    </Button>
                  )}
                </div>
                {onboardingItems.length > 0 && (
                  <div className="space-y-1">
                    {onboardingItems.map(item => (
                      <div key={item.id} className="flex items-center gap-2 py-1">
                        <Checkbox
                          checked={item.is_completed}
                          onCheckedChange={(checked) => toggleItem.mutate({ id: item.id, completed: !!checked, dealId: deal.id })}
                        />
                        <span className={cn("text-xs flex-1", item.is_completed && "line-through text-muted-foreground")}>
                          {item.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">J+{item.day_offset}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Activities */}
            <div className="space-y-2">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Activités</label>
              <div className="flex gap-2">
                <Select value={newActivityType} onValueChange={(v) => setNewActivityType(v as ActivityType)}>
                  <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map(t => <SelectItem key={t} value={t}>{getActivityTypeLabel(t)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input
                  value={newActivityDesc}
                  onChange={(e) => setNewActivityDesc(e.target.value)}
                  placeholder="Description..."
                  className="h-8 text-xs flex-1"
                  onKeyDown={e => e.key === 'Enter' && handleAddActivity()}
                />
                <Button size="sm" variant="outline" className="h-8" onClick={handleAddActivity}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {dealActivities.map(a => {
                  const Icon = activityIcons[a.type] || FileText;
                  return (
                    <div key={a.id} className="flex items-start gap-2 py-1.5 px-2 rounded-md bg-secondary/30">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs">{a.description}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {getActivityTypeLabel(a.type)} · {format(parseISO(a.date), 'd MMM HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-between pt-3 border-t">
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1" onClick={() => { deleteDeal(deal.id); setSelectedDeal(null); }}>
            <Trash2 className="w-3.5 h-3.5" /> Supprimer
          </Button>
          <Button size="sm" onClick={() => setSelectedDeal(null)}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

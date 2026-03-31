import { useCRM } from './CRMProvider';
import { DEAL_STAGES, CLIENT_STATUSES, PROFESSIONS, DealStage, ClientStatus, Profession, PROFESSION_LABELS } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, Plus, Filter } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTags } from '@/hooks/useTagsComments';
import NotificationBell from './NotificationBell';

const statusLabels: Record<ClientStatus, string> = {
  prospect: 'Prospect',
  active: 'Actif',
  inactive: 'Inactif',
  churned: 'Perdu',
};

export default function TopBar() {
  const {
    viewMode, searchQuery, setSearchQuery,
    filterClientStatus, setFilterClientStatus,
    filterStage, setFilterStage,
    filterTag, setFilterTag,
    filterProfession, setFilterProfession,
    resetFilters,
    addDeal, setSelectedDeal,
    addClient, addContact,
  } = useCRM();
  const { tags } = useTags();

  const hasActiveFilters = filterClientStatus !== 'all' || filterStage !== 'all' || filterTag !== 'all' || filterProfession !== 'all' || searchQuery !== '';
  const activeFilterCount = [filterClientStatus, filterStage, filterTag, filterProfession].filter(f => f !== 'all').length + (searchQuery ? 1 : 0);

  const showStageFilter = viewMode === 'deals' || viewMode === 'pipeline';
  const showStatusFilter = viewMode === 'clients';
  const showProfessionFilter = viewMode === 'deals' || viewMode === 'pipeline' || viewMode === 'warm_pool';
  const showAddButton = ['clients', 'contacts', 'deals', 'pipeline'].includes(viewMode);

  const handleAdd = async () => {
    if (viewMode === 'clients') {
      addClient({ name: 'Nouveau client' });
    } else if (viewMode === 'contacts') {
      addContact({ first_name: 'Nouveau', last_name: 'Contact' });
    } else if (viewMode === 'deals' || viewMode === 'pipeline') {
      const deal = await addDeal({ name: 'Nouveau deal', value: 0, stage: 'Réponse positive' as DealStage });
      setSelectedDeal(deal);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 bg-card border-b border-border">
      <SidebarTrigger className="h-8 w-8 sm:h-7 sm:w-7" />
      <Separator orientation="vertical" className="h-4 hidden sm:block" />

      {/* Search */}
      <div className="relative hidden sm:block">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher..."
          className="h-7 w-[180px] pl-7 text-xs"
        />
      </div>

      {/* Desktop filters */}
      <div className="hidden sm:contents">
        {showStatusFilter && (
          <Select value={filterClientStatus} onValueChange={(v) => setFilterClientStatus(v as ClientStatus | 'all')}>
            <SelectTrigger className="h-7 w-[110px] text-xs rounded border-border">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Statut</SelectItem>
              {CLIENT_STATUSES.map(s => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {showStageFilter && (
          <Select value={filterStage} onValueChange={(v) => setFilterStage(v as DealStage | 'all')}>
            <SelectTrigger className="h-7 w-[140px] text-xs rounded border-border">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Stage</SelectItem>
              {DEAL_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {showProfessionFilter && (
          <Select value={filterProfession} onValueChange={(v) => setFilterProfession(v as Profession | 'all')}>
            <SelectTrigger className="h-7 w-[140px] text-xs rounded border-border">
              <SelectValue placeholder="Profession" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Profession</SelectItem>
              {PROFESSIONS.map(p => <SelectItem key={p} value={p}>{PROFESSION_LABELS[p]}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {tags.length > 0 && (
          <Select value={filterTag} onValueChange={(v) => setFilterTag(v)}>
            <SelectTrigger className="h-7 w-[110px] text-xs rounded border-border">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tag</SelectItem>
              {tags.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: `hsl(${t.color})` }} />
                    {t.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={resetFilters} title="Réinitialiser">
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Mobile filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8 sm:hidden relative">
            <Filter className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[calc(100vw-2rem)] max-w-sm p-3 space-y-3" align="start">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Filtres</span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={resetFilters}>
                Réinitialiser
              </Button>
            )}
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="h-9 text-sm"
          />
        </PopoverContent>
      </Popover>

      <div className="flex-1" />

      <NotificationBell />

      {/* Add button */}
      {showAddButton && (
        <Button variant="default" size="sm" className="h-8 sm:h-7 text-xs gap-1" onClick={handleAdd}>
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {viewMode === 'clients' ? 'Client' : viewMode === 'contacts' ? 'Contact' : 'Deal'}
          </span>
        </Button>
      )}
    </div>
  );
}

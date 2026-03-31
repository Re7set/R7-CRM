import { useState } from 'react';
import { usePlanning } from './PlanningProvider';
import { ViewMode } from '@/lib/types';
import { getWeekLabel, shiftWeek } from '@/lib/dates';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays, CalendarClock, Users, Briefcase, Settings, MapPin, Database, Columns3, Shield, Moon, Sun } from 'lucide-react';
import TemplateEditor from './TemplateEditor';
import KanbanSettings, { KanbanColumnsConfig, loadKanbanConfig, saveKanbanConfig } from './KanbanSettings';
import { useTheme } from './ThemeProvider';

export default function Toolbar() {
  const {
    weekStart, setWeekStart, viewMode, setViewMode,
    filterPerson, setFilterPerson, filterClient, setFilterClient,
    clients, teamMembers,
  } = usePlanning();
  const [templateOpen, setTemplateOpen] = useState(false);
  const [kanbanSettingsOpen, setKanbanSettingsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const viewOptions: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'semaine', label: 'Semaine', icon: <CalendarDays className="w-3.5 h-3.5" /> },
    { mode: 'personne', label: 'Personne', icon: <Users className="w-3.5 h-3.5" /> },
    { mode: 'client', label: 'Client', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { mode: 'calendrier', label: 'Calendrier', icon: <CalendarClock className="w-3.5 h-3.5" /> },
    { mode: 'kanban', label: 'Kanban', icon: <Columns3 className="w-3.5 h-3.5" /> },
    { mode: 'presence', label: 'Présence', icon: <MapPin className="w-3.5 h-3.5" /> },
    { mode: 'database', label: 'Database', icon: <Database className="w-3.5 h-3.5" /> },
    { mode: 'admin', label: 'Admin', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  const settingsLabel = viewMode === 'kanban' ? 'Colonnes' : 'Template';

  const handleSettingsClick = () => {
    if (viewMode === 'kanban') {
      setKanbanSettingsOpen(true);
    } else {
      setTemplateOpen(true);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-card rounded-lg border border-border shadow-[var(--shadow-xs)]">
      {/* Week navigation */}
      <div className="flex items-center gap-0.5 bg-secondary rounded-md p-0.5">
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded hover:bg-background" onClick={() => setWeekStart(shiftWeek(weekStart, -1))}>
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>
        <span className="text-xs font-semibold min-w-[160px] text-center px-2 tabular-nums">
          {getWeekLabel(weekStart)}
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded hover:bg-background" onClick={() => setWeekStart(shiftWeek(weekStart, 1))}>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="h-5 w-px bg-border" />

      {/* View mode */}
      <div className="flex bg-secondary rounded-md p-0.5 gap-0.5">
        {viewOptions.map(v => (
          <button
            key={v.mode}
            onClick={() => setViewMode(v.mode)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
              viewMode === v.mode
                ? 'bg-background text-foreground shadow-[var(--shadow-xs)]'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
            }`}
          >
            {v.icon}
            <span className="hidden sm:inline">{v.label}</span>
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-border" />

      {/* Filters */}
      <Select value={filterPerson} onValueChange={(v) => setFilterPerson(v as any)}>
        <SelectTrigger className="h-7 w-[130px] text-xs rounded border-border">
          <SelectValue placeholder="Personne" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toute l'équipe</SelectItem>
          {teamMembers.map(p => (
            <SelectItem key={p} value={p}>{p}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterClient} onValueChange={(v) => setFilterClient(v as any)}>
        <SelectTrigger className="h-7 w-[130px] text-xs rounded border-border">
          <SelectValue placeholder="Client" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les clients</SelectItem>
          {clients.map(c => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="h-5 w-px bg-border" />

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground rounded"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        title="Basculer le thème"
      >
        {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      </Button>

      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground rounded" onClick={handleSettingsClick}>
        <Settings className="w-3.5 h-3.5" /> {settingsLabel}
      </Button>

      <TemplateEditor open={templateOpen} onOpenChange={setTemplateOpen} />
      <KanbanSettings
        open={kanbanSettingsOpen}
        onOpenChange={setKanbanSettingsOpen}
        onConfigChange={() => {/* KanbanView reads from localStorage */}}
      />
    </div>
  );
}

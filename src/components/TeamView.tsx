import { useCRM } from './CRMProvider';
import { TEAM_ROLE_LABELS, DEAL_STAGES, TeamRole, TEAM_ROLES, DealStage } from '@/lib/types';
import { useAddTeamMember, useUpdateTeamMember, useDeleteTeamMember, useAddAssignmentRule, useDeleteAssignmentRule } from '@/hooks/useSupabaseQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Users, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function TeamView() {
  const { teamMembers, assignmentRules } = useCRM();
  const addMember = useAddTeamMember();
  const updateMember = useUpdateTeamMember();
  const deleteMember = useDeleteTeamMember();
  const addRule = useAddAssignmentRule();
  const deleteRule = useDeleteAssignmentRule();

  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<TeamRole>('prospection');

  const handleAddMember = () => {
    if (!newName.trim()) return;
    addMember.mutate({ name: newName.trim(), role: newRole });
    setNewName('');
  };

  return (
    <div className="space-y-6">
      {/* Team Members */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="px-5 py-3.5 border-b border-border/40 flex items-center gap-2.5">
          <Users className="w-4 h-4" />
          <h2 className="text-sm font-bold">Équipe</h2>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">{teamMembers.length}</span>
        </div>

        {/* Add member form */}
        <div className="px-5 py-3 border-b border-border/20 flex gap-2 items-center">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom du membre..."
            className="h-8 text-xs flex-1 max-w-[200px]"
            onKeyDown={e => e.key === 'Enter' && handleAddMember()}
          />
          <Select value={newRole} onValueChange={(v) => setNewRole(v as TeamRole)}>
            <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TEAM_ROLES.map(r => <SelectItem key={r} value={r}>{TEAM_ROLE_LABELS[r]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleAddMember}>
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </Button>
        </div>

        <ScrollArea className="max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-[10px] uppercase tracking-wider font-bold">Nom</TableHead>
                <TableHead className="w-[120px] text-[10px] uppercase tracking-wider font-bold">Rôle</TableHead>
                <TableHead className="w-[100px] text-[10px] uppercase tracking-wider font-bold">Email</TableHead>
                <TableHead className="w-[80px] text-[10px] uppercase tracking-wider font-bold text-center">Actif</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map(m => (
                <TableRow key={m.id} className="group border-b border-border/20">
                  <TableCell className="py-2.5 px-3 text-xs font-semibold">{m.name}</TableCell>
                  <TableCell className="py-2.5 px-3">
                    <Select value={m.role} onValueChange={(v) => updateMember.mutate({ id: m.id, updates: { role: v as TeamRole } })}>
                      <SelectTrigger className="h-6 text-[10px] border-transparent bg-transparent shadow-none px-0">
                        <Badge variant="outline" className="text-[10px]">{TEAM_ROLE_LABELS[m.role]}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {TEAM_ROLES.map(r => <SelectItem key={r} value={r}>{TEAM_ROLE_LABELS[r]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">{m.email || '—'}</TableCell>
                  <TableCell className="py-2.5 px-3 text-center">
                    <Switch
                      checked={m.is_active}
                      onCheckedChange={(v) => updateMember.mutate({ id: m.id, updates: { is_active: v } })}
                    />
                  </TableCell>
                  <TableCell className="py-2.5 px-1">
                    <button
                      onClick={() => deleteMember.mutate(m.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded-md hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Assignment Rules */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="px-5 py-3.5 border-b border-border/40 flex items-center gap-2.5">
          <ArrowRight className="w-4 h-4" />
          <h2 className="text-sm font-bold">Règles d'assignation</h2>
          <span className="text-[10px] text-muted-foreground">Auto-assignation par stage</span>
        </div>

        <div className="p-5 space-y-3">
          {DEAL_STAGES.filter(s => s !== 'Perdu').map(stage => {
            const stageRules = assignmentRules.filter(r => r.stage === stage);
            const assignedIds = stageRules.map(r => r.team_member_id);

            return (
              <div key={stage} className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs min-w-[130px] justify-center">{stage}</Badge>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {teamMembers.filter(m => m.is_active).map(m => {
                    const isAssigned = assignedIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          if (isAssigned) {
                            const rule = stageRules.find(r => r.team_member_id === m.id);
                            if (rule) deleteRule.mutate(rule.id);
                          } else {
                            addRule.mutate({ stage: stage as DealStage, team_member_id: m.id });
                          }
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${isAssigned ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/60'}`}
                      >
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

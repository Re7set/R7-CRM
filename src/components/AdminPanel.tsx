import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCRM } from './CRMProvider';
import { useAuth } from './AuthProvider';
import { formatCurrency } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Plus, Trash2, Download, KeyRound, Tag, Pencil, Webhook, Package } from 'lucide-react';
import { useServicesQuery, useAddService, useUpdateService, useDeleteService } from '@/hooks/useSupabaseQueries';
import { toast } from 'sonner';

interface TagItem {
  id: string;
  name: string;
  color: string;
}

const PRESET_COLORS = [
  '0 72% 51%',
  '210 78% 46%',
  '145 63% 42%',
  '264 60% 55%',
  '38 92% 50%',
  '325 72% 54%',
  '170 55% 38%',
  '16 80% 52%',
  '220 12% 56%',
];

export default function AdminPanel() {
  const { changePassword } = useAuth();
  const { deals } = useCRM();
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [makeUrl, setMakeUrl] = useState(() => localStorage.getItem('make_webhook_url') || '');
  const [makeTesting, setMakeTesting] = useState(false);

  // Tags state
  const [tags, setTags] = useState<TagItem[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[1]);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  useEffect(() => {
    supabase.from('tags').select('*').order('name').then(({ data }) => {
      if (data) setTags(data);
      setLoading(false);
    });
  }, []);

  // Tag handlers
  const handleAddTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    if (tags.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Ce tag existe deja');
      return;
    }
    const { data } = await supabase.from('tags').insert({ name, color: newTagColor }).select().single();
    if (data) {
      setTags(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewTagName('');
      toast.success(`Tag "${name}" cree`);
    }
  };

  const handleDeleteTag = async (id: string) => {
    await supabase.from('tags').delete().eq('id', id);
    setTags(prev => prev.filter(t => t.id !== id));
    toast.success('Tag supprime');
  };

  const startEditTag = (tag: TagItem) => {
    setEditingTag(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const saveEditTag = async () => {
    if (!editingTag || !editName.trim()) return;
    await supabase.from('tags').update({ name: editName.trim(), color: editColor }).eq('id', editingTag);
    setTags(prev => prev.map(t => t.id === editingTag ? { ...t, name: editName.trim(), color: editColor } : t));
    setEditingTag(null);
    toast.success('Tag mis a jour');
  };

  const exportCSV = () => {
    const headers = ['Deal', 'Valeur', 'Stage', 'Probabilite', 'Date Close', 'Notes'];
    const rows = deals.map(d => [d.name, d.value, d.stage, d.probability, d.expected_close_date, d.notes]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deals-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV telecharge');
  };

  if (loading) return <div className="p-8 text-muted-foreground text-sm">Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Tags */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold text-foreground">Tags</h2>
        </div>
        <div className="bg-card rounded-lg border border-border divide-y divide-border/40">
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center gap-3 px-5 py-2.5">
              {editingTag === tag.id ? (
                <>
                  <div className="flex gap-1">
                    {PRESET_COLORS.map(c => (
                      <button key={c} onClick={() => setEditColor(c)}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${editColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: `hsl(${c})` }} />
                    ))}
                  </div>
                  <Input value={editName} onChange={ev => setEditName(ev.target.value)} className="h-7 text-sm flex-1" onKeyDown={ev => ev.key === 'Enter' && saveEditTag()} autoFocus />
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={saveEditTag}><Save className="w-3 h-3" /></Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingTag(null)}>Annuler</Button>
                </>
              ) : (
                <>
                  <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: `hsl(${tag.color})` }} />
                  <span className="flex-1 text-sm font-medium">{tag.name}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => startEditTag(tag)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTag(tag.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </div>
          ))}
          <div className="px-5 py-3 space-y-2">
            <div className="flex gap-1">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setNewTagColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${newTagColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: `hsl(${c})` }} />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: `hsl(${newTagColor})` }} />
              <Input placeholder="Nouveau tag..." value={newTagName} onChange={e => setNewTagName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTag()} className="h-8 text-sm flex-1" />
              <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={handleAddTag}>
                <Plus className="w-3.5 h-3.5" /> Ajouter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <ServicesSection />

      {/* Mot de passe */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold text-foreground">Mot de passe</h2>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Nouveau mot de passe</label>
            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="--------" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Confirmer</label>
            <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="--------" className="h-8 text-sm" />
          </div>
          <Button size="sm" className="gap-2" onClick={async () => {
            if (!newPassword || newPassword.length < 4) { toast.error('Le mot de passe doit faire au moins 4 caracteres'); return; }
            if (newPassword !== confirmPassword) { toast.error('Les mots de passe ne correspondent pas'); return; }
            await changePassword(newPassword);
            setNewPassword(''); setConfirmPassword('');
            toast.success('Mot de passe mis a jour');
          }}>
            <Save className="w-3.5 h-3.5" /> Changer le mot de passe
          </Button>
        </div>
      </section>

      {/* Make Webhook */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Webhook className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold text-foreground">Automatisations Make</h2>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 space-y-3">
          <p className="text-xs text-muted-foreground">
            Connectez un webhook Make pour declencher des actions automatiques lors d'evenements du CRM.
          </p>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">URL du webhook Make</label>
            <Input value={makeUrl} onChange={e => setMakeUrl(e.target.value)} placeholder="https://hook.eu2.make.com/..." className="h-8 text-sm font-mono" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="gap-2" onClick={() => {
              localStorage.setItem('make_webhook_url', makeUrl.trim());
              toast.success('Webhook Make sauvegarde');
            }}>
              <Save className="w-3.5 h-3.5" /> Sauvegarder
            </Button>
            <Button size="sm" variant="outline" className="gap-2" disabled={!makeUrl.trim() || makeTesting}
              onClick={async () => {
                setMakeTesting(true);
                try {
                  await fetch(makeUrl.trim(), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'no-cors',
                    body: JSON.stringify({ event: 'test', timestamp: new Date().toISOString(), source: 'RE7SET CRM' }),
                  });
                  toast.success('Requete envoyee !');
                } catch { toast.error("Erreur lors de l'envoi"); }
                finally { setMakeTesting(false); }
              }}>
              <Webhook className="w-3.5 h-3.5" /> {makeTesting ? 'Envoi...' : 'Tester'}
            </Button>
          </div>
          <div className="text-[11px] text-muted-foreground/70 space-y-1 pt-1">
            <p className="font-semibold text-muted-foreground">Evenements envoyes automatiquement :</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Creation d'un deal</li>
              <li>Changement de stage</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Export */}
      <section>
        <Button variant="outline" onClick={exportCSV} className="gap-2">
          <Download className="w-4 h-4" /> Exporter les deals en CSV
        </Button>
      </section>
    </div>
  );
}

function ServicesSection() {
  const { data: services = [] } = useServicesQuery();
  const addService = useAddService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addService.mutate({ name: newName.trim(), category: newCategory.trim(), description: newDesc.trim() });
    setNewName(''); setNewCategory(''); setNewDesc('');
    toast.success('Service créé');
  };

  const startEdit = (s: typeof services[0]) => {
    setEditing(s.id); setEditName(s.name); setEditCategory(s.category); setEditDesc(s.description);
  };

  const saveEdit = () => {
    if (!editing || !editName.trim()) return;
    updateService.mutate({ id: editing, updates: { name: editName.trim(), category: editCategory.trim(), description: editDesc.trim() } });
    setEditing(null);
    toast.success('Service mis à jour');
  };

  const categories = [...new Set(services.map(s => s.category).filter(Boolean))];

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-primary" />
        <h2 className="text-base font-bold text-foreground">Services</h2>
        <span className="text-xs text-muted-foreground">({services.length})</span>
      </div>
      <div className="bg-card rounded-lg border border-border divide-y divide-border/40">
        {services.map(s => (
          <div key={s.id} className="flex items-center gap-3 px-5 py-2.5">
            {editing === s.id ? (
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-7 text-sm flex-1" placeholder="Nom" autoFocus />
                  <Input value={editCategory} onChange={e => setEditCategory(e.target.value)} className="h-7 text-sm w-[120px]" placeholder="Catégorie" />
                </div>
                <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="h-7 text-sm" placeholder="Description" />
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={saveEdit}><Save className="w-3 h-3" /></Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditing(null)}>Annuler</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{s.name}</span>
                    {s.category && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s.category}</span>}
                  </div>
                  {s.description && <p className="text-[11px] text-muted-foreground truncate">{s.description}</p>}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => startEdit(s)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => { deleteService.mutate(s.id); toast.success('Service supprimé'); }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>
        ))}
        <div className="px-5 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <Input placeholder="Nom du service..." value={newName} onChange={e => setNewName(e.target.value)} className="h-8 text-sm flex-1" />
            <Input placeholder="Catégorie" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="h-8 text-sm w-[120px]" />
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Description (optionnel)" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="h-8 text-sm flex-1" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={handleAdd}>
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

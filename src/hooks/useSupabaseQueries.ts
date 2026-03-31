import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Client, Contact, Deal, Activity, PipelineStage, DealStage, ClientStatus, ActivityType, TeamMember, AssignmentRule, Notification, OnboardingTemplate, DealOnboardingItem } from '@/lib/types';

// ── Clients ─────────────────────────────────────────────────

export function useClientsQuery() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*').order('name');
      if (error) throw error;
      return (data ?? []) as Client[];
    },
  });
}

export function useAddClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (client: Partial<Client> & { name: string }) => {
      const { data, error } = await supabase.from('clients').insert(client).select().single();
      if (error) throw error;
      return data as Client;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Client> }) => {
      const { error } = await supabase.from('clients').update(updates).eq('id', id);
      if (error) throw error;
      return { id, updates };
    },
    onMutate: async ({ id, updates }) => {
      await qc.cancelQueries({ queryKey: ['clients'] });
      const previous = qc.getQueryData<Client[]>(['clients']);
      qc.setQueryData<Client[]>(['clients'], (old) =>
        (old ?? []).map(c => c.id === id ? { ...c, ...updates } : c)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(['clients'], context.previous);
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); },
  });
}

// ── Contacts ────────────────────────────────────────────────

export function useContactsQuery() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contacts').select('*').order('last_name');
      if (error) throw error;
      return (data ?? []) as Contact[];
    },
  });
}

export function useAddContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contact: Partial<Contact> & { first_name: string; last_name: string }) => {
      const { data, error } = await supabase.from('contacts').insert(contact).select().single();
      if (error) throw error;
      return data as Contact;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); },
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contact> }) => {
      const { error } = await supabase.from('contacts').update(updates).eq('id', id);
      if (error) throw error;
      return { id, updates };
    },
    onMutate: async ({ id, updates }) => {
      await qc.cancelQueries({ queryKey: ['contacts'] });
      const previous = qc.getQueryData<Contact[]>(['contacts']);
      qc.setQueryData<Contact[]>(['contacts'], (old) =>
        (old ?? []).map(c => c.id === id ? { ...c, ...updates } : c)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(['contacts'], context.previous);
    },
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); },
  });
}

// ── Deals ───────────────────────────────────────────────────

export function useDealsQuery() {
  return useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((d: any) => ({ ...d, value: Number(d.value) || 0, mrr: Number(d.mrr) || 0, mrr_cible: Number(d.mrr_cible) || 0 })) as Deal[];
    },
  });
}

export function useAddDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (deal: Partial<Deal> & { name: string }) => {
      const row: any = { ...deal };
      if (row.expected_close_date === '') row.expected_close_date = null;
      const { data, error } = await supabase.from('deals').insert(row).select().single();
      if (error) throw error;
      return { ...data, value: Number(data.value) || 0 } as Deal;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); },
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Deal> }) => {
      const row: any = { ...updates };
      if (row.expected_close_date === '') row.expected_close_date = null;
      const { error } = await supabase.from('deals').update(row).eq('id', id);
      if (error) throw error;
      return { id, updates };
    },
    onMutate: async ({ id, updates }) => {
      await qc.cancelQueries({ queryKey: ['deals'] });
      const previous = qc.getQueryData<Deal[]>(['deals']);
      qc.setQueryData<Deal[]>(['deals'], (old) =>
        (old ?? []).map(d => d.id === id ? { ...d, ...updates } : d)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(['deals'], context.previous);
    },
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('deals').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); },
  });
}

// ── Activities ──────────────────────────────────────────────

export function useActivitiesQuery() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('activities').select('*').order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Activity[];
    },
  });
}

export function useAddActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (activity: Partial<Activity> & { description: string }) => {
      const { data, error } = await supabase.from('activities').insert(activity).select().single();
      if (error) throw error;
      return data as Activity;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities'] }); },
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities'] }); },
  });
}

// ── Pipeline Stages ─────────────────────────────────────────

export function usePipelineStagesQuery() {
  return useQuery({
    queryKey: ['pipeline_stages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pipeline_stages').select('*').order('position');
      if (error) throw error;
      return (data ?? []) as PipelineStage[];
    },
  });
}

// ── Tags ────────────────────────────────────────────────────

export function useTagsQuery() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tags').select('*').order('name');
      if (error) throw error;
      return (data ?? []) as { id: string; name: string; color: string }[];
    },
  });
}

// ── Team Members ───────────────────────────────────────────

export function useTeamMembersQuery() {
  return useQuery({
    queryKey: ['team_members'],
    queryFn: async () => {
      const { data, error } = await supabase.from('team_members').select('*').order('name');
      if (error) throw error;
      return (data ?? []) as TeamMember[];
    },
  });
}

export function useAddTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (member: Partial<TeamMember> & { name: string }) => {
      const { data, error } = await supabase.from('team_members').insert(member).select().single();
      if (error) throw error;
      return data as TeamMember;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team_members'] }); },
  });
}

export function useUpdateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TeamMember> }) => {
      const { error } = await supabase.from('team_members').update(updates).eq('id', id);
      if (error) throw error;
      return { id, updates };
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team_members'] }); },
  });
}

export function useDeleteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team_members'] }); },
  });
}

// ── Assignment Rules ───────────────────────────────────────

export function useAssignmentRulesQuery() {
  return useQuery({
    queryKey: ['assignment_rules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('assignment_rules').select('*');
      if (error) throw error;
      return (data ?? []) as AssignmentRule[];
    },
  });
}

export function useAddAssignmentRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rule: { stage: DealStage; team_member_id: string }) => {
      const { data, error } = await supabase.from('assignment_rules').insert(rule).select().single();
      if (error) throw error;
      return data as AssignmentRule;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assignment_rules'] }); },
  });
}

export function useDeleteAssignmentRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('assignment_rules').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assignment_rules'] }); },
  });
}

// ── Notifications ──────────────────────────────────────────

export function useNotificationsQuery() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
  });
}

export function useAddNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notif: { team_member_id: string; deal_id?: string; title: string; body?: string }) => {
      const { data, error } = await supabase.from('notifications').insert(notif).select().single();
      if (error) throw error;
      return data as Notification;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });
}

// ── Onboarding ─────────────────────────────────────────────

export function useOnboardingTemplatesQuery() {
  return useQuery({
    queryKey: ['onboarding_templates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('onboarding_templates').select('*').order('position');
      if (error) throw error;
      return (data ?? []) as OnboardingTemplate[];
    },
  });
}

export function useDealOnboardingItemsQuery(dealId: string | null) {
  return useQuery({
    queryKey: ['deal_onboarding_items', dealId],
    enabled: !!dealId,
    queryFn: async () => {
      const { data, error } = await supabase.from('deal_onboarding_items').select('*').eq('deal_id', dealId!).order('day_offset').order('created_at');
      if (error) throw error;
      return (data ?? []) as DealOnboardingItem[];
    },
  });
}

export function useInitializeOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dealId: string) => {
      const { data: templates, error: tErr } = await supabase.from('onboarding_templates').select('*').order('position');
      if (tErr) throw tErr;
      const items = (templates ?? []).map(t => ({
        deal_id: dealId,
        template_id: t.id,
        title: t.title,
        description: t.description || '',
        day_offset: t.day_offset,
      }));
      const { error } = await supabase.from('deal_onboarding_items').insert(items);
      if (error) throw error;
      await supabase.from('deals').update({ onboarding_started_at: new Date().toISOString() }).eq('id', dealId);
    },
    onSuccess: (_data, dealId) => {
      qc.invalidateQueries({ queryKey: ['deal_onboarding_items', dealId] });
      qc.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useToggleOnboardingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completed, dealId }: { id: string; completed: boolean; dealId: string }) => {
      const { error } = await supabase.from('deal_onboarding_items').update({
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
      }).eq('id', id);
      if (error) throw error;
      return { id, dealId };
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['deal_onboarding_items', vars.dealId] });
    },
  });
}

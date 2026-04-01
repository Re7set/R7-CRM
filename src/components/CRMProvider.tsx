import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ViewMode, Client, Contact, Deal, Activity, PipelineStage, DealStage, ClientStatus, Profession, TeamMember, AssignmentRule, Notification as CRMNotification } from '@/lib/types';
import {
  useClientsQuery, useContactsQuery, useDealsQuery, useActivitiesQuery, usePipelineStagesQuery,
  useAddClient, useUpdateClient, useDeleteClient,
  useAddContact, useUpdateContact, useDeleteContact,
  useAddDeal, useUpdateDeal, useDeleteDeal,
  useAddActivity, useDeleteActivity,
  useTeamMembersQuery, useAssignmentRulesQuery,
  useNotificationsQuery, useAddNotification,
} from '@/hooks/useSupabaseQueries';

interface CRMContextType {
  // View & filters
  viewMode: ViewMode;
  setViewMode: (vm: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterClientStatus: ClientStatus | 'all';
  setFilterClientStatus: (s: ClientStatus | 'all') => void;
  filterStage: DealStage | 'all';
  setFilterStage: (s: DealStage | 'all') => void;
  filterTag: string | 'all';
  setFilterTag: (t: string | 'all') => void;
  filterProfession: Profession | 'all';
  setFilterProfession: (p: Profession | 'all') => void;
  resetFilters: () => void;

  // Data
  clients: Client[];
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
  pipelineStages: PipelineStage[];
  teamMembers: TeamMember[];
  assignmentRules: AssignmentRule[];
  notifications: CRMNotification[];

  // Client CRUD
  addClient: (client: Partial<Client> & { name: string }) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Contact CRUD
  addContact: (contact: Partial<Contact> & { first_name: string; last_name: string }) => Promise<Contact>;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  // Deal CRUD
  addDeal: (deal: Partial<Deal> & { name: string }) => Promise<Deal>;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;

  // Activity CRUD
  addActivity: (activity: Partial<Activity> & { description: string }) => void;
  deleteActivity: (id: string) => void;

  // Selection
  selectedDeal: Deal | null;
  setSelectedDeal: (d: Deal | null) => void;
  selectedClient: Client | null;
  setSelectedClient: (c: Client | null) => void;
  selectedContact: Contact | null;
  setSelectedContact: (c: Contact | null) => void;
}

const CRMContext = createContext<CRMContextType | null>(null);

export function useCRM() {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error('useCRM must be used within CRMProvider');
  return ctx;
}

function fireMake(event: string, data: Record<string, any>) {
  const url = localStorage.getItem('make_webhook_url');
  if (!url) return;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    mode: 'no-cors',
    body: JSON.stringify({ event, timestamp: new Date().toISOString(), source: 'RE7SET CRM', ...data }),
  }).catch(() => {});
}

export function CRMProvider({ children }: { children: React.ReactNode }) {
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClientStatus, setFilterClientStatus] = useState<ClientStatus | 'all'>('all');
  const [filterStage, setFilterStage] = useState<DealStage | 'all'>('all');
  const [filterTag, setFilterTag] = useState<string | 'all'>('all');
  const [filterProfession, setFilterProfession] = useState<Profession | 'all'>('all');

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setFilterClientStatus('all');
    setFilterStage('all');
    setFilterTag('all');
    setFilterProfession('all');
  }, []);

  // Data
  const { data: clients = [] } = useClientsQuery();
  const { data: contacts = [] } = useContactsQuery();
  const { data: deals = [] } = useDealsQuery();
  const { data: activities = [] } = useActivitiesQuery();
  const { data: pipelineStages = [] } = usePipelineStagesQuery();
  const { data: teamMembers = [] } = useTeamMembersQuery();
  const { data: assignmentRules = [] } = useAssignmentRulesQuery();
  const { data: notifications = [] } = useNotificationsQuery();

  // Mutations
  const addClientMut = useAddClient();
  const updateClientMut = useUpdateClient();
  const deleteClientMut = useDeleteClient();
  const addContactMut = useAddContact();
  const updateContactMut = useUpdateContact();
  const deleteContactMut = useDeleteContact();
  const addDealMut = useAddDeal();
  const updateDealMut = useUpdateDeal();
  const deleteDealMut = useDeleteDeal();
  const addActivityMut = useAddActivity();
  const deleteActivityMut = useDeleteActivity();
  const addNotificationMut = useAddNotification();

  // Actions
  const addClient = useCallback(async (client: Partial<Client> & { name: string }) => {
    const result = await addClientMut.mutateAsync(client);
    return result;
  }, [addClientMut]);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    updateClientMut.mutate({ id, updates });
    setSelectedClient(prev => prev?.id === id ? { ...prev, ...updates } : prev);
  }, [updateClientMut]);

  const deleteClient = useCallback((id: string) => {
    deleteClientMut.mutate(id);
    setSelectedClient(prev => prev?.id === id ? null : prev);
  }, [deleteClientMut]);

  const addContact = useCallback(async (contact: Partial<Contact> & { first_name: string; last_name: string }) => {
    const result = await addContactMut.mutateAsync(contact);
    return result;
  }, [addContactMut]);

  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    updateContactMut.mutate({ id, updates });
    setSelectedContact(prev => prev?.id === id ? { ...prev, ...updates } : prev);
  }, [updateContactMut]);

  const deleteContact = useCallback((id: string) => {
    deleteContactMut.mutate(id);
    setSelectedContact(prev => prev?.id === id ? null : prev);
  }, [deleteContactMut]);

  const addDeal = useCallback(async (deal: Partial<Deal> & { name: string }) => {
    const result = await addDealMut.mutateAsync(deal);
    fireMake('deal_created', { name: result.name, value: result.value, stage: result.stage });
    return result;
  }, [addDealMut]);

  const updateDeal = useCallback((id: string, updates: Partial<Deal>) => {
    // Auto-assignment on stage change
    if (updates.stage) {
      const rules = assignmentRules.filter(r => r.stage === updates.stage && r.is_active);
      if (rules.length > 0) {
        updates = { ...updates, assigned_to: rules[0].team_member_id };
      }

      // Auto-promote client to "active" (Client) when deal is signed
      if (updates.stage === 'Signé') {
        const deal = deals.find(d => d.id === id);
        if (deal?.client_id) {
          updateClientMut.mutate({ id: deal.client_id, updates: { status: 'active' as ClientStatus } });
        }
      }

      // Notify Stan on Visio/Closing
      if (updates.stage === 'Visio/Closing') {
        const stan = teamMembers.find(m => m.role === 'visio' && m.is_active);
        if (stan) {
          const deal = deals.find(d => d.id === id);
          addNotificationMut.mutate({
            team_member_id: stan.id,
            deal_id: id,
            title: 'Nouveau deal en Visio/Closing',
            body: deal?.name || '',
          });
        }
      }

      fireMake('deal_stage_changed', { id, newStage: updates.stage });
    }

    updateDealMut.mutate({ id, updates });
    setSelectedDeal(prev => prev?.id === id ? { ...prev, ...updates } : prev);
  }, [updateDealMut, assignmentRules, teamMembers, deals, addNotificationMut]);

  const deleteDeal = useCallback((id: string) => {
    deleteDealMut.mutate(id);
    setSelectedDeal(prev => prev?.id === id ? null : prev);
  }, [deleteDealMut]);

  const addActivity = useCallback((activity: Partial<Activity> & { description: string }) => {
    addActivityMut.mutate(activity);
  }, [addActivityMut]);

  const deleteActivity = useCallback((id: string) => {
    deleteActivityMut.mutate(id);
  }, [deleteActivityMut]);

  return (
    <CRMContext.Provider value={{
      viewMode, setViewMode,
      searchQuery, setSearchQuery,
      filterClientStatus, setFilterClientStatus,
      filterStage, setFilterStage,
      filterTag, setFilterTag,
      filterProfession, setFilterProfession,
      resetFilters,
      clients, contacts, deals, activities, pipelineStages,
      teamMembers, assignmentRules, notifications,
      addClient, updateClient, deleteClient,
      addContact, updateContact, deleteContact,
      addDeal, updateDeal, deleteDeal,
      addActivity, deleteActivity,
      selectedDeal, setSelectedDeal,
      selectedClient, setSelectedClient,
      selectedContact, setSelectedContact,
    }}>
      {children}
    </CRMContext.Provider>
  );
}

// ── CRM Types ───────────────────────────────────────────────

export const DEAL_STAGES = ['Réponse positive', 'Audit en cours', 'Visio/Closing', 'Signé', 'Perdu'] as const;
export type DealStage = typeof DEAL_STAGES[number];

export const ACTIVITY_TYPES = ['call', 'email', 'meeting', 'note', 'lemlist_email', 'stan_call', 'lemlist_open', 'lemlist_click'] as const;
export type ActivityType = typeof ACTIVITY_TYPES[number];

export const CLIENT_STATUSES = ['prospect', 'active', 'inactive', 'churned'] as const;
export type ClientStatus = typeof CLIENT_STATUSES[number];

export const PROFESSIONS = ['avocat', 'notaire', 'commissaire_de_justice', 'expert_comptable'] as const;
export type Profession = typeof PROFESSIONS[number];

export const OFFER_TYPES = ['audit_one_shot', 'recurrent_seo_geo', 'bundle_ia'] as const;
export type OfferType = typeof OFFER_TYPES[number];

export const DEAL_SOURCES = ['cold_email', 'linkedin', 'referral', 'other'] as const;
export type DealSource = typeof DEAL_SOURCES[number];

export const TEAM_ROLES = ['prospection', 'audit', 'closing', 'visio', 'admin'] as const;
export type TeamRole = typeof TEAM_ROLES[number];

export const WARM_STATUSES = ['none', 'opened', 'clicked', 'replied'] as const;
export type WarmStatus = typeof WARM_STATUSES[number];

export type ViewMode = 'dashboard' | 'clients' | 'contacts' | 'deals' | 'pipeline' | 'warm_pool' | 'reporting' | 'team' | 'admin';

export interface Client {
  id: string;
  name: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  client_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  name: string;
  value: number;
  stage: DealStage;
  client_id: string | null;
  contact_id: string | null;
  expected_close_date: string;
  notes: string;
  probability: number;
  profession: Profession | null;
  barreau_ordre: string;
  offer_type: OfferType | null;
  mrr: number;
  mrr_cible: number;
  sibyle_validation: boolean;
  audit_report_url: string;
  source: DealSource;
  warm_status: WarmStatus;
  assigned_to: string | null;
  lemlist_campaign_id: string;
  onboarding_started_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  deal_id: string | null;
  client_id: string | null;
  contact_id: string | null;
  date: string;
  created_at: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  position: number;
  visible: boolean;
  color: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatar_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssignmentRule {
  id: string;
  stage: DealStage;
  team_member_id: string;
  is_active: boolean;
  created_at: string;
}

export interface OnboardingTemplate {
  id: string;
  title: string;
  description: string;
  day_offset: number;
  position: number;
  created_at: string;
}

export interface DealOnboardingItem {
  id: string;
  deal_id: string;
  template_id: string | null;
  title: string;
  description: string;
  day_offset: number;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  team_member_id: string;
  deal_id: string | null;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

// ── Labels FR ──────────────────────────────────────────────

export const PROFESSION_LABELS: Record<Profession, string> = {
  'avocat': 'Avocat',
  'notaire': 'Notaire',
  'commissaire_de_justice': 'Commissaire de justice',
  'expert_comptable': 'Expert-comptable',
};

export const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  'audit_one_shot': 'Audit one-shot',
  'recurrent_seo_geo': 'Récurrent SEO/GEO',
  'bundle_ia': 'Bundle IA',
};

export const DEAL_SOURCE_LABELS: Record<DealSource, string> = {
  'cold_email': 'Cold email',
  'linkedin': 'LinkedIn',
  'referral': 'Referral',
  'other': 'Autre',
};

export const WARM_STATUS_LABELS: Record<WarmStatus, string> = {
  'none': 'Aucun',
  'opened': 'Ouvert',
  'clicked': 'Cliqué',
  'replied': 'Répondu',
};

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  'prospection': 'Prospection',
  'audit': 'Audit',
  'closing': 'Closing',
  'visio': 'Visio',
  'admin': 'Admin',
};

// ── Stage colors ────────────────────────────────────────────

const stageColorMap: Record<DealStage, string> = {
  'Réponse positive': 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  'Audit en cours': 'bg-purple-500/15 text-purple-700 dark:text-purple-300',
  'Visio/Closing': 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  'Signé': 'bg-green-500/15 text-green-700 dark:text-green-300',
  'Perdu': 'bg-red-500/15 text-red-700 dark:text-red-300',
};

export function getStageBadgeClass(stage: DealStage): string {
  return stageColorMap[stage] || 'bg-muted text-muted-foreground';
}

const clientStatusColorMap: Record<ClientStatus, string> = {
  'prospect': 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  'active': 'bg-green-500/15 text-green-700 dark:text-green-300',
  'inactive': 'bg-gray-500/15 text-gray-700 dark:text-gray-300',
  'churned': 'bg-red-500/15 text-red-700 dark:text-red-300',
};

export function getClientStatusBadgeClass(status: ClientStatus): string {
  return clientStatusColorMap[status] || 'bg-muted text-muted-foreground';
}

const activityTypeLabels: Record<ActivityType, string> = {
  'call': 'Appel',
  'email': 'Email',
  'meeting': 'Rendez-vous',
  'note': 'Note',
  'lemlist_email': 'Email Lemlist',
  'stan_call': 'Appel Stan',
  'lemlist_open': 'Ouverture Lemlist',
  'lemlist_click': 'Clic Lemlist',
};

export function getActivityTypeLabel(type: ActivityType): string {
  return activityTypeLabels[type] || type;
}

const warmStatusColorMap: Record<WarmStatus, string> = {
  'none': 'bg-gray-500/15 text-gray-700 dark:text-gray-300',
  'opened': 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
  'clicked': 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  'replied': 'bg-green-500/15 text-green-700 dark:text-green-300',
};

export function getWarmStatusBadgeClass(status: WarmStatus): string {
  return warmStatusColorMap[status] || 'bg-muted text-muted-foreground';
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}

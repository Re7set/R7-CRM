import { CRMProvider, useCRM } from '@/components/CRMProvider';
import AppSidebar from '@/components/AppSidebar';
import TopBar from '@/components/TopBar';
import DashboardView from '@/components/DashboardView';
import ClientsListView from '@/components/ClientsListView';
import ContactsListView from '@/components/ContactsListView';
import DealsListView from '@/components/DealsListView';
import PipelineView from '@/components/PipelineView';
import WarmPoolView from '@/components/WarmPoolView';
import ReportingView from '@/components/ReportingView';
import TeamView from '@/components/TeamView';
import AdminPanel from '@/components/AdminPanel';
import DealModal from '@/components/DealModal';
import ClientDetailModal from '@/components/ClientDetailModal';
import ContactDetailModal from '@/components/ContactDetailModal';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AnimatePresence, motion } from 'framer-motion';

const viewComponents = {
  dashboard: DashboardView,
  clients: ClientsListView,
  contacts: ContactsListView,
  deals: DealsListView,
  pipeline: PipelineView,
  warm_pool: WarmPoolView,
  reporting: ReportingView,
  team: TeamView,
  admin: AdminPanel,
} as const;

function CRMContent() {
  const { viewMode } = useCRM();
  const ViewComponent = viewComponents[viewMode];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <main className="flex-1 px-2 sm:px-4 py-2 sm:py-3 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <ViewComponent />
            </motion.div>
          </AnimatePresence>
        </main>
        <DealModal />
        <ClientDetailModal />
        <ContactDetailModal />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Index() {
  return (
    <CRMProvider>
      <CRMContent />
    </CRMProvider>
  );
}

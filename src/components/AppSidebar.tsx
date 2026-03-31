import { useCRM } from './CRMProvider';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { ViewMode } from '@/lib/types';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard, Building2, Users, Handshake, Columns3, Shield, LogOut, Moon, Sun,
  Flame, BarChart3, UserCog,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navGroups = [
  {
    label: 'CRM',
    items: [
      { mode: 'dashboard' as ViewMode, label: 'Tableau de bord', icon: LayoutDashboard },
      { mode: 'clients' as ViewMode, label: 'Clients', icon: Building2 },
      { mode: 'contacts' as ViewMode, label: 'Contacts', icon: Users },
    ],
  },
  {
    label: 'Commercial',
    items: [
      { mode: 'deals' as ViewMode, label: 'Deals', icon: Handshake },
      { mode: 'pipeline' as ViewMode, label: 'Pipeline', icon: Columns3 },
      { mode: 'warm_pool' as ViewMode, label: 'Warm Pool', icon: Flame },
    ],
  },
  {
    label: 'Analyse',
    items: [
      { mode: 'reporting' as ViewMode, label: 'Reporting', icon: BarChart3 },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { mode: 'team' as ViewMode, label: 'Équipe', icon: UserCog },
      { mode: 'admin' as ViewMode, label: 'Admin', icon: Shield },
    ],
  },
];

export default function AppSidebar() {
  const { viewMode, setViewMode } = useCRM();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-border flex items-center justify-center shrink-0 overflow-hidden">
            {/* Try to load logo.png, fallback to text logo if not found */}
            <img src="/logo.png" alt="R7 Logo" className="w-full h-full object-cover" onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }} />
            <span className="r7-gradient-text font-black text-lg hidden">R7</span>
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight truncate">RE7SET</span>
            <span className="text-[10px] text-muted-foreground font-medium">Sales CRM</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map(group => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(item => (
                  <SidebarMenuItem key={item.mode}>
                    <SidebarMenuButton
                      isActive={viewMode === item.mode}
                      onClick={() => setViewMode(item.mode)}
                      tooltip={item.label}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <div className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col">
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Basculer le theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={signOut}
            title="Deconnexion"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

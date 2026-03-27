import { useAuth, UserRole } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard, Users, UserPlus, ClipboardList, BarChart3, Upload, Download, Bell, ChevronLeft, ChevronRight, UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'sales_admin', 'sales_rep'] },
  { title: 'All Leads', url: '/leads', icon: ClipboardList, roles: ['admin', 'sales_admin', 'sales_rep'] },
  { title: 'My Leads', url: '/my-leads', icon: Users, roles: ['sales_admin', 'sales_rep'] },
  { title: 'Unassigned', url: '/unassigned', icon: UserPlus, roles: ['admin', 'sales_admin', 'sales_rep'] },
  
  { title: 'Team', url: '/team', icon: Users, roles: ['sales_admin'] },
  { title: 'Reminders', url: '/reminders', icon: Bell, roles: ['admin', 'sales_admin', 'sales_rep'] },
  { title: 'Data Upload', url: '/upload', icon: Upload, roles: ['admin'] },
  { title: 'Export', url: '/export', icon: Download, roles: ['admin'] },
  { title: 'Reports', url: '/reports', icon: BarChart3, roles: ['admin', 'sales_admin'] },
];

const AppSidebar = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const filteredItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <aside className={cn(
      'h-screen sticky top-0 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200',
      collapsed ? 'w-16' : 'w-56'
    )}>
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border gap-2">
        <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-sidebar-primary-foreground font-bold text-sm">S</span>
        </div>
        {!collapsed && <span className="font-semibold text-sm text-sidebar-foreground truncate">Sales Outreach</span>}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {filteredItems.map(item => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === '/dashboard'}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
              collapsed && 'justify-center px-2'
            )}
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="truncate">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(c => !c)}
        className="h-10 flex items-center justify-center border-t border-sidebar-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
};

export default AppSidebar;

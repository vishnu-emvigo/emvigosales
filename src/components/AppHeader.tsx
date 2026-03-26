import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const AppHeader = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const roleLabel = user.role === 'admin' ? 'Admin' : user.role === 'sales_admin' ? 'Sales Admin' : 'Sales Rep';

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground leading-none">{user.name}</p>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </div>
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-medium">{user.name.charAt(0)}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};

export default AppHeader;

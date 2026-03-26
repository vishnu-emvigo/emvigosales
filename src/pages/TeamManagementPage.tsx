import { MOCK_REPS } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const TeamManagementPage = () => {
  const handleLeaveToggle = (name: string, current: string) => {
    toast.success(`${name} marked as ${current === 'active' ? 'On Leave' : 'Active'}`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground">Team Management</h1>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Leads</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_REPS.map(rep => (
              <tr key={rep.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{rep.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{rep.email}</td>
                <td className="px-4 py-3 text-foreground">{rep.leads_count}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${rep.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {rep.status === 'active' ? 'Active' : 'On Leave'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleLeaveToggle(rep.name, rep.status)}>
                      {rep.status === 'active' ? 'Set On Leave' : 'Set Active'}
                    </Button>
                    {rep.status === 'on_leave' && (
                      <Select onValueChange={v => toast.success(`Leads action: ${v}`)}>
                        <SelectTrigger className="h-7 w-[140px] text-xs"><SelectValue placeholder="Lead action..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reassign">Reassign Leads</SelectItem>
                          <SelectItem value="admin">Assign to Admin</SelectItem>
                          <SelectItem value="queue">Move to Queue</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default TeamManagementPage;

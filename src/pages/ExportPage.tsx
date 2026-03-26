import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATUS_LABELS, LeadStatus } from '@/types/leads';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ExportPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    <h1 className="text-xl font-semibold text-foreground">Export Data</h1>

    <div className="bg-card rounded-xl border border-border p-6 shadow-card max-w-xl space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Filter Export</h2>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-muted-foreground">From Date</label><Input type="date" className="h-9 mt-1" /></div>
        <div><label className="text-xs text-muted-foreground">To Date</label><Input type="date" className="h-9 mt-1" /></div>
        <div>
          <label className="text-xs text-muted-foreground">Status</label>
          <Select><SelectTrigger className="h-9 mt-1"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>{Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><label className="text-xs text-muted-foreground">Batch ID</label><Input placeholder="e.g. BATCH-001" className="h-9 mt-1" /></div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={() => toast.success('Filtered CSV exported')} className="gap-2"><Download className="w-4 h-4" /> Export Filtered</Button>
        <Button variant="outline" onClick={() => toast.success('Full database exported')} className="gap-2"><Download className="w-4 h-4" /> Export All</Button>
      </div>
    </div>
  </motion.div>
);

export default ExportPage;

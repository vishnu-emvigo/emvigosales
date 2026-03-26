import { useState } from 'react';
import { useLeads } from '@/contexts/LeadsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATUS_LABELS, LeadStatus } from '@/types/leads';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ExportPage = () => {
  const { leads } = useLeads();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');

  const exportCsv = (data: typeof leads, filename: string) => {
    const headers = ['Sr No', 'Full Name', 'Company', 'Location', 'LinkedIn URL', 'Status', 'Assigned To', 'Selected Message', 'LinkedIn Profile Used', 'Response Notes', 'Reminder Date', 'Batch ID', 'Upload Date'];
    const rows = data.map(l => [
      l.sr_no, l.full_name, l.company, l.location, l.linkedin_url, l.status,
      l.assigned_to || '', l.selected_message || '', l.linkedin_profile_used || '',
      l.response_notes || '', l.reminder_date || '', l.batch_id, l.upload_date,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${data.length} leads exported as ${filename}`);
  };

  const getFilteredLeads = () => {
    let filtered = leads;
    if (fromDate) filtered = filtered.filter(l => l.upload_date >= fromDate);
    if (toDate) filtered = filtered.filter(l => l.upload_date <= toDate);
    if (statusFilter) filtered = filtered.filter(l => l.status === statusFilter);
    if (batchFilter) filtered = filtered.filter(l => l.batch_id.toLowerCase().includes(batchFilter.toLowerCase()));
    return filtered;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Export Data</h1>

      <div className="bg-card rounded-xl border border-border p-6 shadow-card max-w-xl space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Filter Export</h2>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-muted-foreground">From Date</label><Input type="date" className="h-9 mt-1" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">To Date</label><Input type="date" className="h-9 mt-1" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
          <div>
            <label className="text-xs text-muted-foreground">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><label className="text-xs text-muted-foreground">Batch ID</label><Input placeholder="e.g. BATCH-001" className="h-9 mt-1" value={batchFilter} onChange={e => setBatchFilter(e.target.value)} /></div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={() => exportCsv(getFilteredLeads(), 'leads-filtered.csv')} className="gap-2"><Download className="w-4 h-4" /> Export Filtered</Button>
          <Button variant="outline" onClick={() => exportCsv(leads, 'leads-all.csv')} className="gap-2"><Download className="w-4 h-4" /> Export All</Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ExportPage;

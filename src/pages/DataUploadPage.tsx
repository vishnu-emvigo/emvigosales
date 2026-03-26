import { useState, useRef } from 'react';
import { useLeads } from '@/contexts/LeadsContext';
import { Lead } from '@/types/leads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const DataUploadPage = () => {
  const { addLeads, leads } = useLeads();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error('Please select a CSV file');

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) return toast.error('CSV file is empty');

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
        const batchId = `BATCH-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
        const today = new Date().toISOString().split('T')[0];
        const startSrNo = leads.length + 1;

        const newLeads: Lead[] = lines.slice(1).map((line, i) => {
          const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          const getVal = (key: string) => {
            const idx = headers.indexOf(key);
            return idx >= 0 ? values[idx] || '' : '';
          };

          return {
            id: `lead-${Date.now()}-${i}`,
            sr_no: startSrNo + i,
            linkedin_url: getVal('linkedin url') || getVal('linkedin_url') || '',
            full_name: getVal('full name') || getVal('full_name') || getVal('name') || '',
            company: getVal('company') || '',
            location: getVal('location') || '',
            company_profile: getVal('company profile') || getVal('company_profile') || '',
            person_summary: getVal('person summary') || getVal('person_summary') || '',
            message_a: getVal('message a') || getVal('message_a') || '',
            message_b: getVal('message b') || getVal('message_b') || '',
            status: 'not_assigned' as const,
            assigned_to: null,
            selected_message: null,
            linkedin_profile_used: null,
            response_notes: null,
            reminders: [],
            connect_notes: [],
            batch_id: batchId,
            upload_date: today,
            priority_color: 'none' as const,
          };
        }).filter(l => l.full_name);

        if (newLeads.length === 0) return toast.error('No valid leads found in CSV');
        addLeads(newLeads);
        toast.success(`${newLeads.length} leads imported as ${batchId}`);
        if (fileRef.current) fileRef.current.value = '';
      } catch {
        toast.error('Failed to parse CSV file');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Data Upload</h1>

      <div className="bg-card rounded-xl border border-border p-8 shadow-card max-w-xl">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
          <FileSpreadsheet className="w-10 h-10 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground">Upload CSV file</p>
            <p className="text-xs text-muted-foreground mt-1">Required: LinkedIn URL, Full Name, Company, Location, Company Profile, Person Summary, Message A, Message B</p>
          </div>
          <Input ref={fileRef} type="file" accept=".csv" className="max-w-xs mx-auto" />
          <Button onClick={handleUpload} disabled={uploading} className="gap-2">
            <Upload className="w-4 h-4" /> {uploading ? 'Importing...' : 'Upload & Import'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DataUploadPage;

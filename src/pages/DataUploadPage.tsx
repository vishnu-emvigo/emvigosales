import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const DataUploadPage = () => {
  const handleUpload = () => toast.success('CSV uploaded successfully! 50 leads imported as BATCH-004.');

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
          <Input type="file" accept=".csv" className="max-w-xs mx-auto" />
          <Button onClick={handleUpload} className="gap-2">
            <Upload className="w-4 h-4" /> Upload & Import
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DataUploadPage;

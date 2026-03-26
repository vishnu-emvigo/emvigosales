import { Comment, Lead } from '@/types/leads';
import { MessageSquare } from 'lucide-react';

interface Props {
  comments: Comment[];
  leads: Lead[];
}

const CommentsActivity = ({ comments, leads }: Props) => {
  const sorted = [...comments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const recent = sorted.slice(0, 8);
  const leadMap = new Map(leads.map(l => [l.id, l]));

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
      <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary" /> Recent Activity
      </h2>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet</p>
      ) : (
        <div className="space-y-2">
          {recent.map(c => {
            const lead = leadMap.get(c.lead_id);
            return (
              <div key={c.id} className="flex items-start gap-2 py-1.5 text-sm">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-semibold text-primary">{c.user_name.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-foreground">
                    <span className="font-medium">{c.user_name}</span>
                    <span className="text-muted-foreground"> on </span>
                    <span className="font-medium">{lead?.full_name ?? 'Unknown Lead'}</span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{c.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(c.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentsActivity;

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Lead, Comment, SalesRep, LeadStatus } from '@/types/leads';
import { INITIAL_LEADS, INITIAL_REPS, INITIAL_COMMENTS } from '@/data/mockData';

interface LeadsContextType {
  leads: Lead[];
  reps: SalesRep[];
  comments: Comment[];
  updateLead: (id: string, updates: Partial<Lead>) => void;
  assignLeads: (leadIds: string[], repName: string, repLinkedin: string) => void;
  autoDistribute: () => void;
  addComment: (leadId: string, userId: string, userName: string, userRole: string, content: string) => void;
  toggleRepLeave: (repId: string) => void;
  reassignLeadsFromRep: (repId: string, targetRepId: string | 'admin' | 'queue') => void;
  addLeads: (newLeads: Lead[]) => void;
}

const LeadsContext = createContext<LeadsContextType | null>(null);

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [reps, setReps] = useState<SalesRep[]>(INITIAL_REPS);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const assignLeads = useCallback((leadIds: string[], repName: string, repLinkedin: string) => {
    setLeads(prev => prev.map(l =>
      leadIds.includes(l.id)
        ? { ...l, status: 'assigned' as LeadStatus, assigned_to: repName, linkedin_profile_used: repLinkedin }
        : l
    ));
  }, []);

  const autoDistribute = useCallback(() => {
    const activeReps = reps.filter(r => r.status === 'active');
    if (activeReps.length === 0) return;
    setLeads(prev => {
      const unassigned = prev.filter(l => l.status === 'not_assigned');
      if (unassigned.length === 0) return prev;
      const ids = unassigned.map(l => l.id);
      return prev.map(l => {
        const idx = ids.indexOf(l.id);
        if (idx === -1) return l;
        const rep = activeReps[idx % activeReps.length];
        return { ...l, status: 'assigned' as LeadStatus, assigned_to: rep.name, linkedin_profile_used: rep.linkedin_profile };
      });
    });
  }, [reps]);

  const addComment = useCallback((leadId: string, userId: string, userName: string, userRole: string, content: string) => {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      lead_id: leadId,
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      content,
      created_at: new Date().toISOString(),
    };
    setComments(prev => [...prev, newComment]);
  }, []);

  const toggleRepLeave = useCallback((repId: string) => {
    setReps(prev => prev.map(r =>
      r.id === repId ? { ...r, status: r.status === 'active' ? 'on_leave' as const : 'active' as const } : r
    ));
  }, []);

  const reassignLeadsFromRep = useCallback((repId: string, targetRepId: string | 'admin' | 'queue') => {
    const rep = reps.find(r => r.id === repId);
    if (!rep) return;
    if (targetRepId === 'queue') {
      setLeads(prev => prev.map(l =>
        l.assigned_to === rep.name ? { ...l, status: 'not_assigned' as LeadStatus, assigned_to: null, linkedin_profile_used: null } : l
      ));
    } else if (targetRepId === 'admin') {
      setLeads(prev => prev.map(l =>
        l.assigned_to === rep.name ? { ...l, assigned_to: 'Sarah Manager', linkedin_profile_used: null } : l
      ));
    } else {
      const targetRep = reps.find(r => r.id === targetRepId);
      if (!targetRep) return;
      setLeads(prev => prev.map(l =>
        l.assigned_to === rep.name ? { ...l, assigned_to: targetRep.name, linkedin_profile_used: targetRep.linkedin_profile } : l
      ));
    }
  }, [reps]);

  const addLeads = useCallback((newLeads: Lead[]) => {
    setLeads(prev => [...prev, ...newLeads]);
  }, []);

  return (
    <LeadsContext.Provider value={{
      leads, reps, comments, updateLead, assignLeads, autoDistribute,
      addComment, toggleRepLeave, reassignLeadsFromRep, addLeads,
    }}>
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeads = () => {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider');
  return ctx;
};

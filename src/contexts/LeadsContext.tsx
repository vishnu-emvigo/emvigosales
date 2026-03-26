/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Lead, Comment, SalesRep, LeadStatus, Reminder, PriorityColor, ConnectNote, STATUS_LABELS } from '@/types/leads';
import { INITIAL_LEADS, INITIAL_REPS, INITIAL_COMMENTS } from '@/data/mockData';

interface LeadsContextType {
  leads: Lead[];
  reps: SalesRep[];
  comments: Comment[];
  globalFollowUpHours: number | null;
  setGlobalFollowUpHours: (hours: number | null) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  assignLeads: (leadIds: string[], repName: string, repLinkedin: string) => void;
  autoDistribute: () => void;
  addComment: (leadId: string, userId: string, userName: string, userRole: string, content: string) => void;
  toggleRepLeave: (repId: string) => void;
  reassignLeadsFromRep: (repId: string, targetRepId: string | 'admin' | 'queue') => void;
  addLeads: (newLeads: Lead[]) => void;
  addReminder: (leadId: string, datetime: string) => void;
  removeReminder: (leadId: string, reminderId: string) => void;
  reassignLead: (leadId: string, newAssignee: string, newLinkedin: string, reason: string, performedBy: string) => void;
  setPriority: (leadId: string, priority: PriorityColor, userName: string) => void;
  addConnectNote: (leadId: string, content: string, userName: string) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus, messageType: 'A' | 'B', userName: string, userRole: string, priority?: PriorityColor) => void;
}

const LeadsContext = createContext<LeadsContextType | null>(null);

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [reps, setReps] = useState<SalesRep[]>(INITIAL_REPS);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [globalFollowUpHours, setGlobalFollowUpHours] = useState<number | null>(null);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const assignLeads = useCallback((leadIds: string[], repName: string, repLinkedin: string) => {
    const now = new Date().toISOString();
    setLeads(prev => prev.map(l =>
      leadIds.includes(l.id)
        ? { ...l, status: 'assigned' as LeadStatus, assigned_to: repName, linkedin_profile_used: repLinkedin, assigned_at: now, last_action_at: now }
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
        const now = new Date().toISOString();
        return { ...l, status: 'assigned' as LeadStatus, assigned_to: rep.name, linkedin_profile_used: rep.linkedin_profile, assigned_at: now, last_action_at: now };
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

  const addReminder = useCallback((leadId: string, datetime: string) => {
    const reminder: Reminder = { id: `rem-${Date.now()}`, datetime };
    setLeads(prev => prev.map(l =>
      l.id === leadId ? { ...l, reminders: [...l.reminders, reminder] } : l
    ));
  }, []);

  const removeReminder = useCallback((leadId: string, reminderId: string) => {
    setLeads(prev => prev.map(l =>
      l.id === leadId ? { ...l, reminders: l.reminders.filter(r => r.id !== reminderId) } : l
    ));
  }, []);

  const reassignLead = useCallback((leadId: string, newAssignee: string, newLinkedin: string, reason: string, performedBy: string) => {
    setLeads(prev => {
      const lead = prev.find(l => l.id === leadId);
      if (!lead) return prev;
      const oldAssignee = lead.assigned_to || 'Unassigned';
      const systemComment: Comment = {
        id: `c-sys-${Date.now()}`,
        lead_id: leadId,
        user_id: 'system',
        user_name: 'System',
        user_role: 'System',
        content: `Lead reassigned from ${oldAssignee} to ${newAssignee} by ${performedBy}${reason ? ` — Reason: ${reason}` : ''}`,
        created_at: new Date().toISOString(),
      };
      setComments(prev => [...prev, systemComment]);
      return prev.map(l =>
        l.id === leadId ? { ...l, assigned_to: newAssignee, linkedin_profile_used: newLinkedin } : l
      );
    });
  }, []);

  const setPriority = useCallback((leadId: string, priority: PriorityColor, userName: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, priority_color: priority } : l));
    const labels: Record<PriorityColor, string> = { red: 'Red', amber: 'Amber', green: 'Green', none: 'None' };
    const systemComment: Comment = {
      id: `c-sys-${Date.now()}`,
      lead_id: leadId,
      user_id: 'system',
      user_name: 'System',
      user_role: 'System',
      content: `Priority marked as ${labels[priority]} by ${userName}`,
      created_at: new Date().toISOString(),
    };
    setComments(prev => [...prev, systemComment]);
  }, []);

  const addConnectNote = useCallback((leadId: string, content: string, userName: string) => {
    const note: ConnectNote = {
      id: `cn-${Date.now()}`,
      content,
      user_name: userName,
      created_at: new Date().toISOString(),
    };
    setLeads(prev => prev.map(l =>
      l.id === leadId ? { ...l, connect_notes: [...l.connect_notes, note] } : l
    ));
  }, []);

  const updateLeadStatus = useCallback((leadId: string, status: LeadStatus, messageType: 'A' | 'B', userName: string, userRole: string, priority?: PriorityColor) => {
    setLeads(prev => prev.map(l =>
      l.id === leadId ? {
        ...l,
        status,
        selected_message: messageType,
        last_action_at: new Date().toISOString(),
        ...(priority ? { priority_color: priority } : {}),
      } : l
    ));
    // Add a system comment logging the status change
    const priorityLabel = priority ? ` — Priority: ${priority}` : '';
    const systemComment: Comment = {
      id: `c-sys-${Date.now()}`,
      lead_id: leadId,
      user_id: 'system',
      user_name: 'System',
      user_role: 'System',
      content: `Status updated to ${STATUS_LABELS[status]} (Message ${messageType}) by ${userName}${priorityLabel}`,
      created_at: new Date().toISOString(),
    };
    setComments(prev => [...prev, systemComment]);
  }, []);

  return (
    <LeadsContext.Provider value={{
      leads, reps, comments, globalFollowUpHours, setGlobalFollowUpHours,
      updateLead, assignLeads, autoDistribute,
      addComment, toggleRepLeave, reassignLeadsFromRep, addLeads,
      addReminder, removeReminder, reassignLead, setPriority,
      addConnectNote, updateLeadStatus,
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

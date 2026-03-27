import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Lead, STATUS_LABELS, LeadStatus, PriorityColor } from '@/types/leads';
import { SalesRep } from '@/types/leads';

interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  statuses: string[];
  assignedUsers: string[];
  messageType: string;
  priorities: string[];
  batchIds: string[];
  regions: string[];
}

const PRIORITY_LABELS: Record<PriorityColor, string> = {
  red: 'Red', amber: 'Amber', green: 'Green', none: '—',
};

export function generateReportPdf(
  filteredLeads: Lead[],
  allLeads: Lead[],
  reps: SalesRep[],
  filters: ReportFilters,
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 15;

  // ── Header ──
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Sales Outreach Report', pageW / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageW / 2, y, { align: 'center' });
  y += 6;

  // Applied filters summary
  const filterParts: string[] = [];
  if (filters.dateFrom || filters.dateTo) filterParts.push(`Date: ${filters.dateFrom || '…'} → ${filters.dateTo || '…'}`);
  if (filters.statuses.length) filterParts.push(`Status: ${filters.statuses.map(s => STATUS_LABELS[s as LeadStatus] || s).join(', ')}`);
  if (filters.assignedUsers.length) filterParts.push(`Assigned: ${filters.assignedUsers.join(', ')}`);
  if (filters.messageType !== 'all') filterParts.push(`Message Type: ${filters.messageType}`);
  if (filters.priorities.length) filterParts.push(`Priority: ${filters.priorities.join(', ')}`);
  if (filters.batchIds.length) filterParts.push(`Batch: ${filters.batchIds.join(', ')}`);
  if (filters.regions.length) filterParts.push(`Region: ${filters.regions.join(', ')}`);

  if (filterParts.length) {
    doc.setFontSize(8);
    doc.text(`Filters: ${filterParts.join(' | ')}`, 14, y);
    y += 6;
  }

  // Divider
  doc.setDrawColor(200);
  doc.line(14, y, pageW - 14, y);
  y += 6;

  // ── KPI Summary ──
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('KPI Summary', 14, y);
  y += 6;

  const statusCounts: Record<string, number> = {};
  filteredLeads.forEach(l => { statusCounts[l.status] = (statusCounts[l.status] || 0) + 1; });

  const redCount = filteredLeads.filter(l => l.priority_color === 'red').length;
  const amberCount = filteredLeads.filter(l => l.priority_color === 'amber').length;
  const greenCount = filteredLeads.filter(l => l.priority_color === 'green').length;
  const responseBack = statusCounts['response_back'] || 0;
  const conversionPct = filteredLeads.length ? Math.round((responseBack / filteredLeads.length) * 100) : 0;

  const kpiData = [
    ['Total Leads', String(filteredLeads.length)],
    ['Response Back', String(responseBack)],
    ['Conversion %', `${conversionPct}%`],
    ['🔴 Red', String(redCount)],
    ['🟠 Amber', String(amberCount)],
    ['🟢 Green', String(greenCount)],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: kpiData,
    theme: 'grid',
    headStyles: { fillColor: [88, 80, 236], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 30 } },
    margin: { left: 14 },
    tableWidth: 80,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Status breakdown beside KPIs
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Status Breakdown', 110, (doc as any).lastAutoTable.startY);
  const statusRows = (Object.keys(STATUS_LABELS) as LeadStatus[]).map(s => [
    STATUS_LABELS[s], String(statusCounts[s] || 0),
    filteredLeads.length ? `${Math.round(((statusCounts[s] || 0) / filteredLeads.length) * 100)}%` : '0%',
  ]);
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.startY + 4,
    head: [['Status', 'Count', '%']],
    body: statusRows,
    theme: 'grid',
    headStyles: { fillColor: [88, 80, 236], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 110 },
    tableWidth: 90,
  });

  // ── Performance Summary ──
  doc.addPage();
  y = 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance Summary (Per Sales Rep)', 14, y);
  y += 6;

  const repRows = reps.map(rep => {
    const repLeads = filteredLeads.filter(l => l.assigned_to === rep.name);
    const repResponse = repLeads.filter(l => l.status === 'response_back').length;
    const rate = repLeads.length ? Math.round((repResponse / repLeads.length) * 100) : 0;
    return [rep.name, String(repLeads.length), String(repResponse), `${rate}%`];
  });

  autoTable(doc, {
    startY: y,
    head: [['Sales Rep', 'Total Leads', 'Response Back', 'Conversion %']],
    body: repRows,
    theme: 'grid',
    headStyles: { fillColor: [88, 80, 236], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Detailed Table ──
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Lead Data', 14, y);
  y += 6;

  const detailRows = filteredLeads.map(l => [
    l.full_name,
    l.company,
    l.location,
    STATUS_LABELS[l.status],
    l.assigned_to || 'Unassigned',
    l.selected_message || '—',
    PRIORITY_LABELS[l.priority_color],
    l.last_action_at ? new Date(l.last_action_at).toLocaleDateString() : '—',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Full Name', 'Company', 'Region', 'Status', 'Assigned', 'Msg Type', 'Priority', 'Last Activity']],
    body: detailRows,
    theme: 'grid',
    headStyles: { fillColor: [88, 80, 236], fontSize: 7 },
    bodyStyles: { fontSize: 7 },
    margin: { left: 14, right: 14 },
    styles: { overflow: 'linebreak', cellPadding: 2 },
  });

  // ── Insights ──
  doc.addPage();
  y = 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Auto-Generated Insights', 14, y);
  y += 8;

  const insights: string[] = [];

  // Priority insight
  const requestAccepted = filteredLeads.filter(l => l.status === 'request_accepted');
  const redInAccepted = requestAccepted.filter(l => l.priority_color === 'red').length;
  if (redInAccepted > 0) insights.push(`⚠ ${redInAccepted} Red-priority lead(s) in Request Accepted stage — requires immediate attention.`);

  // Message type comparison
  const msgAResponse = filteredLeads.filter(l => l.selected_message === 'A' && l.status === 'response_back').length;
  const msgBResponse = filteredLeads.filter(l => l.selected_message === 'B' && l.status === 'response_back').length;
  const msgATotal = filteredLeads.filter(l => l.selected_message === 'A').length;
  const msgBTotal = filteredLeads.filter(l => l.selected_message === 'B').length;
  const msgARate = msgATotal ? Math.round((msgAResponse / msgATotal) * 100) : 0;
  const msgBRate = msgBTotal ? Math.round((msgBResponse / msgBTotal) * 100) : 0;
  if (msgATotal > 0 && msgBTotal > 0) {
    if (msgBRate > msgARate) insights.push(`📈 Message Type B showing higher response rate (${msgBRate}%) vs Type A (${msgARate}%).`);
    else if (msgARate > msgBRate) insights.push(`📈 Message Type A showing higher response rate (${msgARate}%) vs Type B (${msgBRate}%).`);
    else insights.push(`📊 Message Type A and B showing equal response rates (${msgARate}%).`);
  }

  // Top performing rep
  if (reps.length > 0) {
    let topRep = reps[0];
    let topRate = 0;
    reps.forEach(rep => {
      const rl = filteredLeads.filter(l => l.assigned_to === rep.name);
      const rr = rl.filter(l => l.status === 'response_back').length;
      const rate = rl.length ? (rr / rl.length) * 100 : 0;
      if (rate > topRate) { topRate = rate; topRep = rep; }
    });
    if (topRate > 0) insights.push(`🏆 ${topRep.name} leading in conversions with ${Math.round(topRate)}% response rate.`);
  }

  // Unassigned
  const unassigned = filteredLeads.filter(l => !l.assigned_to).length;
  if (unassigned > 0) insights.push(`📋 ${unassigned} lead(s) remain unassigned.`);

  // Amber pending
  const amberPending = filteredLeads.filter(l => l.priority_color === 'amber' && l.reminders.length > 0).length;
  if (amberPending > 0) insights.push(`🔔 ${amberPending} Amber lead(s) have pending reminders.`);

  if (insights.length === 0) insights.push('No notable patterns detected in the current filtered dataset.');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  insights.forEach(insight => {
    doc.text(`• ${insight}`, 16, y, { maxWidth: pageW - 32 });
    y += 7;
  });

  doc.save('Sales_Outreach_Report.pdf');
}

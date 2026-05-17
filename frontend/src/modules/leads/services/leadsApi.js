import {
  addLeadNote,
  assignLeadDealer,
  completeFollowup,
  createFollowup,
  getDealers,
  getEnterpriseUsers,
  getFollowups,
  getLeadById,
  getLeadNotes,
  getLeadTimeline,
  getLeads,
  moveLead,
  updateLead,
} from "../../../services/api/crm";

export const fetchLeads = (params) => getLeads(params);
export const fetchLeadById = (leadId) => getLeadById(leadId);
export const fetchLeadTimeline = (leadId) => getLeadTimeline(leadId);
export const fetchLeadNotes = (leadId) => getLeadNotes(leadId);
export const fetchFollowups = (leadId) =>
  getFollowups({ lead: leadId, page_size: 20, ordering: "-scheduled_at" });

export const fetchAssignmentData = async () => {
  const [users, dealers] = await Promise.all([
    getEnterpriseUsers({ page_size: 200 }),
    getDealers({ page_size: 200 }),
  ]);
  return {
    users: users?.results || users || [],
    dealers: dealers?.results || dealers || [],
  };
};

export const moveLeadStatus = (leadId, status) => moveLead(leadId, status);
export const patchLead = (leadId, payload) => updateLead(leadId, payload);
export const assignDealer = (leadId, dealerId) => assignLeadDealer(leadId, dealerId);
export const createNote = (leadId, note) => addLeadNote(leadId, { note });
export const createLeadFollowup = (payload) => createFollowup(payload);
export const completeLeadFollowup = (followupId, outcome) => completeFollowup(followupId, outcome);

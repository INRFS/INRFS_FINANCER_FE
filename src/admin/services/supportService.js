import { supportTickets } from '../data/mockAdminData';
export const supportService = {
  getAll: async () => Promise.resolve(supportTickets),
  reply: async (ticketId, message, newStatus) => {
    const t = supportTickets.find(x => x.id === ticketId);
    if (t) {
      t.messages.push({ from: 'Admin', date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-') + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), text: message });
      if (newStatus) t.status = newStatus;
    }
    return Promise.resolve(t);
  },
  assign: async (ticketId, assignee) => {
    const t = supportTickets.find(x => x.id === ticketId);
    if (t) t.assignedTo = assignee;
    return Promise.resolve(t);
  },
};

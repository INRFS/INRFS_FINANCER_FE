import { platformApi, pageItems } from '../../common/services/platformApi';

export const supportService = {
  getAll: async (params) => pageItems(await platformApi.support.list(params)),
  reply: async (ticketId, message, newStatus) => {
    const ticket = await platformApi.support.message(ticketId, { message, isInternal: false });
    return newStatus ? platformApi.support.status(ticketId, { status: newStatus }) : ticket;
  },
  assign: (ticketId, assignedTo) => platformApi.support.assign(ticketId, { status: 'InProgress', assignedTo }),
};

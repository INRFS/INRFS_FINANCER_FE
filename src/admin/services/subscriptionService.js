import { platformApi } from '../../common/services/platformApi';

export const subscriptionService = {
  getAll: platformApi.admin.subscriptions,
  assign: platformApi.admin.assignSubscription,
};

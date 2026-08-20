import { platformApi } from '../../common/services/platformApi';

export const smsService = { getUsage: platformApi.admin.smsUsage };

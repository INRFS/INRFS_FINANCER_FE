import { platformApi } from '../../common/services/platformApi';

export const settingsService = {
  list: platformApi.settings.list,
  save: platformApi.settings.save,
};

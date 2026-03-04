import { createAppAsyncThunk } from '@store-hooks';
import { SLICE_NAMES } from '@constants';
import type { TUserSkillLight } from '@/shared/lib/types';
import type { Tdelta, TlikeData } from '@/api/types';
import type { TSkillData } from '@api/types';
import type { TUserSkill } from '@/entities/userSkill';

// БЕЗ фотографий ! облегченная версия
export const fetchUserListSkills = createAppAsyncThunk<TUserSkillLight[]>(
  `${SLICE_NAMES.USER_SKILL_LIST}/fetchUserListSkills`,
  async (_, { extra: api }) => {
    const data = await api.getUserListSkillsApi();
      return data
  }
);

// Обновление лайка
export const fetchUpdateSkillLike = createAppAsyncThunk<
    TlikeData,
    {
      skillId:string;
      delta:Tdelta
    }
  >(
  `${SLICE_NAMES.USER}/fetchUpdateSkillLikeApi`,
  async (params, { extra: api }) => {
    const result = await api.updateSkillLikesApi(params.skillId, params.delta);
      if (!result.success) {
        throw new Error(result.message || 'Ошибка обновления лайка');
      }
      return result.data
  }
);


// Добавление нового Навыка
export const fetchAddNewUserSkill = createAppAsyncThunk<
  TUserSkill,
  TSkillData
>(
  `${SLICE_NAMES.USER_SKILL_LIST}/fetchAddNewUserSkill`,
  async (data, { extra: api }) => {
    const result = await api.addNewUserSkillApi(data);
    if (!result.success) {
      throw new Error(result.message || 'Registration failed');
    }
   return result.data
  }
);

// Поиск навыка по id
export const fetchUserSkillById= createAppAsyncThunk<
  TUserSkill,
  TUserSkill['_id']
>(
  `${SLICE_NAMES.USER_SKILL_LIST}/fetchUserSkillById`,
  async (data, { extra: api }) => {
    const result = await api.getUserSkillByIdApi(data);
    if (!result.success) {
      throw new Error(result.message || 'Предложение навыка не найдено');
    }
   return result.data
  }
);

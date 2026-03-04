import type { PayloadAction } from '@reduxjs/toolkit';
import type { TUserSkill } from '@/entities/userSkill';
import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { SLICE_NAMES, requestStatus } from '@constants';
import type { TRequestStatus, TUserSkillLight } from '@types';
import {
  fetchUpdateSkillLike,
  fetchUserListSkills,
  fetchAddNewUserSkill,
  fetchUserSkillById
} from '@thunks';
import type { TlikeData } from '@/api/types';

export interface IUserSkillList {
  userSkillList: TUserSkill[] | null;
  requestStatus: TRequestStatus;
  error: string | null;
}

export const initialState: IUserSkillList = {
  userSkillList: null,
  requestStatus: requestStatus.IDLE,
  error: null
};

export const userSkillListSlice = createSlice({
  name: SLICE_NAMES.USER_SKILL_LIST,
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  selectors: {
    selectSkillUserList: (state) => state.userSkillList,
    selectUserSkillListStatus:(state)=> state.requestStatus
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchUpdateSkillLike.fulfilled,
        (state, action: PayloadAction<TlikeData>) => {
          const { skillId, likes } = action.payload;
          // Находим навык в массиве и обновляем его лайки
          if (state.userSkillList){
            const skillIndex = state.userSkillList.findIndex(s => s._id === skillId);
            if (skillIndex !== -1) {
              state.userSkillList[skillIndex].likes = likes;
            }
          }
          state.requestStatus = requestStatus.SUCCESS
          state.error= null;
        }
      )
      .addCase(
        fetchAddNewUserSkill.fulfilled,
        (state, action: PayloadAction<TUserSkill>) => {
          const newSkill = action.payload;
          state.userSkillList?.push(newSkill)
          state.requestStatus = requestStatus.SUCCESS
          state.error= null;
        }
      )
      .addCase(fetchUserListSkills.fulfilled,
        (state, action: PayloadAction<TUserSkillLight[]>) => {
          state.requestStatus = requestStatus.SUCCESS;
          const userSkillList = action.payload;
          if (Array.isArray(userSkillList)){
            const userSkillListImagesEmpty:TUserSkill[] =
              userSkillList.map(skill => {return {...skill, images:[]}});
            state.userSkillList = userSkillListImagesEmpty;
            state.error = null;
          }else{
            state.error = 'Неверный тип данных';
          }
        }
      )
      .addCase(
        fetchUserSkillById.fulfilled,
        (state, action: PayloadAction<TUserSkill>) => {
          const skill = action.payload;
          // Находим навык в массиве и заменяем его на новый уже с фото
          if (state.userSkillList){
            const skillIndex = state.userSkillList.findIndex(s => s._id === skill._id);
            state.userSkillList[skillIndex]=skill;
          }
          state.requestStatus = requestStatus.SUCCESS
          state.error= null;
        }
      )
      // Общая обработка для всех pending thunk
      .addMatcher(
        isAnyOf(
          fetchUserListSkills.pending,
          fetchAddNewUserSkill.pending,
          fetchUserSkillById.pending
        ),
        (state) => {
          state.requestStatus = requestStatus.LOADING;
          state.error = null;
        }
      )
      // Общая обработка для всех остальных rejected
      .addMatcher(
        isAnyOf(
          fetchUserListSkills.rejected,
          fetchAddNewUserSkill.rejected,
          fetchUpdateSkillLike.rejected,
          fetchUserSkillById.rejected
        ),
        (state, action) => {
          state.requestStatus = requestStatus.ERROR;
          if (action.error.message) {
            state.error = action.error?.message;
          }
        }
      );
  }

});

export default userSkillListSlice;

import userSkillListSlice from './userSkillListSlice';
import {
  fetchUpdateSkillLike,
  fetchUserListSkills,
  fetchAddNewUserSkill,
  fetchUserSkillById
} from '@thunks';

export const userSkillListActions = {
  ...userSkillListSlice.actions,
  fetchUserListSkills,
  fetchUpdateSkillLike,
  fetchAddNewUserSkill,
  fetchUserSkillById
};
export const userSkillListSelectors = userSkillListSlice.selectors;

export { userSkillListSlice };

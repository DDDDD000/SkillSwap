// import { useCallback, useState, useEffect, useMemo } from 'react';
// import type { FC } from 'react';
// // import { UserCard } from '@widgets/UserCard';
// import { useDispatchedActions, useAppSelector } from '@store-hooks';
// import { skillsActions, skillsSelectors } from '@slice/skills';
// //
// import { skillsListAdapter } from '@shared/lib/utils/skillsListAdapter';
// // import { FilterAside } from '../FilterAside/FilterAside';

// // import { skillsActions, skillsSelectors } from '@slice/skills';

// import { userSkillListActions } from '@/services/slices/userSkillList';

// import { userListActions, userListSelectors } from '@slice/userList';
// import { useSelector } from 'react-redux';
// import { selectSwapCards } from '@/services/selectors/swapCardSelector';
// import { ImageDropzone } from '@/features/ImageDropzone';
// import { CardCarouselUI } from '../CardCarousel';


// export const ExampleComponent: FC = () => {
//   // const { fetchGetAllUsers } = useDispatchedActions(userListActions);
//   // const { fetchUserListSkills } = useDispatchedActions(userSkillListActions);
//   // const { fetchSkills } = useDispatchedActions(skillsActions);

//   useEffect(() => {
//     fetchGetAllUsers();
//     fetchUserListSkills();
//     fetchGetAllUsers();
//     fetchUserListSkills();
//     fetchSkills(); // общие навыки
//   }, []);

//   // useEffect(() => {
//   //   fetchGetAllUsers()
//   //   fetchUserListSkills()
//   // }, []);

//   //const swapCards = useSelector(selectSwapCards);// обьединенный массив карточкас юзером

//   const swapCards = useSelector(selectSwapCards); // обьединенный массив карточкас юзером
//   console.log(swapCards);

//   const allSkills = useAppSelector(skillsSelectors.selectskills);

//   const getUserSkills = useCallback(
//     (userId: string, type: 'teach' | 'learn') => {
//       // Выбираем из swapCards все навыки пользователя с нужным type
//       const userSkillCategories = swapCards
//         .filter((item) => item.user._id === userId && item.skill.type === type)
//         .map((item) => ({
//           category: item.skill.category,
//           subcategory: [item.skill.subCategory] // адаптер ожидает массив подкатегорий
//         }));
//       return skillsListAdapter(userSkillCategories, allSkills);
//     },
//     [swapCards, allSkills]
//   );

//   // const { fetchSkills } = useDispatchedActions(skillsActions);
//   // const usersList = useAppSelector(userListSelectors.selectUserList);
//   // const skills = useAppSelector(skillsSelectors.selectskills);
//   // let user = null;

//   // const demoFilters: Filters = {
//   //   preferenceFilter: 'all',
//   //   skillFilter: [],
//   //   genderFilter: 'any',
//   //   cityFilter: []
//   // };

//   // useEffect(() => {
//   //   const testLike = async () => {
//   //     const result = await api.updateUserProfileApi(user)
//   //       console.log('✅ Ответ:', result);
//   //   };
//   //   testLike();
//   // }, []);

//   // useEffect(() => {
//   //   const testLike = async () => {
//   //     const result = await api.getUserApi()
//   //       console.log('✅ Ответ:', result);
//   //   };
//   //   testLike();
//   // }, []);

//   // useEffect(() => {
//   //   const testLike = async () => {
//   //     const result = await api.addNewUserSkillApi(skill)
//   //       console.log('✅ Ответ:', result);
//   //   };
//   //   testLike();
//   // }, []);

//   // useEffect(() => {
//   //   const testLike = async () => {
//   //     const result = await api.loginApi({
//   //       email:'alex1.user1@example.com',
//   //       password:'123456'})
//   //       console.log('✅ Ответ:', result);
//   //   };
//   //   testLike();
//   // }, []);

//   // useEffect(() => {
//   //   const testLike = async () => {
//   //     const result = await api.getUserApi()
//   //       console.log('✅ Ответ:', result);
//   //   };
//   //   testLike();
//   // }, []);


//   const cards = useAppSelector(selectSwapCards);

//   return (
//     <div>
//       {/* <div>
//         {name}
//       </div>
//       <FilterAsideUI
//         filters={demoFilters}
//         selectedCount={2}
//         cityArray={city}
//         skillArray={skills}
//         openCategories={[1]}
//         showAllCategories={false}
//         showAllCities={true}
//         onReset={() => { }}
//         onPreferenceChange={() => { }}
//         onGenderChange={() => { }}
//         onCityToggle={() => { }}
//         onSkillToggle={() => { }}
//         onCategoryToggle={() => { }}
//         onCategorySkillsToggle={() => { }}
//         onShowAllCategoriesToggle={() => { }}
//         onShowAllCitiesToggle={() => { }}
//         getCategoryCheckState={() => ({ checked: false, indeterminate: true })}
//       /> */}
//     </div>
//   );
// };

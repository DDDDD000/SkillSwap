import { useAppSelector, useDispatchedActions } from "@/services/hooks";
import { useEffect, useRef, useState, type FC } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SkillUI } from "./skillUI";
import { selectSwapCards } from "@/services/selectors/swapCardSelector";
import { Preloader } from "@/shared/ui/preloader";
import { userSelectors } from "@/services/slices/user";
import { AppRoutes, requestStatus } from "@/shared/lib/constants";
import { SkillActionModal } from "@/widgets/skillActionModal";
import { Icon } from "@/shared/ui/Icon";
import { userSkillListActions, userSkillListSelectors } from "@/services/slices/userSkillList";
import { userListSelectors } from "@/services/slices/userList";

export const Skill: FC = () => {
  const { fetchUserSkillById } = useDispatchedActions(userSkillListActions);
  const isImagesLoading = useAppSelector(userSkillListSelectors.selectUserSkillListStatus);
  const isUserLoading = useAppSelector(userSelectors.selectUserStatus);
  const isSkillsLoading = useAppSelector(userListSelectors.selectUserListStatus);
  const [showModal, setShowModal ] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isImagesLoadedRef = useRef(false);
  const { id } = useParams();
  // пользователь
  const currentUser = useAppSelector(userSelectors.selectUser);
  const cards = useAppSelector(selectSwapCards);
  // ищем карточку выбранного юзера по id из параметра
  const userCard = cards?.find((card) => card.skill._id === id);
  const userSkill = userCard?.skill;
  const user = userCard?.user;

  //сортировка по похожим предложениям
  const targetSuggestion = userCard?.skill.category;
  const matching = cards.filter(item => item.skill.category=== targetSuggestion);
  const nonMatching = cards.filter(item => item.skill.category !== targetSuggestion);
  const suggestionCards = [...matching, ...nonMatching]; //порядо снчала ролевантные

  //Запрашиваем фото для конкретной карточки (если пусто то запрос с кешированем в слайс)
  useEffect(() => {
    if (userSkill)
    if (id && !isImagesLoadedRef.current && userSkill.images.length === 0) {
      isImagesLoadedRef.current = true // Сразу ставим флаг
      fetchUserSkillById(id)
    }
  }, [id, userSkill?.images.length]);

  const handleOnClose = ()=>{
    setShowModal(false);
  }

   const handleOnOpen = ()=>{
    setShowModal(true);
  }

  const onSwapClick =()=>{
    if(!currentUser){
      navigate(AppRoutes.Login,{state: { from: location.pathname}})
    }else{
      handleOnOpen();
    }
  }

  //если в поисковую строку ввести несуществующий id (или не найдена карточка в базе то редирект)
  // Но проверка сработает только после загрузки юзеров и скилов!Пэтому статусы загрузки важны.
  useEffect(()=>{
    if (
      isUserLoading === requestStatus.SUCCESS &&
      isSkillsLoading === requestStatus.SUCCESS &&
      userCard === undefined
    )
    navigate('/*',{replace:true});
  },[userCard,isUserLoading,isSkillsLoading])

   if (!user || !userSkill || isImagesLoading=== requestStatus.LOADING)
     return <Preloader />


  return (
    <>
    {showModal &&
      <SkillActionModal
        image={<Icon name='icon-notification' fill={'none'} size={100}/>}
        maintText={'Вы предложили обмен'}
        secondaryText={'Теперь дождитесь подтверждения. Вам придёт уведомление'}
        primaryBtnText={"Готово"}
        onClose={handleOnClose}
        isOpen={showModal}
      />
    }
      <SkillUI
        user={user}
        skill={userSkill}
        suggestionCards={suggestionCards}
        onSwapClick={onSwapClick}
      />
    </>
  );
};

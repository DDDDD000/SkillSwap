import styles from './UserCardSkillCounter.module.scss';
import type { TUserCardSkillCounterProps } from './types';
import React, { useRef, useState } from 'react';

export const UserCardSkillCounter: React.FC<TUserCardSkillCounterProps> = ({
  counter,
  skills,
  visibleSkills
}: TUserCardSkillCounterProps) => {
  if (counter <= 0) return null;
  const skillsRef = useRef<HTMLSpanElement>(null)
  const [showSkills, setShowSkills] = useState(false);

  const slicedSkills = skills?.filter(skill=> !visibleSkills?.some(item => item.subCategory === skill.subCategory))

  const handleMouseEnter = () => {
  setShowSkills(true);   // переключаем на true при наведении
  };

  const handleMouseLeave = () => {
  setShowSkills(false);   // переключаем на true при наведении
  };

  return <span
  ref={skillsRef}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
  className={styles.counter}>+{counter}
  {showSkills&& slicedSkills && <ul className={styles.show_skills}>{
   slicedSkills.map((item, index) => (<li key ={index} className={styles.list_item}>{item.subCategory}</li>))
    }</ul>}
  </span>;
};

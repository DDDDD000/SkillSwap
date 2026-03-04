import type { TSkillCategory, TUser } from "@/entities/user";
import { requestStatus } from "./constants";
import type { TUserSkill } from "@/entities/userSkill";

export type TRequestStatus = typeof requestStatus[keyof typeof requestStatus];


export type SkillCard = {
  user:TUser;
  skill:TUserSkill;
}

export type TSetfirstStepForm = {
  email: string;
  password: string;
}

export type TUserSkillLight= Omit<TUserSkill,'images'>;

export type TSetSecondStepForm = {
  avatarPic: string,
  name: string,
  location: string,
  dateOfBirth: string,
  gender:GenderRussian,
  toLearn:TSkillCategory[];
  aboutMe:string;
}

export const genderConvert = {
  male: 'мужской' as const,
  female: 'женский' as const
};

export type TGenderConvert = typeof genderConvert;

export type GenderRussian = 'мужской' | 'женский';


// Тип для одного навыка
type TTeachSkill = {
  category: number;
  subcategory: number[];
};

// Тип для данных формы
export type TThirdStepFormData = {
  skillName: string;
  categoryId: number;
  description: string;
  toTeach: TTeachSkill[];
  skillImages?: string[]; // массив base64 строк фото
};


// Тип для категории
export type TCategoryOption = {
  id: number;
  category: string;
};

// Тип для данных формы
export type TFormSkill = {
  skillName: string;
  categoryId: number;
  categoryName: string;
  subcategoryIds: number[];
  subcategoryNames: string[];
  description: string;
};

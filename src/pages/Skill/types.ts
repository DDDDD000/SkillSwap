import type { TUser } from "@/entities/user";
import type { TUserSkill } from "@/entities/userSkill";
import type { SkillCard } from "@/shared/lib/types";

export interface SkillPageUIProps {
  user: TUser | undefined;
  skill: TUserSkill | undefined;
  suggestionCards: SkillCard[];
  onSwapClick:()=>void;
}

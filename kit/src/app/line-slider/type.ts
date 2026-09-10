import type { PublicTeam } from "../../game/type.ts";

export type LineSliderProps = {
  away: PublicTeam;
  home: PublicTeam;
  value: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
};

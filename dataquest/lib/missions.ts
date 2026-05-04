import type { Mission } from "@/types";
import mission0 from "@/data/missions/mission-0";
import mission1 from "@/data/missions/mission-1";
import mission2 from "@/data/missions/mission-2";
import mission3 from "@/data/missions/mission-3";
import mission4 from "@/data/missions/mission-4";

export const MISSIONS: Mission[] = [
  mission0,
  mission1,
  mission2,
  mission3,
  mission4,
];

export function getMission(id: number): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

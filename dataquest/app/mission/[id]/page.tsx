import { notFound } from "next/navigation";
import { getMission } from "@/lib/missions";
import MissionScreen from "@/components/mission/MissionScreen";

interface MissionPageProps {
  params: Promise<{ id: string }>;
}

export default async function MissionPage({ params }: MissionPageProps) {
  const { id } = await params;
  const missionId = parseInt(id, 10);
  const mission = getMission(missionId);

  if (!mission || isNaN(missionId)) {
    notFound();
  }

  return <MissionScreen mission={mission} />;
}

import { crownStyle, type Monster } from "@/lib/monsters";
import Sprite from "./Sprite";
import Icon from "./Icon";

/** Sprite do monstro; chefes ganham a coroa sentada na cabeça (posição medida em `Monster.head`) */
export default function MonsterSprite({ monster, size, boss = false }: { monster: Monster; size: number; boss?: boolean }) {
  const crown = boss ? crownStyle(monster, size) : null;
  return (
    <span style={{ position: "relative", display: "inline-block", width: size, height: size }}>
      <Sprite src={monster.sprite} size={size} alt={monster.name} />
      {crown && (
        <span className="battle-crown" style={crown} aria-hidden>
          <Icon name="crown" size={Math.max(12, Math.round(size / 4.5))} />
        </span>
      )}
    </span>
  );
}

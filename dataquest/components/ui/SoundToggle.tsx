"use client";

import { useEffect, useState } from "react";
import { play, setSoundOn, soundOn, subscribeSound } from "@/lib/sfx";
import Icon from "./Icon";

/** Liga/desliga os efeitos sonoros (vale para o jogo todo, guardado no navegador) */
export default function SoundToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    setOn(soundOn());
    return subscribeSound(setOn);
  }, []);

  return (
    <button
      type="button"
      className="icon-btn is-square"
      onClick={() => {
        setSoundOn(!on);
        if (!on) play("coin");
      }}
      title={on ? "Som ligado — clique para silenciar" : "Som desligado — clique para ligar"}
      aria-pressed={on}
    >
      <Icon name={on ? "volume" : "volumeOff"} size={18} />
    </button>
  );
}


import { useRef, useEffect } from 'react';

export const useGameAudio = () => {
  const eatPelletSoundRef = useRef<HTMLAudioElement | null>(null);
  const eatPowerPelletSoundRef = useRef<HTMLAudioElement | null>(null);
  const deathSoundRef = useRef<HTMLAudioElement | null>(null);
  const ghostEatenSoundRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    eatPelletSoundRef.current = new Audio();
    eatPowerPelletSoundRef.current = new Audio();
    deathSoundRef.current = new Audio();
    ghostEatenSoundRef.current = new Audio();
    
    if (eatPelletSoundRef.current) eatPelletSoundRef.current.volume = 0.2;
    if (eatPowerPelletSoundRef.current) eatPowerPelletSoundRef.current.volume = 0.3;
    if (deathSoundRef.current) deathSoundRef.current.volume = 0.4;
    if (ghostEatenSoundRef.current) ghostEatenSoundRef.current.volume = 0.3;
  }, []);
  
  return {
    eatPelletSoundRef,
    eatPowerPelletSoundRef,
    deathSoundRef,
    ghostEatenSoundRef
  };
};

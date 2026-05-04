import { Song } from "@/types";

export interface PlayerProps {
  songs: Song[];
  currentIndex: number;
  currentSong: Song | undefined;
  isPlaying: boolean;
  progress: number;
  duration: number;
  currentTime: number;
  isShuffle: boolean;
  isRepeat: boolean;
  
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  handleSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  setIsShuffle: (val: boolean) => void;
  setIsRepeat: (val: boolean) => void;
  setCurrentIndex: (index: number) => void;
  
  formatTime: (time: number) => string;
}

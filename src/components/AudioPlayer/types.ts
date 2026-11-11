import { Song } from "@/types";

/** Props for the main player layout (top bar + artwork stage + controller). */
export interface PlayerViewProps {
  currentSong: Song | undefined;
  currentIndex: number;
  totalTracks: number;
  isPlaying: boolean;
  isPlaylistOpen: boolean;
  currentTime: number;
  duration: number;
  onTogglePlaylist: () => void;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  formatTime: (time: number) => string;
}

/** Props for the slide-over playlist panel. */
export interface PlaylistPanelProps {
  open: boolean;
  songs: Song[];
  currentIndex: number;
  isPlaying: boolean;
  onClose: () => void;
  onSelect: (index: number) => void;
  formatTime: (time: number) => string;
}

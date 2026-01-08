import { useEffect, useRef, useState } from "react";
import { fetchSongs } from "./services/api";
import NowPlaying from "./components/NowPlaying";
import SongListModal from "./components/SongListModal";


export default function App() {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showList, setShowList] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    fetchSongs().then((data) => {
      const normalized = data.map((s) => ({
        ...s,
        title: s.public_id,
      }));
      setSongs(normalized);
    });
  }, []);

  // 🔥 Load song ONLY when currentIndex changes
  useEffect(() => {
    if (!audioRef.current || songs.length === 0) return;

    audioRef.current.load();

    if (playing) {
      audioRef.current.play().catch(() => {
        /* autoplay safety */
      });
    }
  }, [currentIndex]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      await audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const getRandomIndex = (exclude) => {
    if (songs.length <= 1) return 0;
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * songs.length);
    } while (newIndex === exclude);
    return newIndex;
  };

  const nextSong = () => {
    setCurrentIndex(getRandomIndex(currentIndex));
  };

  const prevSong = () => {
    setCurrentIndex(getRandomIndex(currentIndex));
  };

  return (
    <div className="app-shell">
      <audio
        ref={audioRef}
        src={songs[currentIndex]?.url}
        onTimeUpdate={() => {
          setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          setDuration(audioRef.current.duration);
        }}
        onEnded={nextSong}
      />

      <NowPlaying
        song={songs[currentIndex]}
        playing={playing}
        currentTime={currentTime}
        duration={duration}
        onSeek={(time) => {
          audioRef.current.currentTime = time;
          setCurrentTime(time);
        }}
        onPlayPause={togglePlay}
        onNext={nextSong}
        onPrev={prevSong}
        onOpenList={() => setShowList(true)}
      />
      <SongListModal
        open={showList}
        songs={songs}
        currentIndex={currentIndex}
        onSelect={(index) => {
          setCurrentIndex(index);
          setPlaying(true); // Auto-play when selecting from list
        }}
        onClose={() => setShowList(false)}
      />
    </div>
  );
}


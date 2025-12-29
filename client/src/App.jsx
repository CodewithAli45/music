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
    // fetchSongs().then(setSongs);
    fetchSongs().then((data) => {
      // 🔥 Normalize song name from public_id
      const normalized = data.map((s) => ({
        ...s,
        title:(s.public_id)
      }));
      setSongs(normalized);
    });
  }, []);

  useEffect(() => {
      if (!audioRef.current) return;

      audioRef.current.load();

      // 🔥 Auto-play ONLY if already playing
      if (playing) {
        audioRef.current
          .play()
          .catch(() => {
            /* autoplay safety */
          });
      }
    }, [currentIndex, playing]);


  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      await audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const nextSong = () => {
    setCurrentIndex((i) => (i + 1) % songs.length);
  };

  const prevSong = () => {
    setCurrentIndex((i) => (i - 1 + songs.length) % songs.length);
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
        onSelect={setCurrentIndex}
        onClose={() => setShowList(false)}
      />
    </div>
  );
}

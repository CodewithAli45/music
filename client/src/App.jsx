import { useEffect, useState } from "react";
import { fetchSongs } from "./services/api";
import Player from "./components/Player";
import SongList from "./components/SongList";
import "./styles/player.css";

export default function App() {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchSongs()
      .then(setSongs)
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="app">
      <h1>🎵 My Music</h1>

      <SongList
        songs={songs}
        currentIndex={currentIndex}
        onSelect={setCurrentIndex}
      />

      {songs.length > 0 && (
        <Player
          song={songs[currentIndex]}
          onNext={() =>
            setCurrentIndex((currentIndex + 1) % songs.length)
          }
          onPrev={() =>
            setCurrentIndex(
              (currentIndex - 1 + songs.length) % songs.length
            )
          }
        />
      )}
    </div>
  );
}

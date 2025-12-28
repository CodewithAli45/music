import { useEffect, useRef, useState } from "react";

export default function Player({ song, onNext, onPrev }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setPlaying(true);
    setCurrentTime(0);
  }, [song]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      await audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="player">
      <div className="song-title">{song.title}</div>

      <audio
        ref={audioRef}
        src={song.url}
        onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={e => setDuration(e.target.duration)}
        onEnded={onNext}
      />

      {/* Progress Bar */}
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={e => {
          audioRef.current.currentTime = e.target.value;
          setCurrentTime(e.target.value);
        }}
      />

      <div className="time">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      <div className="controls">
        <button onClick={onPrev}>⏮</button>
        <button onClick={togglePlay}>
          {playing ? "⏸" : "▶"}
        </button>
        <button onClick={onNext}>⏭</button>
      </div>
    </div>
  );
}

function formatTime(sec = 0) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

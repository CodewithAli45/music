import "./../styles/nowPlaying.css";

export default function NowPlaying({
  song,
  playing,
  currentTime,
  duration,
  onSeek,
  onPlayPause,
  onNext,
  onPrev,
  onOpenList
})

{

    function formatTime(sec = 0) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
    }

  return (
    <div className="now-playing">

      {/* Top Bar */}
      <div className="top-bar">
        <button className="icon-btn">⬅</button>
        <span className="title">Now Playing</span>
        <button className="icon-btn">♡</button>
      </div>

      {/* Album Art */}
      <div className="album-wrapper">
        <img
          src="/album-placeholder.png"
          alt="album"
          className="album-art"
        />
      </div>

      {/* Song Info */}
      <div className="song-info">
        <div className="song-info-name ">{song?.title || "Unknown Song"}</div>
      </div>

      {/* Progress */}
      <div className="progress">
        <span>{formatTime(currentTime)}</span>

        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
        />

        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="controls">
        <button onClick={onPrev}>⏮</button>

        <button className="play-btn" onClick={onPlayPause}>
          {playing ? "⏸" : "▶"}
        </button>

        <button onClick={onNext}>⏭</button>
      </div>
      <button className="open-list-btn" onClick={onOpenList}>
        ☰ Song List
      </button>
    </div>
  );
}

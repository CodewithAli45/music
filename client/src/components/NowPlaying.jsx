import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Heart, SkipBack, SkipForward, Play, Pause, ListMusic } from "lucide-react";
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
}) {

  function formatTime(sec = 0) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="now-playing"
    >
      {/* Top Bar */}
      <div className="top-bar">
        <button className="icon-btn list-btn" onClick={onOpenList}>
          <ListMusic size={20} />
        </button>
        <span className="title">Now Playing</span>
        <button className="icon-btn heart-btn"><Heart size={20} /></button>
      </div>

      {/* Album Art */}
      <div className="album-wrapper">
        <div className="album-art-container">
          <AnimatePresence mode="wait">
            <motion.img
              key={song?.id || song?.title}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              src="/album-placeholder.png"
              alt="album"
              className="album-art"
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Song Info */}
      <div className="song-info">
        <motion.div 
          key={song?.title}
          className="song-info-name"
        >
          {song?.title || "Unknown Song"}
        </motion.div>
      </div>

      {/* Progress */}
      <div className="progress-container">
        <div className="progress-bar-wrapper">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
          />
        </div>
        <div className="progress-time">
          <span className="current-time">{formatTime(currentTime)}</span>
          <span className="total-duration">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <button className="control-btn prev-btn" onClick={onPrev}>
          <SkipBack size={32} fill="currentColor" />
        </button>

        <div className="play-btn-wrapper">
          <div className={`playing-ring ${playing ? "active" : ""}`} />
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="play-pause-btn" 
            onClick={onPlayPause}
          >
            {playing ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: 4 }} />}
          </motion.button>
        </div>

        <button className="control-btn next-btn" onClick={onNext}>
          <SkipForward size={32} fill="currentColor" />
        </button>
      </div>

    </motion.div>
  );
}



import React, { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Menu, Heart, Repeat, Shuffle, X } from "lucide-react";
import Image from "next/image";
import { PlayerProps } from "./types";

export default function MobilePlayer({
  songs,
  currentIndex,
  currentSong,
  isPlaying,
  progress,
  duration,
  currentTime,
  isShuffle,
  isRepeat,
  togglePlay,
  nextSong,
  prevSong,
  handleSeek,
  setIsShuffle,
  setIsRepeat,
  setCurrentIndex,
  setIsPlaying,
  formatTime
}: PlayerProps & { setIsPlaying: (val: boolean) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => { if (isModalOpen) setIsModalOpen(false); };
    window.addEventListener("popstate", handlePopState);
    if (isModalOpen) window.history.pushState({ modal: true }, "");
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isModalOpen]);

  return (
    <div className="player-container">
      <div className="header">
        <button className="icon-btn" onClick={() => setIsModalOpen(true)}><Menu size={24} /></button>
        <button className="icon-btn"><Heart size={24} fill="currentColor" color="var(--accent)" /></button>
      </div>

      <div className="album-art">
        <Image src={currentSong?.cover || "/asset/album-placeholder.png"} alt="" width={300} height={600} style={{ objectFit: 'cover', width: '100%', height: '100%' }} priority />
      </div>

      <div className="song-info">
        <h2 className="song-title">{currentSong?.title}</h2>
        <div className="song-counter">({currentIndex + 1}/{songs.length})</div>
      </div>

      <div className="progress-container">
        <div className="progress-bar" onClick={handleSeek}>
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="time-info">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="controls">
        <button className="icon-btn" onClick={() => setIsShuffle(!isShuffle)} style={{ color: isShuffle ? "var(--primary)" : "var(--foreground)", opacity: isShuffle ? 1 : 0.5 }}><Shuffle size={20} /></button>
        <button className="icon-btn" onClick={prevSong}><SkipBack size={28} fill="currentColor" /></button>
        <button className="play-pause-btn" onClick={togglePlay}>{isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: 4 }} />}</button>
        <button className="icon-btn" onClick={nextSong}><SkipForward size={28} fill="currentColor" /></button>
        <button className="icon-btn" onClick={() => setIsRepeat(!isRepeat)} style={{ color: isRepeat ? "var(--primary)" : "var(--foreground)", opacity: isRepeat ? 1 : 0.5 }}><Repeat size={20} /></button>
      </div>

      <div className={`modal-overlay glass ${isModalOpen ? "open" : ""}`}>
        <div className="header" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>Playlist</h3>
          <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
        </div>
        <ul className="song-list">
          {songs.map((song, index) => (
            <li key={song.id} className={`song-item ${index === currentIndex ? "active" : ""}`} onClick={() => { setCurrentIndex(index); setIsPlaying(true); setIsModalOpen(false); }}>
              <span className="song-item-number">{index + 1}.</span>
              <div className="song-item-info"><span className="song-item-title">{song.title}</span></div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

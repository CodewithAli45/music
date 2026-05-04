import React from "react";
import { Play, Pause, SkipBack, SkipForward, Heart, Repeat, Shuffle, Volume2 } from "lucide-react";
import Image from "next/image";
import { PlayerProps } from "./types";

export default function DesktopPlayer({
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
  
  return (
    <div className="desktop-player-container">
      <div className="desktop-main">
        {/* Main Content Area: Large Album Art */}
        <div className="desktop-content">
          <div className="desktop-album-art">
            <Image 
              src={currentSong?.cover || "/asset/album-placeholder.png"} 
              alt="" 
              width={500} 
              height={500} 
              style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: 'inherit' }} 
              priority 
            />
          </div>
          <h2 className="desktop-song-title">{currentSong?.title || "No Track Selected"}</h2>
          <p className="desktop-song-artist">{currentSong?.artist || "Unknown Artist"}</p>
        </div>

        {/* Sidebar: Playlist */}
        <div className="desktop-sidebar">
          <div className="desktop-sidebar-header">
            <h3>Up Next</h3>
            <span className="desktop-song-counter">{currentIndex + 1} / {songs.length}</span>
          </div>
          <ul className="desktop-song-list">
            {songs.map((song, index) => (
              <li 
                key={song.id} 
                className={`desktop-song-item ${index === currentIndex ? "active" : ""}`} 
                onClick={() => { setCurrentIndex(index); setIsPlaying(true); }}
              >
                <div className="desktop-song-item-cover">
                  <Image src={song.cover || "/asset/album-placeholder.png"} alt="" width={40} height={40} style={{ objectFit: 'cover', borderRadius: '8px' }} />
                </div>
                <div className="desktop-song-item-info">
                  <span className="desktop-song-item-title">{song.title}</span>
                  <span className="desktop-song-item-artist">{song.artist || "Unknown Artist"}</span>
                </div>
                {index === currentIndex && isPlaying && (
                  <div className="desktop-playing-indicator">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="desktop-bottom-bar">
        <div className="desktop-bottom-left">
           <Image src={currentSong?.cover || "/asset/album-placeholder.png"} alt="" width={56} height={56} style={{ objectFit: 'cover', borderRadius: '10px' }} />
           <div className="desktop-bottom-info">
             <span className="desktop-bottom-title">{currentSong?.title}</span>
             <span className="desktop-bottom-artist">{currentSong?.artist || "Unknown Artist"}</span>
           </div>
           <button className="icon-btn" style={{ marginLeft: '10px' }}><Heart size={20} fill="currentColor" color="var(--accent)" /></button>
        </div>

        <div className="desktop-bottom-center">
          <div className="desktop-controls">
            <button className="icon-btn" onClick={() => setIsShuffle(!isShuffle)} style={{ color: isShuffle ? "var(--primary)" : "var(--foreground)", opacity: isShuffle ? 1 : 0.5 }}><Shuffle size={20} /></button>
            <button className="icon-btn" onClick={prevSong}><SkipBack size={24} fill="currentColor" /></button>
            <button className="play-pause-btn-desktop" onClick={togglePlay}>
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: 3 }} />}
            </button>
            <button className="icon-btn" onClick={nextSong}><SkipForward size={24} fill="currentColor" /></button>
            <button className="icon-btn" onClick={() => setIsRepeat(!isRepeat)} style={{ color: isRepeat ? "var(--primary)" : "var(--foreground)", opacity: isRepeat ? 1 : 0.5 }}><Repeat size={20} /></button>
          </div>
          
          <div className="desktop-progress-container">
            <span className="time-text">{formatTime(currentTime)}</span>
            <div className="desktop-progress-bar" onClick={handleSeek}>
              <div className="desktop-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="time-text">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="desktop-bottom-right">
          <Volume2 size={20} style={{ opacity: 0.7 }} />
          <div className="desktop-volume-bar">
            <div className="desktop-volume-fill" style={{ width: '80%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

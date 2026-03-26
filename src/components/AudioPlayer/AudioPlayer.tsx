"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Menu, 
  Heart, 
  Repeat, 
  Shuffle,
  X,
  Music
} from "lucide-react";
import { Song } from "@/types";
import Image from "next/image";

export default function AudioPlayer() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isShuffle, setIsShuffle] = useState(true);
  const [isRepeat, setIsRepeat] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const currentSong = songs[currentIndex];

  useEffect(() => {
    fetch("/api/songs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const uniqueSongs = [];
          const titles = new Set();
          for (const song of data) {
            if (!titles.has(song.title)) {
              titles.add(song.title);
              uniqueSongs.push(song);
            }
          }
          setSongs(uniqueSongs);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch songs", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Playback failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 1;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const percentage = x / width;
      audioRef.current.currentTime = percentage * audioRef.current.duration;
    }
  };

  const nextSong = () => {
    if (isShuffle && songs.length > 1) {
      let randomIndex = Math.floor(Math.random() * songs.length);
      while (randomIndex === currentIndex) {
        randomIndex = Math.floor(Math.random() * songs.length);
      }
      setCurrentIndex(randomIndex);
    } else {
      setCurrentIndex((prev) => (prev + 1) % songs.length);
    }
  };

  const prevSong = () => {
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (loading) {
    return <div className="text-white">Loading your music...</div>;
  }

  if (songs.length === 0) {
    return <div className="text-white">No songs found in your library.</div>;
  }

  return (
    <div className="player-container">
      <audio
        ref={audioRef}
        src={currentSong?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={nextSong}
      />

      <div className="header">
        <button className="icon-btn" onClick={() => setIsModalOpen(true)}>
          <Menu size={24} />
        </button>
        {/* Removed 'Now Playing' text to prevent duplicate top text */}
        <button className="icon-btn">
          <Heart size={24} fill="currentColor" color="var(--accent)" />
        </button>
      </div>

      <div className="album-art">
        <Image 
          src={currentSong?.cover || "/asset/album-placeholder.png"} 
          alt="" 
          width={400} 
          height={400}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      </div>

      <div className="song-info">
        <h2 className="song-title">{currentSong?.title}</h2>
        <p className="song-artist">{currentSong?.artist}</p>
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
        <button 
          className="icon-btn" 
          onClick={() => setIsShuffle(!isShuffle)}
          style={{ color: isShuffle ? "var(--primary)" : "var(--foreground)", opacity: isShuffle ? 1 : 0.5 }}
        >
          <Shuffle size={20} />
        </button>
        <button className="icon-btn" onClick={prevSong}>
          <SkipBack size={28} fill="currentColor" />
        </button>
        <button className="play-pause-btn" onClick={togglePlay}>
          {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: 4 }} />}
        </button>
        <button className="icon-btn" onClick={nextSong}>
          <SkipForward size={28} fill="currentColor" />
        </button>
        <button 
          className="icon-btn" 
          onClick={() => setIsRepeat(!isRepeat)}
          style={{ color: isRepeat ? "var(--primary)" : "var(--foreground)", opacity: isRepeat ? 1 : 0.5 }}
        >
          <Repeat size={20} />
        </button>
      </div>

      {/* Song List Modal */}
      <div className={`modal-overlay glass ${isModalOpen ? "open" : ""}`}>
        <div className="header" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>Playlist</h3>
          <button className="icon-btn" onClick={() => setIsModalOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <ul className="song-list">
          {songs.map((song, index) => (
            <li 
              key={song.id} 
              className={`song-item ${index === currentIndex ? "active" : ""}`}
              onClick={() => {
                setCurrentIndex(index);
                setIsPlaying(true);
                setIsModalOpen(false);
              }}
            >
              <div className="glass" style={{ padding: 8, borderRadius: 8 }}>
                <Music size={20} color={index === currentIndex ? "var(--primary)" : "var(--secondary)"} />
              </div>
              <div className="song-item-info">
                <span className="song-item-title">{song.title}</span>
                <span className="song-item-artist">{song.artist}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

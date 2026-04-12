"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, Menu, Heart, Repeat, Shuffle, X
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

  const nextSong = useCallback(() => {
    if (songs.length === 0) return;
    setIsPlaying(true);
    if (isShuffle && songs.length > 1) {
      let randomIndex = Math.floor(Math.random() * songs.length);
      while (randomIndex === currentIndex) {
        randomIndex = Math.floor(Math.random() * songs.length);
      }
      setCurrentIndex(randomIndex);
    } else {
      setCurrentIndex((prev) => (prev + 1) % songs.length);
    }
  }, [isShuffle, songs.length, currentIndex]);

  const prevSong = useCallback(() => {
    if (songs.length === 0) return;
    setIsPlaying(true);
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
  }, [songs.length]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 1;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      audioRef.current.currentTime = (x / rect.width) * audioRef.current.duration;
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetch("/api/songs")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const unique = [];
          const seen = new Set();
          for (const s of data) {
            if (!seen.has(s.title)) { seen.add(s.title); unique.push(s); }
          }
          setSongs(unique);
        }
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  // Playback Control
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  }, [isPlaying, currentIndex]);

  // Media Session & Metadata (Consolidated)
  useEffect(() => {
    if (!currentSong || typeof window === "undefined" || !("mediaSession" in navigator)) return;
    
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist || "My Music",
        artwork: [
          { src: currentSong.cover || "/asset/album-placeholder.png", sizes: "512x512", type: "image/png" }
        ]
      });

      navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler("previoustrack", prevSong);
      navigator.mediaSession.setActionHandler("nexttrack", nextSong);
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    } catch (e) {
      console.warn("MediaSession failed", e);
    }
  }, [currentSong, isPlaying, nextSong, prevSong]);

  // Back Button & Modal Handling (Simplified)
  useEffect(() => {
    const handlePopState = () => { if (isModalOpen) setIsModalOpen(false); };
    window.addEventListener("popstate", handlePopState);
    if (isModalOpen) window.history.pushState({ modal: true }, "");
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isModalOpen]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) return <div className="text-white p-8">Loading your music...</div>;
  if (!songs.length) return <div className="text-white p-8">No songs found.</div>;

  return (
    <div className="player-container">
      <audio
        ref={audioRef}
        src={currentSong?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={nextSong}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

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

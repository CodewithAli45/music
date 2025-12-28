export default function SongList({ songs, currentIndex, onSelect }) {
  return (
    <div className="song-list">
      {songs.slice(0, 5).map((song, index) => (
        <div
          key={song.public_id || song.url}
          className={`song-item ${
            index === currentIndex ? "active" : ""
          }`}
          onClick={() => onSelect(index)}
        >
          {song.title}
        </div>
      ))}
    </div>
  );
}

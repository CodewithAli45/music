import "./SongListModal.css";

export default function SongListModal({
  open,
  songs,
  currentIndex,
  onSelect,
  onClose
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()} // prevent close on inner click
      >
        <h3>Song List</h3>

        <div className="song-list">
          {songs.map((song, index) => (
            <div
              key={song.public_id}
              className={`song-row ${
                index === currentIndex ? "active" : ""
              }`}
              onClick={() => {
                onSelect(index);
                onClose();
              }}
            >
              <span className="sl">{index + 1}.</span>
              <span className="name">{song.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

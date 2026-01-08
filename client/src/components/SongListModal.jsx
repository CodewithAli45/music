import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import "./SongListModal.css";

export default function SongListModal({ open, songs, currentIndex, onSelect, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="modal-backdrop"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="modal-sheet"
          >
            <div className="modal-header">
              <h3>Playlist</h3>
              <button className="icon-btn close-btn" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="song-list">
              {songs.map((song, index) => (
                <motion.div
                  key={song.id || index}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`song-row ${index === currentIndex ? "active" : ""}`}
                  onClick={() => {
                    onSelect(index);
                    onClose();
                  }}
                >
                  <div className="song-index">
                    {index === currentIndex ? (
                      <div className="playing-indicator">
                        <motion.div 
                          animate={{ height: [4, 12, 6, 12, 4] }} 
                          transition={{ repeat: Infinity, duration: 0.6 }}
                          className="bar" 
                        />
                        <motion.div 
                          animate={{ height: [12, 4, 10, 4, 12] }} 
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className="bar" 
                        />
                        <motion.div 
                          animate={{ height: [6, 12, 4, 12, 6] }} 
                          transition={{ repeat: Infinity, duration: 0.7 }}
                          className="bar" 
                        />
                      </div>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="song-details">
                    <div className="song-name">{song.title}</div>
                    <div className="song-artist">Various Artists</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


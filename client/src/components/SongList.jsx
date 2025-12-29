import {React, useEffect} from 'react';
import { fetchSongs } from "../services/api";

export default function SongList() {

  const [listSong, setListSong] = React.useState([]);

  useEffect(() => {
      // fetchSongs().then(setSongs);
      fetchSongs().then((data) => {
        // 🔥 Normalize song name from public_id
        const normalized = data.map((s) => ({
          ...s,
          title:(s.public_id)
        }));
        console.log(normalized);
        setListSong(normalized);
      });
    }, []);
  return (
    <div> 
      <h1>SongList</h1>
      {listSong.map((song, index) => (
        <div key={index}>
          <p>{song.title}</p>
        </div>
      ))}
    </div>
  )
}

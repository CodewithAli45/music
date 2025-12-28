const API_BASE = "https://music45-5nbz.onrender.com/api";

export async function fetchSongs() {
  const res = await fetch(`${API_BASE}/songs`);
  console.log(res);
  
  if (!res.ok) {
    throw new Error("Failed to fetch songs");
  }
  return res.json();
}

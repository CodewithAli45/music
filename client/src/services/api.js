const API_BASE = "http://10.121.43.185:1986/api";

export async function fetchSongs() {
  const res = await fetch(`${API_BASE}/songs`);
  console.log(res);
  
  if (!res.ok) {
    throw new Error("Failed to fetch songs");
  }
  return res.json();
}

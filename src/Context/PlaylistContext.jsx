import { createContext, useState, useEffect } from "react";
import { getAllPlaylists } from "../services/playlistService";

export const PlaylistContext = createContext();

export default function PlaylistProvider({ children }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshPlaylists = async () => {
    setLoading(true);
    try {
      const res = await getAllPlaylists();
      if (res.success) {
        setPlaylists(res.data.map(item => ({ ...item, key: item._id })));
      }
    } catch (error) {
      console.error("Context Fetch Playlists Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPlaylists();
  }, []);

  return (
    <PlaylistContext.Provider value={{ playlists, loading, refreshPlaylists }}>
      {children}
    </PlaylistContext.Provider>
  );
}
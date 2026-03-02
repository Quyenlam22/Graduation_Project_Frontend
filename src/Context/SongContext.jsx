import { createContext, useState, useEffect } from "react";
import { getAllSongs } from "../services/songService";

export const SongContext = createContext();

export default function SongProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshSongs = async () => {
    setLoading(true);
    const res = await getAllSongs();
    if (res.success) setSongs(res.data);
    setLoading(false);
  };

  useEffect(() => {
    refreshSongs();
  }, []);

  return (
    <SongContext.Provider value={{ songs, loading, refreshSongs }}>
      {children}
    </SongContext.Provider>
  );
}
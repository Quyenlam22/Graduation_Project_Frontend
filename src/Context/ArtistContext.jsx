import { createContext, useState, useEffect } from "react";
import { getAllArtists } from "../services/artistService";

export const ArtistContext = createContext();

export default function ArtistProvider({ children }) {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshArtists = async () => {
    setLoading(true);
    try {
      const res = await getAllArtists();
      if (res.success) {
        setArtists(res.data.map(item => ({ ...item, key: item._id })));
      }
    } catch (error) {
      console.error("Context Fetch Artists Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshArtists();
  }, []);

  return (
    <ArtistContext.Provider value={{ artists, loading, refreshArtists }}>
      {children}
    </ArtistContext.Provider>
  );
}
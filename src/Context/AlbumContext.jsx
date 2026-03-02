import { createContext, useState, useEffect } from "react";
import { getAllAlbums } from "../services/albumService";

export const AlbumContext = createContext();

export default function AlbumProvider({ children }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshAlbums = async () => {
    setLoading(true);
    try {
      const res = await getAllAlbums();
      if (res.success) {
        setAlbums(res.data.map(item => ({ ...item, key: item._id })));
      }
    } catch (error) {
      console.error("Context Fetch Albums Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAlbums();
  }, []);

  return (
    <AlbumContext.Provider value={{ albums, loading, refreshAlbums }}>
      {children}
    </AlbumContext.Provider>
  );
}
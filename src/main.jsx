import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AuthProvider from './Context/AuthProvider';
import AppProvider from './Context/AppProvider';
import UserProvider from './Context/UserContext';
import SongProvider from './Context/SongContext';
import ArtistProvider from './Context/ArtistContext';
import AlbumProvider from './Context/AlbumContext';
import PlaylistProvider from './Context/PlaylistContext';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <AppProvider>
        <UserProvider>
          <SongProvider>
            <ArtistProvider>
              <AlbumProvider>
                <PlaylistProvider>
                  <App />
                </PlaylistProvider>
              </AlbumProvider>
            </ArtistProvider>
          </SongProvider>
        </UserProvider>
      </AppProvider>
    </AuthProvider>
  </BrowserRouter>
);
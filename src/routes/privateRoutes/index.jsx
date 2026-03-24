import { lazy } from "react";
import withSuspense from "../../utils/withSuspense";

// Layouts & Guards
import LayoutAdmin from "../../layouts/LayoutAdmin";
import LayoutClient from "../../layouts/LayoutClient";
import PrivateRouteClient from "../../components/PrivateRoute/client";
import PrivateRouteAdmin from "../../components/PrivateRoute/admin";

// Client Pages
const Home = lazy(() => import("../../pages/client/Home"));
const Album = lazy(() => import("../../pages/client/Album"));
const Playlist = lazy(() => import("../../pages/client/Playlist"));
const Artist = lazy(() => import("../../pages/client/Artist"));
const MyFavorite = lazy(() => import("../../pages/client/MyFavorite"));
const UserInfo = lazy(() => import("../../pages/client/UserInfo"));
const SearchResult = lazy(() => import("../../pages/client/SearchResult"));

// Admin Pages
const Dashboard = lazy(() => import("../../pages/admin/Dashboard"));
const AlbumManagement = lazy(() => import("../../pages/admin/Album"));
const PlaylistManagement = lazy(() => import("../../pages/admin/Playlist"));
const ArtistManagement = lazy(() => import("../../pages/admin/Artist"));
const SongManagement = lazy(() => import("../../pages/admin/Song"));
const UserManagement = lazy(() => import("../../pages/admin/User"));

// Common
const Error404 = lazy(() => import("../../pages/Error404"));

export const privateRoutes = [
    {
        path: "/",
        element: <LayoutClient />,
        children: [
            { index: true, element: withSuspense(Home) },
            { path: "/search-all", element: withSuspense(SearchResult) },
            { path: "/albums", element: withSuspense(Album) },
            { path: "/albums/:id", element: withSuspense(Album) },
            { path: "/playlists", element: withSuspense(Playlist) },
            { path: "/playlists/:id", element: withSuspense(Playlist) },
            { path: "/artists", element: withSuspense(Artist) },
            { path: "/artists/:id", element: withSuspense(Artist) },
            {
                element: <PrivateRouteClient />,
                children: [
                    { path: "/my-library", element: withSuspense(MyFavorite) },
                    { path: "/user-info", element: withSuspense(UserInfo) },
                ]
            },
            { path: "*", element: withSuspense(Error404) },
        ],
    },
    {
        path: "/admin",
        element: <LayoutAdmin />,
        children: [
            {
                element: <PrivateRouteAdmin />,
                children: [
                    { index: true, element: withSuspense(Dashboard) },
                    { path: "dashboard", element: withSuspense(Dashboard) },
                    { path: "albums", element: withSuspense(AlbumManagement) },
                    { path: "playlists", element: withSuspense(PlaylistManagement) },
                    { path: "artists", element: withSuspense(ArtistManagement) },
                    { path: "songs", element: withSuspense(SongManagement) },
                    { path: "users", element: withSuspense(UserManagement) },
                    { path: "*", element: withSuspense(Error404) },
                ]
            }   
        ]
    },
];
import { del, get, patch, post } from "../utils/request";

export const getAllPlaylists = async () => {
    const result = await get(`playlists/all-playlists`);
    return result;
}

export const createPlaylist = async (options) => {
    const result = await post(options, `playlists/create`);
    return result;
}

export const updatePlaylist = async (id, options) => {
    const result = await patch(options, `playlists/update/${id}`);
    return result;
}

export const deletePlaylists = async (id) => {
    const result = await del(`playlists/delete/${id}`);
    return result;
}
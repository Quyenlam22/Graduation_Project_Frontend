import { del, get, patch, post } from "../utils/request";

export const getAllSongs = async () => {
    const result = await get(`songs/all-songs`);
    return result;
}

export const createSong = async (options) => {
    const result = await post(options, `songs/create`);
    return result;
}

export const updateSongs = async (id, options) => {
    const result = await patch(options, `songs/update/${id}`);
    return result;
}

export const deleteSongs = async (id) => {
    const result = await del(`songs/delete/${id}`);
    return result;
}


export const getSongsBySource = async (endpoint) => {
    const result = await get(`${endpoint}`);
    return result;
}
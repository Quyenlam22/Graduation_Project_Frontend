import { get } from "../utils/request";

export const getSongs = async (songKey) => {
    const result = await get(`songs/search?query=${songKey}`);
    return result;
}

export const getSongsBySource = async (endpoint) => {
    const result = await get(`${endpoint}`);
    return result;
}
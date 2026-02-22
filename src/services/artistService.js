import { del, get, patch, post } from "../utils/request";

export const getArtist = async (artistKey) => {
    const result = await get(`artists/search?query=${artistKey}`);
    return result;
}

export const getAllArtists = async () => {
    const result = await get(`artists/all-artists`);
    return result;
}

export const createArtist = async (options) => {
    const result = await post(options, `artists/create`);
    return result;
}

export const updateArtist = async (id, options) => {
    const result = await patch(options, `artists/update/${id}`);
    return result;
}

export const deleteArtists = async (id) => {
    const result = await del(`artists/delete/${id}`);
    return result;
}
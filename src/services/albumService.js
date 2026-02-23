import { del, get, patch, post } from "../utils/request";

export const getAlbum = async (albumKey) => {
    const result = await get(`albums/search?query=${albumKey}`);
    return result;
}

export const getAllAlbums = async () => {
    const result = await get(`albums/all-albums`);
    return result;
}

export const createAlbum = async (options) => {
    const result = await post(options, `albums/create`);
    return result;
}

export const updateAlbum = async (id, options) => {
    const result = await patch(options, `albums/update/${id}`);
    return result;
}

export const deleteAlbums = async (id) => {
    const result = await del(`albums/delete/${id}`);
    return result;
}
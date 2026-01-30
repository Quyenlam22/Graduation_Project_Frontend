import { get } from "../utils/request";

export const getAlbum = async (albumKey) => {
    const result = await get(`albums/search?query=${albumKey}`);
    return result;
}
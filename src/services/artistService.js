import { get } from "../utils/request";

export const getArtist = async (artistKey) => {
    const result = await get(`artists/search?query=${artistKey}`);
    return result;
}
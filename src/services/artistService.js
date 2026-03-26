import { del, get, patch, post } from "../utils/request";

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

export const getFavoriteArtistsDetail = async (listId) => {
    const result = await post({ ids: listId }, `artists/get-artists-by-ids`);
    return result;
}
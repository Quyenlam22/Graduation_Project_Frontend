import { get } from "../utils/request";

export const searchDeezer = async (keyword) => {
    const result = await get(`search/external?q=${keyword}`);
    return result;
}
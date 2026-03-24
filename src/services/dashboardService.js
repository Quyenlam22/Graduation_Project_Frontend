import { get } from "../utils/request";

export const overview = async () => {
    const result = await get(`dashboard/overview`);
    return result;
};
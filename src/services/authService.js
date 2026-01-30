import { get, post } from "../utils/request";

export const login = async (options) => {
    const result = await post(options, `users/login`);
    return result;
}

export const register = async (options) => {
    const result = await post(options, `users/register`);
    return result;
}

export const infoUser = async (id) => {
    const result = await get(`users/${id}`);
    return result;
}

export const changeStatus = async (options) => {
    const result = await post(options, `users/status`);
    return result;
}
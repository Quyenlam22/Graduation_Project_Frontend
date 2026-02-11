import { del, get, patch, post } from "../utils/request";

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

export const updateProfile = async (options) => {
    const result = await patch(options, `users/update-profile`);
    return result;
}

export const getAllUsers = async () => {
    const result = await get(`users/all-users`);
    return result;
}

export const createAdmin = async (options) => {
    const result = await post(options, `users/create-admin`);
    return result;
}

export const updateUser = async (id, options) => {
    const result = await patch(options, `users/update/${id}`);
    return result;
}

export const deleteUser = async (id) => {
    const result = await del(`users/delete/${id}`);
    return result;
}

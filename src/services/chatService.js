import { post } from "../utils/request";

export const sendChatMessage = async (options) => {
    const result = await post(options, `chatbot`);
    return result;
};
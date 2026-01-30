const API_DOMAIN = import.meta.env.VITE_APP_API;

// Hàm hỗ trợ lấy Header
const getHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Accept": "application/json",
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

// Hàm xử lý Response chung (Bắt lỗi 401, 403)
const handleResponse = async (response) => {
  if (response.status === 401) {
    // Token hết hạn hoặc không hợp lệ
    localStorage.removeItem("accessToken");
    // window.location.href = "/auth"; 
    return null;
  }
  return await response.json();
};

export const get = async (path) => {
  const response = await fetch(`${API_DOMAIN}/${path}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const post = async (options, path) => {
  const response = await fetch(`${API_DOMAIN}/${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(options),
  });
  return handleResponse(response);
};

export const del = async (path) => {
  const response = await fetch(`${API_DOMAIN}/${path}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const patch = async (options, path) => {
  const response = await fetch(`${API_DOMAIN}/${path}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(options),
  });
  return handleResponse(response);
};
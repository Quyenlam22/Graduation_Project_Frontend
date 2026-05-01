const API_DOMAIN = import.meta.env.VITE_APP_API;

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem("accessToken");
  const headers = {
    "Accept": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem("accessToken");
    return { success: false, status: 401, message: "Unauthorized" };
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { success: false, ...errorData };
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
  const isFormData = options instanceof FormData;

  const response = await fetch(`${API_DOMAIN}/${path}`, {
    method: "POST",
    headers: getHeaders(isFormData),
    body: isFormData ? options : JSON.stringify(options),
  });
  return handleResponse(response);
};

export const patch = async (options, path) => {
  const isFormData = options instanceof FormData;

  const response = await fetch(`${API_DOMAIN}/${path}`, {
    method: "PATCH",
    headers: getHeaders(isFormData),
    body: isFormData ? options : JSON.stringify(options),
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
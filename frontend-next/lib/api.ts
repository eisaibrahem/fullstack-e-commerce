import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://fullstack-e-commerce-beta.vercel.app/";

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);

export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await client.request({
    url: path,
    method: options.method || "GET",
    data: options.body,
  });

  const body = response.data;
  if (body?.data !== undefined) {
    return body.data;
  }
  return body as T;
}

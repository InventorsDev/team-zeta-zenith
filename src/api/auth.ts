import axios from "axios";
import { getAccessToken, setAccessToken } from "../utils/tokenStore";
import { BASE_URL, ENDPOINTS } from "../config/endpoints";

export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true //for cookies
});

let isRefreshing = false;

let pendingRequests: Array<(t: string | null) => void> = [];

api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    r => r,
    async (error) => {
        const original = error.config;

        if (error.response.status === 401 && !original._retry) {

            original._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const { data } = await api.post(ENDPOINTS.auth.refresh);
                    setAccessToken(data.setAccessToken);
                    pendingRequests.forEach(request => request(data.accessToken));

                    pendingRequests = [];

                    return api(original)
                } catch (error) {

                    pendingRequests.forEach(request => request(null));
                    pendingRequests = [];

                    setAccessToken(null);

                    return Promise.reject(error)
                }
                finally {
                    isRefreshing = false;
                }
            }

            return new Promise((resolve, reject) => {
                pendingRequests.push((token) => {
                    if (token) {
                        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${token}` }
                        resolve(api(original))
                    } else {
                        reject(error)
                    }
                })

            })

        }
    }
)


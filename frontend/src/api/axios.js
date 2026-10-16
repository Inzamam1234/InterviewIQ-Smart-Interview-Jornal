import axios from "axios";

const baseURL =
    import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
    baseURL: baseURL.replace(/\/$/, ""),
    headers: {
        "Content-Type": "application/json",
    },
});


/* -------------------------------- */
/* Add JWT to protected requests    */
/* -------------------------------- */

api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        /*
         * IMPORTANT:
         * Do NOT send an old JWT when logging in.
         */
        if (config.url === "/auth/login" || config.url === "/auth/register") {

            delete config.headers.Authorization;

            return config;
        }


        if (token) {

            config.headers.Authorization = `Bearer ${token}`;

        }


        return config;

    },

    (error) => Promise.reject(error)
);


/* -------------------------------- */
/* Handle expired / invalid JWT     */
/* -------------------------------- */

api.interceptors.response.use(

    (response) => response,

    (error) => {

        const status = error.response?.status;

        /*
         * 401 = Unauthorized
         *
         * Usually means:
         * - JWT expired
         * - JWT invalid
         * - Authentication missing
         */

        if (
            status === 401 &&
            !error.config?.url?.includes("/auth/login")
        ) {

            console.log("Session expired. Redirecting to login...");

            // Remove invalid JWT
            localStorage.removeItem("token");

            // Redirect to login
            window.location.href = "/login";

        }

        /*
         * IMPORTANT:
         *
         * Do NOT automatically logout on 403.
         *
         * 403 usually means the user is authenticated
         * but does not have permission to access something.
         */

        return Promise.reject(error);

    }
);


export default api;

import axios from "axios";
const baseURL = `http://localhost:8000/api/`;
const axiosInstance = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true
});

export default axiosInstance;
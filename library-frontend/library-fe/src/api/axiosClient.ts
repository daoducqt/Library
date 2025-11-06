
import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // nếu backend dùng cookie-auth; nếu không thì false
});

// Response interceptor trả về response.data trực tiếp
axiosClient.interceptors.response.use(
  (response) => response, // ta xử lý .data ở repository để tiện kiểm soát
  (error) => {
    // Ở đây ta không throw trực tiếp để repository có thể xử lý cụ thể
    return Promise.reject(error);
  }
);

export default axiosClient;
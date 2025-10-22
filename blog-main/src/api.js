import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // your NestJS backend
});

export default api;

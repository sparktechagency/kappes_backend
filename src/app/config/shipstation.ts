import axios from "axios";

export const shipstation = axios.create({
  baseURL: "https://ssapi.shipstation.com",
  auth: {
    username: process.env.SHIPSTATION_API_KEY!,
    password: process.env.SHIPSTATION_API_SECRET!,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

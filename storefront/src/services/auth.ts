import api from "@/lib/axios";
import { urls } from "@config";

async function login(email: string, password: string) {
  try {
    const response = api(urls.loginUrl);
  } catch (error) {}
}

async function logout() {
  try {
  } catch (error) {}
}

export { login, logout };

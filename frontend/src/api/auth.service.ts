import { API_BASE_URL } from "../constants/Api.constants";

export const login = async (email: string) => {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json(); // returns { access_token, user }
};

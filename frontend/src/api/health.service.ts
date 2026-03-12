import { API_BASE_URL } from "../constants/Api.constants";
import { http } from "./http";

type IResponse = { status: string };

export async function checkHealth() {
  const response = await http<IResponse>(`/health`);
  console.log("Health Status:", response.status);
}

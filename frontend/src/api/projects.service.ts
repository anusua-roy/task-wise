import { IProject } from "../types/project.type";
import { http } from "./http";

export function getProjects() {
  return http<IProject[]>("/api/projects/");
}

export function createProject(data: {
  name: string;
  description?: string;
  member_ids: string[];
}) {
  return http<IProject>("/api/projects/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export const getProjectById = async (id: string) => {
  return http<IProject>(`/api/projects/${id}`);
};

export function updateProject(
  id: string,
  data: { name: string; description?: string },
) {
  return http(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProject(id: string) {
  return http(`/api/projects/${id}`, {
    method: "DELETE",
  });
}

export const addProjectMember = (projectId: string, user_id: string) =>
  http(`/api/projects/${projectId}/members`, {
    method: "POST",
    body: JSON.stringify({ user_id }),
  });

export const removeProjectMember = (projectId: string, userId: string) =>
  http(`/api/projects/${projectId}/members/${userId}`, {
    method: "DELETE",
  });
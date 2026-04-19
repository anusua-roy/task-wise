export const isAdmin = (user: any) => user?.role === "Admin";
export const isCreator = (user: any) => user?.role === "Task Creator";
export const canCreateTask = (user: any) => isAdmin(user) || isCreator(user);
export const canEditProject = (user: any, project: any) =>
  isAdmin(user) || project?.created_by?.id === user?.id;

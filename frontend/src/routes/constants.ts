export const ROUTE_NAMES: any = {
  ROOT: "/",
  SIGNIN: "/signin",
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",
  PROJECT: (id: string) => `/projects/${id}`,
  TASKS: "/tasks",
  USERS: "/users",
  SETTINGS: "/settings",
};

export const ROUTE_META = [
  {
    test: (p: string) => p === ROUTE_NAMES.ROOT || p === ROUTE_NAMES.DASHBOARD,
    title: "Dashboard",
    description: "Here's a summary of your projects and tasks.",
  },
  {
    test: (p: string) => p === ROUTE_NAMES.PROJECTS,
    title: "Projects",
    description: "Browse and manage your projects.",
  },
  {
    test: (p: string) => p.startsWith(ROUTE_NAMES.PROJECT("")),
    title: "Project Details",
    description: "Detailed view of the selected project and its tasks.",
  },
  {
    test: (p: string) => p.startsWith(ROUTE_NAMES.TASKS),
    title: "My Tasks",
    description: "Tasks assigned to you and your current progress.",
  },
  {
    test: (p: string) => p.startsWith(ROUTE_NAMES.SETTINGS),
    title: "Settings",
    description: "Manage your account and application settings.",
  },
];
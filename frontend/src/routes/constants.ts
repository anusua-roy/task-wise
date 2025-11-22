export const ROUTE_NAMES: any = {
  ROOT: "/",
  SIGNIN: "/signin",
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",
  PROJECT: (id: string) => `/projects/${id}`,
  TASKS: "/tasks",
  USERS: "/users",
  SETTINGS: "/settings",
  PROFILE: "/profile",
};

export const ROUTE_META = [
  {
    test: (p: string) => p === ROUTE_NAMES.ROOT || p === ROUTE_NAMES.DASHBOARD,
    title: "Dashboard",
    description: "Overview of your workspace, projects, and tasks.",
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
    test: (p: string) => p.startsWith(ROUTE_NAMES.USERS),
    title: "User Management",
    description: "Manage users, roles, and access.",
  },
  {
    test: (p: string) => p.startsWith(ROUTE_NAMES.PROFILE),
    title: "Profile",
    description: "View and update your personal information.",
  },
  {
    test: (p: string) => p.startsWith(ROUTE_NAMES.SETTINGS),
    title: "Settings",
    description: "Manage your account and application settings.",
  },
];

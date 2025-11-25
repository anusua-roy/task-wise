import { SIDEBAR_OPTIONS, OTHER_PAGE_NAMES, PAGE_DESCRIPTIONS } from "../constants/App.constants";

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
    title: SIDEBAR_OPTIONS.DASHBOARD,
    description: PAGE_DESCRIPTIONS.DASHBOARD,
  },
  {
    test: (p: string) => p === ROUTE_NAMES.PROJECTS,
    title: SIDEBAR_OPTIONS.PROJECTS,
    description: PAGE_DESCRIPTIONS.PROJECTS,
  },
  {
    test: (p: string) => p.startsWith(ROUTE_NAMES.PROJECT("")),
    title: OTHER_PAGE_NAMES.PROJECT,
    description: PAGE_DESCRIPTIONS.PROJECT,
  },
  {
    test: (p: string) => p.startsWith(ROUTE_NAMES.TASKS),
    title: SIDEBAR_OPTIONS.TASKS,
    description: PAGE_DESCRIPTIONS.TASKS,
  },
  {
    test: (p: string) => p.startsWith(ROUTE_NAMES.USERS),
    title: SIDEBAR_OPTIONS.USERS,
    description: PAGE_DESCRIPTIONS.USERS,
  },
  {
    test: (p: string) => p.startsWith(ROUTE_NAMES.PROFILE),
    title: OTHER_PAGE_NAMES.PROFILE,
    description: PAGE_DESCRIPTIONS.PROFILE,
  },
  {
    test: (p: string) => p.startsWith(ROUTE_NAMES.SETTINGS),
    title: SIDEBAR_OPTIONS.SETTINGS,
    description: PAGE_DESCRIPTIONS.SETTINGS,
  },
];

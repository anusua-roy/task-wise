import { Task } from "../types/task";

export const PROJECTS = [
  {
    id: "proj-1",
    title: "TaskWise App Development",
    description: "Main development project",
    tasks: [
      {
        id: "t1",
        title: "Design login page",
        assignee: "Anusua",
        status: "done",
        due: "2024-08-10",
        priority: "medium",
      },
      {
        id: "t2",
        title: "Auth API integration",
        assignee: "James Smith",
        status: "inprogress",
        due: "2024-09-01",
        priority: "high",
      },
      {
        id: "t3",
        title: "Write unit tests",
        assignee: undefined,
        status: "todo",
        due: undefined,
        priority: "low",
      },
    ] as Task[],
  },

  {
    id: "proj-2",
    title: "Backend API Service",
    description: "APIs for clients",
    tasks: [
      {
        id: "b1",
        title: "Auth endpoints",
        assignee: "Priya",
        status: "done",
        due: "2024-07-20",
        priority: "high",
      },
      {
        id: "b2",
        title: "Reports engine",
        assignee: "Ravi",
        status: "done",
        due: "2024-07-25",
        priority: "medium",
      },
      {
        id: "b3",
        title: "Rate limiting",
        assignee: "Ravi",
        status: "todo",
        due: "2024-10-01",
        priority: "medium",
      },
    ] as Task[],
  },

  {
    id: "proj-3",
    title: "Marketing Campaign Q3",
    description: "Campaign planning",
    tasks: [
      {
        id: "m1",
        title: "Draft creative brief",
        assignee: "Sana",
        status: "inprogress",
        due: "2024-08-15",
        priority: "medium",
      },
      {
        id: "m2",
        title: "Poster assets",
        assignee: undefined,
        status: "todo",
        due: undefined,
        priority: "low",
      },
    ] as Task[],
  },
];

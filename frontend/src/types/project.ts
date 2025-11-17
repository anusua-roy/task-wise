export type PROJECT_TYPE = {
  id: string;
  title: string;
  description?: string;
  tasks?: { id: string; title: string; done: boolean }[];
};
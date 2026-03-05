import React from "react";
import { TASK_STATUS } from "../constants/App.constants";

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const base = "px-2 py-1 text-xs rounded-md font-medium inline-block";

  const styles: Record<string, string> = {
    [TASK_STATUS.NEW]: "bg-slate-100 text-slate-800",
    [TASK_STATUS.IN_PROGRESS]: "bg-yellow-100 text-yellow-800",
    [TASK_STATUS.BLOCKED]: "bg-red-100 text-red-700",
    [TASK_STATUS.DONE]: "bg-green-100 text-green-700",
  };

  return (
    <span className={`${base} ${styles[status] || styles[TASK_STATUS.NEW]}`}>
      {status}
    </span>
  );
}

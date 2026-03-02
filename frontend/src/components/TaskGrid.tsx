import React from "react";
import { TASK_STATUS, TASK_TABLE } from "../constants/App.constants";
import { Task } from "../types/task.type";

interface Props {
  tasks: Task[];
}

export default function TaskGrid({ tasks }: Props) {
  return (
    <div className="table w-full" style={{ marginTop: 12 }}>
      <div className="row" style={{ fontWeight: 600 }}>
        <div style={{ flex: 2 }}>{TASK_TABLE.TITLE}</div>
        <div style={{ flex: 2 }}>{TASK_TABLE.DESCRIPTION}</div>
        <div style={{ flex: 1 }}>{TASK_TABLE.STATUS}</div>
      </div>

      {tasks.map((task: any) => (
        <div className="row" key={task.id}>
          <div style={{ flex: 2 }}>{task.title}</div>
          <div style={{ flex: 2 }}>{task.description}</div>
          <div style={{ flex: 1 }}>
            <span
              className={
                "px-2 py-1 text-xs rounded-md " +
                (task.status === TASK_STATUS.DONE
                  ? "bg-green-100 text-green-700"
                  : task.status === TASK_STATUS.IN_PROGRESS
                  ? "bg-yellow-100 text-yellow-800"
                  : task.status === TASK_STATUS.BLOCKED
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-800")
              }
            >
              {task.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

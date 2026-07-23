"use client";

import type { TaskNode } from "@/lib/task-tree";
import styles from "./NextActionCard.module.css";

export function NextActionCard({
  task,
  onComplete,
  onOpenAddSubtask,
}: {
  task: TaskNode | null;
  onComplete: (task: TaskNode) => void;
  onOpenAddSubtask: (taskId: string) => void;
}) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>Next step</p>
      {task ? (
        <div className={styles.taskRow}>
          <span className={styles.taskTitle}>{task.title}</span>
          <div className={styles.actions}>
            <button
              onClick={() => onOpenAddSubtask(task.id)}
              className={styles.plusButton}
              aria-label="Add subtask"
            >
              +
            </button>
            <button
              onClick={() => onComplete(task)}
              className={styles.checkButton}
              aria-label="Complete task"
            >
              <svg width="24" height="24" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M4 8.5 L7 11.5 L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <p className={styles.empty}>Nothing left! Add a task to get started.</p>
      )}
    </div>
  );
}

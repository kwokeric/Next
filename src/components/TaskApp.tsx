"use client";

import { useMemo, useState } from "react";
import type { Task, Project } from "@prisma/client";
import { buildTaskTree, findNextTask, getTaskProgress, type TaskNode } from "@/lib/task-tree";
import { createTask, updateTask, deleteTask, breakdownTask } from "@/lib/api-client";
import { NextActionCard } from "./NextActionCard";
import { TaskRow } from "./TaskRow";
import { AddTaskModal } from "./AddTaskModal";
import styles from "./TaskApp.module.css";

export function TaskApp({
  project,
  initialTasks,
}: {
  project: Project;
  initialTasks: Task[];
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [breakingDownIds, setBreakingDownIds] = useState<Set<string>>(new Set());

  // One modal instance for the whole page, shared by every "+" (row, Next
  // Step panel, and the floating add-task button). undefined = closed;
  // null = open, adding a root task; a task id = open, adding its subtask.
  const [addTaskParentId, setAddTaskParentId] = useState<string | null | undefined>(
    undefined
  );

  const tree = useMemo(() => buildTaskTree(tasks), [tasks]);
  const nextTask = useMemo(() => findNextTask(tree), [tree]);
  const activeTasks = useMemo(
    () => tree.filter((task) => getTaskProgress(task) < 1),
    [tree]
  );
  const completedTasks = useMemo(
    () => tree.filter((task) => getTaskProgress(task) >= 1),
    [tree]
  );

  function upsertTasks(newTasks: Task[]) {
    setTasks((prev) => {
      const byId = new Map(prev.map((t) => [t.id, t]));
      for (const t of newTasks) byId.set(t.id, t);
      return Array.from(byId.values());
    });
  }

  function openAddTaskModal(parentTaskId: string | null) {
    setAddTaskParentId(parentTaskId);
  }

  async function handleAddTask(title: string) {
    const task = await createTask(project.id, {
      title,
      parentTaskId: addTaskParentId ?? null,
    });
    upsertTasks([task]);
  }

  async function handleToggleStatus(task: TaskNode) {
    const nextStatus = task.status === "DONE" ? "TODO" : "DONE";
    const updated = await updateTask(task.id, { status: nextStatus });
    upsertTasks(updated);
  }

  async function handleBreakdown(taskId: string) {
    setBreakingDownIds((prev) => new Set(prev).add(taskId));
    try {
      const subtasks = await breakdownTask(taskId);
      upsertTasks(subtasks);
    } finally {
      setBreakingDownIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  }

  async function handleEdit(task: TaskNode, title: string) {
    const updated = await updateTask(task.id, { title });
    upsertTasks(updated);
  }

  async function handleDelete(task: TaskNode) {
    await deleteTask(task.id);
    const idsToRemove = new Set<string>();

    // Recursively add subtasks to idsToRemove
    const collect = (node: TaskNode) => {
      idsToRemove.add(node.id);
      node.subtasks.forEach(collect);
    };
    collect(task);
    setTasks((prev) => prev.filter((t) => !idsToRemove.has(t.id)));
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tasks</h1>

      <h2 className={styles.sectionHeader}>Active</h2>
      <ul className={styles.taskList}>
        {activeTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            depth={0}
            isNextTask={task.id === nextTask?.id}
            nextTaskId={nextTask?.id ?? null}
            onToggleStatus={handleToggleStatus}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenAddSubtask={openAddTaskModal}
          />
        ))}
      </ul>

      {completedTasks.length > 0 && (
        <>
          <h2 className={styles.sectionHeader}>Completed</h2>
          <ul className={styles.taskList}>
            {completedTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                depth={0}
                isNextTask={task.id === nextTask?.id}
                nextTaskId={nextTask?.id ?? null}
                onToggleStatus={handleToggleStatus}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onOpenAddSubtask={openAddTaskModal}
              />
            ))}
          </ul>
        </>
      )}

      <button
        onClick={() => openAddTaskModal(null)}
        className={styles.addTaskButton}
        aria-label="Add task"
      >
        +
      </button>

      {addTaskParentId !== undefined && (
        <AddTaskModal
          parentTaskId={addTaskParentId}
          onAdd={handleAddTask}
          onSuggest={
            addTaskParentId ? () => handleBreakdown(addTaskParentId) : undefined
          }
          isBreakingDown={addTaskParentId ? breakingDownIds.has(addTaskParentId) : false}
          onClose={() => setAddTaskParentId(undefined)}
        />
      )}

      <div className={styles.nextStepBar}>
        <div className={styles.nextStepBarInner}>
          <NextActionCard
            task={nextTask}
            onComplete={handleToggleStatus}
            onOpenAddSubtask={openAddTaskModal}
          />
        </div>
      </div>
    </div>
  );
}

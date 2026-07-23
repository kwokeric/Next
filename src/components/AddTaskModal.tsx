"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import styles from "./AddTaskModal.module.css";

// Used both for adding a root-level task (parentTaskId: null) and a
// subtask (parentTaskId: string). Suggest (AI breakdown) is only offered
// when adding a subtask — it operates on the existing parent task, so
// there's nothing for it to do when there's no parent yet.
export function AddTaskModal({
  parentTaskId,
  onAdd,
  onSuggest,
  isBreakingDown,
  onClose,
}: {
  parentTaskId: string | null;
  onAdd: (title: string) => void;
  onSuggest?: () => Promise<void>;
  isBreakingDown?: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const isSubtask = parentTaskId !== null;

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim());
    onClose();
  }

  async function handleSuggest() {
    if (!onSuggest) return;
    await onSuggest();
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>{isSubtask ? "Add subtask" : "Add task"}</h2>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
        />
        <div className={styles.actions}>
          <button type="submit" className={styles.addButton}>
            Add
          </button>
          {onSuggest && (
            <button
              type="button"
              onClick={handleSuggest}
              disabled={isBreakingDown}
              className={styles.suggestButton}
            >
              {isBreakingDown ? "Suggesting…" : "Suggest"}
            </button>
          )}
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

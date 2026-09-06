import React, { useState } from "react";
import { useApp } from "../store/AppContext";
import { Modal } from "./Modal";
import { Button, StatusDot } from "./primitives";
import { DynIcon } from "./iconset";

export function CategoryManagerModal({ open, onClose }) {
  const { state, api } = useApp();
  const categories = state.categories || [];

  const [editingId, setEditingCatId] = useState(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("target");
  const [isCreating, setIsCreating] = useState(false);

  function startCreate() {
    setName("");
    setIcon("target");
    setIsCreating(true);
    setEditingCatId(null);
  }

  function startEdit(cat) {
    setName(cat.name);
    setIcon(cat.icon || "target");
    setEditingCatId(cat.id);
    setIsCreating(false);
  }

  function saveCategory() {
    if (!name.trim()) return;
    if (isCreating) {
      api.addCategory({ name: name.trim(), icon, color: null });
    } else if (editingId) {
      api.updateCategory(editingId, { name: name.trim(), icon });
    }
    setIsCreating(false);
    setEditingCatId(null);
    setName("");
  }

  function moveCategory(index, direction) {
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= categories.length) return;
    const list = [...categories];
    const temp = list[index];
    list[index] = list[nextIdx];
    list[nextIdx] = temp;
    api.reorderCategories(list.map((c) => c.id));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Category Manager"
      sys="CATEGORY TAXONOMY"
      footer={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="stack" style={{ gap: 16 }}>
        <div className="spread">
          <span className="small t2">Your Categories ({categories.length})</span>
          {!isCreating && !editingId && (
            <Button variant="primary" size="small" onClick={startCreate}>
              + New Category
            </Button>
          )}
        </div>

        {/* Create / Edit Form */}
        {(isCreating || editingId) && (
          <div
            className="stack p3"
            style={{
              gap: 12,
              background: "var(--surface-1)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--r-2)",
            }}
          >
            <div className="spread">
              <span className="mono small t1">
                {isCreating ? "CREATE CATEGORY" : "EDIT CATEGORY"}
              </span>
              <button
                type="button"
                className="btn btn--ghost small"
                onClick={() => {
                  setIsCreating(false);
                  setEditingCatId(null);
                }}
              >
                Cancel
              </button>
            </div>

            <div className="row-flex spread" style={{ gap: 12 }}>
              <input
                className="input grow"
                placeholder="Category Name (e.g. Mental Discipline, Fitness)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <select
                className="input"
                style={{ width: 120 }}
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              >
                {["target", "spark", "zap", "eye", "shield", "moon", "book", "briefcase", "pulse", "grid"].map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>

            <div className="row-flex end mt1">
              <Button variant="primary" disabled={!name.trim()} onClick={saveCategory}>
                Save Category
              </Button>
            </div>
          </div>
        )}

        {/* Category List */}
        <div className="stack" style={{ gap: 8 }}>
          {categories.map((cat, idx) => {
            const actionCount = (state.actions || []).filter(
              (a) => !a.archived && a.categoryId === cat.id
            ).length;

            return (
              <div
                key={cat.id}
                className="row-flex spread"
                style={{
                  padding: "10px 12px",
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-2)",
                }}
              >
                <div className="row-flex" style={{ gap: 10 }}>
                  <DynIcon name={cat.icon} size={16} />
                  <span style={{ fontWeight: 550, fontSize: 14 }}>{cat.name}</span>
                  <span className="tag tag--mono small">
                    {actionCount} {actionCount === 1 ? "action" : "actions"}
                  </span>
                </div>

                <div className="row-flex" style={{ gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn--ghost small"
                    disabled={idx === 0}
                    onClick={() => moveCategory(idx, -1)}
                    style={{ padding: "2px 6px" }}
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost small"
                    disabled={idx === categories.length - 1}
                    onClick={() => moveCategory(idx, 1)}
                    style={{ padding: "2px 6px" }}
                    title="Move Down"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost small"
                    onClick={() => startEdit(cat)}
                    style={{ padding: "2px 8px" }}
                  >
                    Edit
                  </button>
                  {categories.length > 1 && (
                    <button
                      type="button"
                      className="btn btn--ghost small"
                      style={{ color: "var(--neg)", padding: "2px 8px" }}
                      onClick={() => api.deleteCategory(cat.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

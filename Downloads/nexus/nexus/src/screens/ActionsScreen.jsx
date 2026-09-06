import React, { useState } from "react";
import { useApp } from "../store/AppContext";
import { ScreenHeader } from "../components/common";
import {
  IconPlus,
  IconChevronRight,
  IconCheck,
  IconSettings,
  IconArchive,
  IconEdit,
  IconTarget,
  IconClock,
} from "../components/icons";
import {
  Button,
  Panel,
  SysLabel,
  StatusDot,
  Tick,
  Empty,
} from "../components/primitives";
import { DynIcon } from "../components/iconset";
import { ACTION_TYPES, VALENCE } from "../data/constants";
import { dateKey } from "../lib/time";
import { isScheduledOn, isComplete, logEntry } from "../lib/selectors";
import { fmt } from "../lib/format";

import { ActionEditorModal } from "../components/ActionEditorModal";
import { CategoryManagerModal } from "../components/CategoryManagerModal";
import { ActionDetailModal } from "../components/ActionDetailModal";
import { ActionCompletionModal } from "../components/ActionCompletionModal";

export default function ActionsScreen() {
  const { state, api } = useApp();
  const tk = dateKey();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingAction, setEditingAction] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  const [catManagerOpen, setCatManagerOpen] = useState(false);

  const [completionOpen, setCompletionOpen] = useState(false);
  const [completionAction, setCompletionAction] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showArchived, setShowArchived] = useState(false);

  const categories = state.categories || [];
  const allActions = state.actions || [];

  const activeActions = allActions.filter((a) => !a.archived);
  const archivedActions = allActions.filter((a) => a.archived);

  const displayedActions = (showArchived ? archivedActions : activeActions).filter(
    (a) => {
      if (selectedCategory !== "all" && a.categoryId !== selectedCategory)
        return false;
      if (selectedType !== "all" && a.type !== selectedType) return false;
      return true;
    }
  );

  function handleOpenCreate() {
    setEditingAction(null);
    setEditorOpen(true);
  }

  function handleOpenEdit(a, e) {
    if (e) e.stopPropagation();
    setEditingAction(a);
    setEditorOpen(true);
  }

  function handleOpenDetail(a) {
    setSelectedAction(a);
    setDetailOpen(true);
  }

  function handleTriggerCompletion(a, e) {
    if (e) e.stopPropagation();
    const isDone = isComplete(state, a, tk);

    if (
      ["quantity", "duration", "count", "scale", "journal", "event"].includes(a.type) ||
      (a.customFields && a.customFields.length > 0)
    ) {
      setCompletionAction(a);
      setCompletionOpen(true);
    } else {
      if (isDone) {
        api.uncompleteAction(a, { dateKey: tk });
      } else {
        api.completeAction(a, 1, { dateKey: tk });
      }
    }
  }

  return (
    <main className="screen">
      <ScreenHeader
        sys="PERSONAL BEHAVIOR OS"
        title="Actions"
        right={
          <div className="row-flex" style={{ gap: 8 }}>
            <Button
              variant="secondary"
              onClick={() => setCatManagerOpen(true)}
              title="Categories"
            >
              Categories
            </Button>
            <Button variant="primary" onClick={handleOpenCreate}>
              <IconPlus size={16} /> Create Action
            </Button>
          </div>
        }
        sub="Your personal behavior library. Build completely custom habits, boundaries, metrics, and tracking workflows — nothing is fixed or hardcoded."
      />

      {/* Top Stat Summary Grid */}
      <section className="section mb4">
        <div
          className="stat-grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}
        >
          <div className="stat">
            <SysLabel>ACTIVE ACTIONS</SysLabel>
            <div className="mono mt1" style={{ fontSize: 24, fontWeight: 600 }}>
              {activeActions.length}
            </div>
          </div>

          <div className="stat">
            <SysLabel>CATEGORIES</SysLabel>
            <div className="mono mt1" style={{ fontSize: 24, fontWeight: 600 }}>
              {categories.length}
            </div>
          </div>

          <div className="stat">
            <SysLabel>SCHEDULED TODAY</SysLabel>
            <div className="mono mt1 status-ok" style={{ fontSize: 24, fontWeight: 600 }}>
              {activeActions.filter((a) => isScheduledOn(a, new Date())).length}
            </div>
          </div>

          <div className="stat">
            <SysLabel>ARCHIVED</SysLabel>
            <div className="mono mt1 t3" style={{ fontSize: 24, fontWeight: 600 }}>
              {archivedActions.length}
            </div>
          </div>
        </div>
      </section>

      {/* View Switcher: Active vs Archived */}
      <div className="spread mb3">
        <div className="seg" style={{ height: 32, padding: 2 }}>
          <button
            type="button"
            className={`seg__btn ${!showArchived ? "is-active" : ""}`}
            onClick={() => setShowArchived(false)}
            style={{ fontSize: 12, padding: "2px 12px" }}
          >
            ACTIVE ({activeActions.length})
          </button>
          <button
            type="button"
            className={`seg__btn ${showArchived ? "is-active" : ""}`}
            onClick={() => setShowArchived(true)}
            style={{ fontSize: 12, padding: "2px 12px" }}
          >
            ARCHIVED ({archivedActions.length})
          </button>
        </div>

        <Button
          variant="ghost"
          size="small"
          onClick={() => setCatManagerOpen(true)}
        >
          + Manage Categories
        </Button>
      </div>

      {/* Category Filter Chips */}
      <div
        className="row-flex mb3"
        style={{ gap: 6, overflowX: "auto", paddingBottom: 4 }}
      >
        <button
          type="button"
          className={`tag tag--interactive ${
            selectedCategory === "all" ? "tag--active" : ""
          }`}
          onClick={() => setSelectedCategory("all")}
          style={{ cursor: "pointer" }}
        >
          All Categories ({showArchived ? archivedActions.length : activeActions.length})
        </button>

        {categories.map((c) => {
          const count = (showArchived ? archivedActions : activeActions).filter(
            (a) => a.categoryId === c.id
          ).length;

          return (
            <button
              key={c.id}
              type="button"
              className={`tag tag--interactive ${
                selectedCategory === c.id ? "tag--active" : ""
              }`}
              onClick={() => setSelectedCategory(c.id)}
              style={{ cursor: "pointer" }}
            >
              {c.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Type Filter Segmented Bar */}
      <div className="seg mb4" style={{ height: 32, padding: 2, overflowX: "auto" }}>
        <button
          type="button"
          className={`seg__btn ${selectedType === "all" ? "is-active" : ""}`}
          style={{ fontSize: 11, padding: "2px 8px" }}
          onClick={() => setSelectedType("all")}
        >
          ALL TYPES
        </button>

        {Object.values(ACTION_TYPES).map((t) => (
          <button
            key={t.id}
            type="button"
            className={`seg__btn ${selectedType === t.id ? "is-active" : ""}`}
            style={{ fontSize: 11, padding: "2px 8px" }}
            onClick={() => setSelectedType(t.id)}
          >
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Actions Grid Feed */}
      <div className="stack mb5" style={{ gap: 12 }}>
        {displayedActions.length === 0 ? (
          <Panel pad>
            <div className="empty" style={{ padding: "32px 0" }}>
              <p className="t2">No actions match the selected filter.</p>
              <Button variant="secondary" className="mt2" onClick={handleOpenCreate}>
                + Create Action
              </Button>
            </div>
          </Panel>
        ) : (
          displayedActions.map((action) => {
            const isDoneToday = isComplete(state, action, tk);
            const typeObj =
              ACTION_TYPES[action.type?.toUpperCase()] || ACTION_TYPES.BOOLEAN;
            const category = categories.find((c) => c.id === action.categoryId);
            const isScheduledToday = isScheduledOn(action, new Date());

            return (
              <Panel
                key={action.id}
                pad
                glass
                style={{
                  cursor: "pointer",
                  transition: "border-color 0.2s var(--ease)",
                }}
                onClick={() => handleOpenDetail(action)}
              >
                <div className="stack" style={{ gap: 10 }}>
                  <div className="row-flex spread">
                    <div className="row-flex" style={{ gap: 12 }}>
                      <span
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: "var(--surface-3)",
                          border: "1px solid var(--border)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isDoneToday ? "var(--ok)" : "var(--text-2)",
                        }}
                      >
                        <DynIcon name={action.icon} size={18} />
                      </span>

                      <div>
                        <div className="row-flex" style={{ gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 15 }}>
                            {action.name}
                          </span>

                          {isScheduledToday && (
                            <span className="tag tag--mono status-ok small">
                              SCHEDULED TODAY
                            </span>
                          )}

                          {action.valence === "negative" && (
                            <span className="tag tag--mono status-warn small">
                              BOUNDARY
                            </span>
                          )}
                        </div>

                        <div className="row-flex" style={{ gap: 8, marginTop: 3 }}>
                          <span className="syslabel">{typeObj.label}</span>
                          <span className="syslabel">· {category?.name || "General"}</span>
                          {action.schedule?.time && (
                            <span className="syslabel">· {action.schedule.time}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row-flex" style={{ gap: 8 }}>
                      {!showArchived ? (
                        <button
                          type="button"
                          className={`btn ${
                            isDoneToday ? "btn--ghost" : "btn--secondary"
                          } small`}
                          onClick={(e) => handleTriggerCompletion(action, e)}
                        >
                          {isDoneToday ? (
                            <span className="status-ok row-flex" style={{ gap: 4 }}>
                              <Tick done /> Logged
                            </span>
                          ) : (
                            "Log Completion"
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn--secondary small"
                          onClick={(e) => {
                            e.stopPropagation();
                            api.unarchiveAction(action.id);
                          }}
                        >
                          Unarchive
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn--ghost small"
                        style={{ padding: "4px 8px" }}
                        onClick={(e) => handleOpenEdit(action, e)}
                        title="Edit Action"
                      >
                        <IconEdit size={14} />
                      </button>
                    </div>
                  </div>

                  {action.desc && <p className="t2 small mb0">{action.desc}</p>}

                  <div
                    className="row-flex spread"
                    style={{
                      paddingTop: 8,
                      borderTop: "1px solid var(--hairline)",
                      fontSize: 12,
                    }}
                  >
                    <div className="row-flex" style={{ gap: 12 }}>
                      <span className="t3">
                        Target:{" "}
                        <span className="mono t1">
                          {action.type === "boolean" || action.type === "avoidance"
                            ? "Complete"
                            : `${action.target || 1} ${action.unit || ""}`}
                        </span>
                      </span>

                      <span className="t3">
                        Schedule:{" "}
                        <span className="mono t1" style={{ textTransform: "capitalize" }}>
                          {action.schedule?.freq || "daily"}
                        </span>
                      </span>

                      {action.customFields && action.customFields.length > 0 && (
                        <span className="t3">
                          Custom Fields:{" "}
                          <span className="mono status-info">
                            {action.customFields.length}
                          </span>
                        </span>
                      )}
                    </div>

                    <span className="btn btn--ghost small p0 t3">
                      View Stats & Details <IconChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </Panel>
            );
          })
        )}
      </div>

      {/* Modals */}
      <ActionEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        initialAction={editingAction}
        onSaveCategoryClick={() => {
          setEditorOpen(false);
          setCatManagerOpen(true);
        }}
      />

      <CategoryManagerModal
        open={catManagerOpen}
        onClose={() => setCatManagerOpen(false)}
      />

      <ActionDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        action={selectedAction}
        onEdit={() => {
          setDetailOpen(false);
          setEditingAction(selectedAction);
          setEditorOpen(true);
        }}
        onLogCompletion={(a) => {
          setCompletionAction(a);
          setCompletionOpen(true);
        }}
      />

      <ActionCompletionModal
        open={completionOpen}
        onClose={() => setCompletionOpen(false)}
        action={completionAction}
      />
    </main>
  );
}

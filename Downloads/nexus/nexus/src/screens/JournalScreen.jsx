import React, { useState } from "react";
import { useApp } from "../store/AppContext";
import { ScreenHeader } from "../components/common";
import {
  IconPlus,
  IconChevronRight,
  IconBook,
  IconCalendar,
  IconEdit,
  IconTrash,
  IconTarget,
} from "../components/icons";
import {
  Button,
  Panel,
  SysLabel,
  StatusDot,
  Pill,
} from "../components/primitives";
import { dateKey } from "../lib/time";
import { JournalEditorModal } from "../components/JournalEditorModal";
import { DailyReviewModal } from "../components/DailyReviewModal";
import { WeeklyReviewModal } from "../components/WeeklyReviewModal";

export default function JournalScreen() {
  const { state, api } = useApp();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const [dailyReviewOpen, setDailyReviewOpen] = useState(false);
  const [weeklyReviewOpen, setWeeklyReviewOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  const journalEntries = state.journal || [];
  const goals = state.goals || [];

  // Gather all unique tags across entries
  const allTagsSet = new Set();
  journalEntries.forEach((j) => {
    (j.tags || []).forEach((t) => allTagsSet.add(t));
  });
  const allTags = Array.from(allTagsSet);

  const filteredEntries = journalEntries
    .filter((j) => {
      if (
        searchQuery &&
        !j.text?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !j.recoveryNote?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (selectedTag !== "all" && !(j.tags || []).includes(selectedTag)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  function handleOpenCreate() {
    setEditingEntry(null);
    setEditorOpen(true);
  }

  function handleOpenEdit(entry, e) {
    if (e) e.stopPropagation();
    setEditingEntry(entry);
    setEditorOpen(true);
  }

  return (
    <main className="screen">
      <ScreenHeader
        sys="REFLECTIVE OPERATING SYSTEM"
        title="Journal"
        right={
          <div className="row-flex" style={{ gap: 8 }}>
            <Button
              variant="secondary"
              onClick={() => setDailyReviewOpen(true)}
            >
              Daily Review
            </Button>
            <Button
              variant="secondary"
              onClick={() => setWeeklyReviewOpen(true)}
            >
              Weekly Review
            </Button>
            <Button variant="primary" onClick={handleOpenCreate}>
              <IconPlus size={16} /> Write Entry
            </Button>
          </div>
        }
        sub="Calm, private, reflective space. Free-form writing, mood & energy tracking, and structured daily/weekly alignment reviews."
      />

      {/* Search & Tag Filter Bar */}
      <div className="stack mb4" style={{ gap: 12 }}>
        <input
          className="input"
          placeholder="Search journal entries, reflections, and reviews..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {allTags.length > 0 && (
          <div className="row-flex" style={{ gap: 6, overflowX: "auto" }}>
            <button
              type="button"
              className={`tag tag--interactive ${
                selectedTag === "all" ? "tag--active" : ""
              }`}
              onClick={() => setSelectedTag("all")}
              style={{ cursor: "pointer" }}
            >
              All Tags ({journalEntries.length})
            </button>

            {allTags.map((t) => (
              <button
                key={t}
                type="button"
                className={`tag tag--interactive ${
                  selectedTag === t ? "tag--active" : ""
                }`}
                onClick={() => setSelectedTag(t)}
                style={{ cursor: "pointer" }}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entries List */}
      <div className="stack mb5" style={{ gap: 16 }}>
        {filteredEntries.length === 0 ? (
          <Panel pad>
            <div className="empty" style={{ padding: "32px 0" }}>
              <p className="t2">No journal reflections found matching your search.</p>
              <Button variant="secondary" className="mt2" onClick={handleOpenCreate}>
                + Write First Entry
              </Button>
            </div>
          </Panel>
        ) : (
          filteredEntries.map((entry) => {
            const linkedGoal = goals.find((g) => g.id === entry.linkedGoalId);

            return (
              <Panel key={entry.id || entry.dateKey} pad glass>
                <div className="stack" style={{ gap: 12 }}>
                  <div className="row-flex spread">
                    <div className="row-flex" style={{ gap: 8 }}>
                      <SysLabel>{entry.dateKey}</SysLabel>
                      {entry.mood != null && (
                        <span className="tag tag--mono small status-ok">
                          Mood: {entry.mood}/10
                        </span>
                      )}
                      {entry.energy != null && (
                        <span className="tag tag--mono small">
                          Energy: {entry.energy}/10
                        </span>
                      )}
                    </div>

                    <div className="row-flex" style={{ gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn--ghost small"
                        style={{ padding: "2px 6px" }}
                        onClick={(e) => handleOpenEdit(entry, e)}
                        title="Edit Entry"
                      >
                        <IconEdit size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost small"
                        style={{ padding: "2px 6px", color: "var(--neg)" }}
                        onClick={() => api.deleteJournalEntry(entry.id)}
                        title="Delete Entry"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Reflection Text */}
                  <p
                    className="t1"
                    style={{
                      fontSize: 15,
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      margin: 0,
                    }}
                  >
                    {entry.text}
                  </p>

                  {/* Daily Review Highlights Card if present */}
                  {entry.dailyReview && (
                    <div
                      className="p3 stack"
                      style={{
                        gap: 6,
                        background: "var(--surface-1)",
                        borderRadius: "var(--r-2)",
                      }}
                    >
                      <SysLabel>DAILY REVIEW STRUCTURED HIGHLIGHTS</SysLabel>
                      {entry.dailyReview.importantWin && (
                        <div className="small status-ok">
                          <strong>Win:</strong> {entry.dailyReview.importantWin}
                        </div>
                      )}
                      {entry.dailyReview.wentWell && (
                        <div className="small t2">
                          <strong>Went well:</strong> {entry.dailyReview.wentWell}
                        </div>
                      )}
                      {entry.dailyReview.changeTomorrow && (
                        <div className="small t2">
                          <strong>Change tomorrow:</strong> {entry.dailyReview.changeTomorrow}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recovery Note if present */}
                  {entry.recoveryNote && (
                    <div className="small t3" style={{ fontStyle: "italic" }}>
                      Recovery note: {entry.recoveryNote}
                    </div>
                  )}

                  {/* Tags & Linked Goal Footer */}
                  <div className="row-flex spread" style={{ paddingTop: 6, borderTop: "1px solid var(--hairline)" }}>
                    <div className="row-flex" style={{ gap: 6, flexWrap: "wrap" }}>
                      {(entry.tags || []).map((t) => (
                        <span key={t} className="tag tag--mono small">
                          {t}
                        </span>
                      ))}
                    </div>

                    {linkedGoal && (
                      <span className="syslabel status-ok">
                        Linked Goal: {linkedGoal.name}
                      </span>
                    )}
                  </div>
                </div>
              </Panel>
            );
          })
        )}
      </div>

      {/* Modals */}
      <JournalEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        initialEntry={editingEntry}
      />

      <DailyReviewModal
        open={dailyReviewOpen}
        onClose={() => setDailyReviewOpen(false)}
      />

      <WeeklyReviewModal
        open={weeklyReviewOpen}
        onClose={() => setWeeklyReviewOpen(false)}
      />
    </main>
  );
}

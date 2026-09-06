import React, { useState, useEffect } from "react";
import { useApp } from "../store/AppContext";
import { Modal } from "./Modal";
import { Button } from "./primitives";
import { dateKey } from "../lib/time";

export function DailyReviewModal({ open, onClose, targetDateKey = dateKey() }) {
  const { state, api } = useApp();

  const [wentWell, setWentWell] = useState("");
  const [difficult, setDifficult] = useState("");
  const [learned, setLearned] = useState("");
  const [changeTomorrow, setChangeTomorrow] = useState("");
  const [importantWin, setImportantWin] = useState("");

  useEffect(() => {
    if (open) {
      const existing = (state.journal || []).find((j) => j.dateKey === targetDateKey);
      const rev = existing?.dailyReview || {};
      setWentWell(rev.wentWell || "");
      setDifficult(rev.difficult || "");
      setLearned(rev.learned || "");
      setChangeTomorrow(rev.changeTomorrow || "");
      setImportantWin(rev.importantWin || "");
    }
  }, [open, targetDateKey, state.journal]);

  function handleSave() {
    const dailyReview = {
      wentWell: wentWell.trim(),
      difficult: difficult.trim(),
      learned: learned.trim(),
      changeTomorrow: changeTomorrow.trim(),
      importantWin: importantWin.trim(),
    };

    const reviewSummary = [
      importantWin ? `🏆 Win: ${importantWin}` : null,
      wentWell ? `✓ Went well: ${wentWell}` : null,
      changeTomorrow ? `→ Change tomorrow: ${changeTomorrow}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    api.saveJournalEntry({
      dateKey: targetDateKey,
      text: reviewSummary || "Completed Daily Review.",
      tags: ["#dailyreview"],
      dailyReview,
    });

    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Daily Review"
      sys="END-OF-DAY ALIGNMENT"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Review
          </Button>
        </>
      }
    >
      <div className="stack" style={{ gap: 16 }}>
        <p className="t2 small mb0">
          A short, 2-minute daily alignment. Answer any of the prompts that matter today.
        </p>

        <div className="field">
          <label className="field__label">One Important Win Today</label>
          <input
            className="input"
            placeholder="e.g. Guarded night cutoff and completed deep work block"
            value={importantWin}
            onChange={(e) => setImportantWin(e.target.value)}
            autoFocus
          />
        </div>

        <div className="field">
          <label className="field__label">What Went Well?</label>
          <input
            className="input"
            placeholder="e.g. Stayed focused on primary priorities"
            value={wentWell}
            onChange={(e) => setWentWell(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label">What Was Difficult?</label>
          <input
            className="input"
            placeholder="e.g. Afternoon energy slump"
            value={difficult}
            onChange={(e) => setDifficult(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label">What Did I Learn?</label>
          <input
            className="input"
            placeholder="e.g. Taking a walk after lunch completely resets focus"
            value={learned}
            onChange={(e) => setLearned(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label">What Should I Change Tomorrow?</label>
          <input
            className="input"
            placeholder="e.g. Move phone into another room at 22:00"
            value={changeTomorrow}
            onChange={(e) => setChangeTomorrow(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

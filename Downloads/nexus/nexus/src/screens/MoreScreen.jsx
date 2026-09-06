import React, { useState } from "react";
import { useApp } from "../store/AppContext";
import { ScreenHeader } from "../components/common";
import { Panel, SysLabel, Button, Switch } from "../components/primitives";
import { IconChevronRight, IconBook, IconTarget, IconGrid, IconSettings, IconRefresh } from "../components/icons";
import { Modal } from "../components/Modal";

const MODULES = [
  { id: "journal", label: "Journal", icon: IconBook, desc: "Reflective entries with streaks and context." },
  { id: "goals", label: "Goals", icon: IconTarget, desc: "Long-term outcomes with progress to daily action." },
  { id: "dashboards", label: "Custom Dashboards", icon: IconGrid, desc: "Add, reorder, resize and choose modular widgets." },
];

export default function MoreScreen({ navigate }) {
  const { state, api } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  const [name, setName] = useState(state.preferences?.greetingName || "");

  function handleModuleClick(m) {
    if (navigate) navigate(m.id);
  }

  return (
    <main className="screen">
      <ScreenHeader
        sys="MORE · SETTINGS"
        title="More"
        sub="Journaling, goals, custom dashboards and system settings."
      />

      {/* module navigation */}
      <section className="section">
        <div className="section-head"><SysLabel>MODULES</SysLabel></div>
        <Panel>
          <div className="stack" style={{ padding: "var(--s-2) var(--s-4)" }}>
            {MODULES.map((m) => {
              const I = m.icon;
              return (
                <button className="row row--hover" key={m.id} onClick={() => handleModuleClick(m)}>
                  <span className="icon-tile" style={{ width: 38, height: 38 }}><I size={18} /></span>
                  <span className="grow" style={{ textAlign: "left" }}>
                    <span style={{ fontWeight: 550, display: "block" }}>{m.label}</span>
                    <span className="t3 small">{m.desc}</span>
                  </span>
                  <IconChevronRight size={16} className="t3" />
                </button>
              );
            })}
          </div>
        </Panel>
      </section>

      {/* settings */}
      <section className="section">
        <div className="section-head"><SysLabel>SYSTEM</SysLabel></div>
        <Panel>
          <div className="stack" style={{ padding: "var(--s-3) var(--s-4)" }}>
            <div className="row">
              <div className="grow">
                <span style={{ fontWeight: 540 }}>Greeting name</span>
                <span className="t3 small" style={{ display: "block" }}>Used on the Today screen.</span>
              </div>
            </div>
            <div style={{ padding: "0 var(--s-4) var(--s-3)" }}>
              <input
                className="input" value={name} maxLength={24}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => name.trim() && api.setPref({ greetingName: name.trim() })}
                placeholder="Your name"
              />
            </div>
            <div className="rule--row rule" />
            <div className="row">
              <div className="grow">
                <span style={{ fontWeight: 540 }}>24-hour clock</span>
                <span className="t3 small" style={{ display: "block" }}>System metadata time format.</span>
              </div>
              <Switch
                on={state.preferences?.timeFormat === 24}
                onChange={(v) => api.setPref({ timeFormat: v ? 24 : 12 })}
              />
            </div>
            <div className="rule--row rule" />
            <div className="row">
              <div className="grow">
                <span style={{ fontWeight: 540 }}>Demo data</span>
                <span className="t3 small" style={{ display: "block" }}>Reset the workspace to the sample system.</span>
              </div>
            </div>
            <div style={{ padding: "0 var(--s-4) var(--s-3)" }}>
              <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)}>
                <IconRefresh size={14} /> Reset demo data
              </Button>
            </div>
          </div>
        </Panel>
      </section>

      {/* data note */}
      <Panel className="mt5" glass>
        <div className="panel-pad">
          <div className="row-flex" style={{ gap: 8 }}><IconSettings size={16} className="t3" /><SysLabel as="div">PRIVACY</SysLabel></div>
          <p className="t3 small mt2">All NEXUS data is stored locally in your browser. Nothing leaves this device. A future sync layer can be added without changing your data model.</p>
        </div>
      </Panel>

      {/* reset confirm */}
      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset demo data" sys="DESTRUCTIVE">
        <p className="t2">This replaces everything with the sample system and clears your local edits. This cannot be undone.</p>
        <div className="row-flex mt4" style={{ justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => { api.resetDemo(); setConfirmReset(false); }}>Reset everything</Button>
        </div>
      </Modal>
    </main>
  );
}

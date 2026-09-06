import React, { useState } from "react";
import { useApp } from "../store/AppContext";
import { ScreenHeader } from "../components/common";
import {
  IconPlus,
  IconGrid,
  IconSettings,
  IconEdit,
  IconTrash,
  IconChevronRight,
} from "../components/icons";
import { Button, Panel, SysLabel, StatusDot } from "../components/primitives";
import {
  WIDGET_REGISTRY,
  DASHBOARD_PRESETS,
  WidgetContainer,
  WidgetRenderer,
  WidgetConfigModal,
} from "../components/Widgets";
import { Modal } from "../components/Modal";

export default function DashboardsScreen() {
  const { state, api } = useApp();

  const dashboards = state.dashboards || [];

  // Seed default "Main OS" dashboard if none exists
  const activeDashId = state.preferences?.activeDashboardId || dashboards[0]?.id || "";
  const currentDash = dashboards.find((d) => d.id === activeDashId) || dashboards[0];

  const [pickerOpen, setWidgetPickerOpen] = useState(false);
  const [configWidget, setConfigWidget] = useState(null);
  const [dashModalOpen, setDashModalOpen] = useState(false);
  const [newDashName, setNewDashName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("balanced");

  function handleSelectDashboard(id) {
    api.setPref({ activeDashboardId: id });
  }

  function handleCreateDashboard() {
    if (!newDashName.trim()) return;

    const presetObj = DASHBOARD_PRESETS.find((p) => p.id === selectedPreset);
    const newWidgets = presetObj
      ? presetObj.widgets.map((w, i) => ({
          id: `w-${Date.now().toString(36)}-${i}`,
          type: w.type,
          title: w.title,
          size: w.size || "full",
        }))
      : [];

    api.addDashboard({
      name: newDashName.trim(),
      preset: selectedPreset,
      widgets: newWidgets,
    });

    setNewDashName("");
    setDashModalOpen(false);
  }

  function handleAddWidget(registryItem) {
    if (!currentDash) return;
    api.addWidgetToDashboard(currentDash.id, {
      type: registryItem.type,
      title: registryItem.label,
      size: registryItem.defaultSize || "full",
    });
    setWidgetPickerOpen(false);
  }

  function handleMoveWidget(index, direction) {
    if (!currentDash || !currentDash.widgets) return;
    const list = [...currentDash.widgets];
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[nextIdx];
    list[nextIdx] = temp;

    api.reorderDashboardWidgets(
      currentDash.id,
      list.map((w) => w.id)
    );
  }

  function handleToggleSize(widget) {
    if (!currentDash) return;
    const newSize = widget.size === "half" ? "full" : "half";
    api.updateDashboardWidget(currentDash.id, widget.id, { size: newSize });
  }

  return (
    <main className="screen">
      <ScreenHeader
        sys="CUSTOM DASHBOARD OPERATING SYSTEM"
        title="Dashboards"
        right={
          <div className="row-flex" style={{ gap: 8 }}>
            <Button variant="secondary" onClick={() => setDashModalOpen(true)}>
              <IconPlus size={15} /> New Dashboard
            </Button>
            {currentDash && (
              <Button variant="primary" onClick={() => setWidgetPickerOpen(true)}>
                <IconPlus size={16} /> Add Widget
              </Button>
            )}
          </div>
        }
        sub="Construct your personal operating system. Build custom dashboards from modular widgets, reorder layouts, and configure your data feeds."
      />

      {/* Dashboard Switcher Tabs Bar */}
      <div className="row-flex spread mb4" style={{ gap: 12, flexWrap: "wrap" }}>
        <div className="seg" style={{ height: 34, padding: 2, overflowX: "auto" }}>
          {dashboards.length === 0 ? (
            <button
              type="button"
              className="seg__btn is-active"
              style={{ fontSize: 12, padding: "2px 12px" }}
            >
              Main OS
            </button>
          ) : (
            dashboards.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`seg__btn ${
                  (currentDash?.id || activeDashId) === d.id ? "is-active" : ""
                }`}
                style={{ fontSize: 12, padding: "2px 12px" }}
                onClick={() => handleSelectDashboard(d.id)}
              >
                {d.name}
              </button>
            ))
          )}
        </div>

        {currentDash && (
          <div className="row-flex" style={{ gap: 8 }}>
            <button
              type="button"
              className="btn btn--ghost small"
              onClick={() => {
                const name = prompt("Rename Dashboard:", currentDash.name);
                if (name && name.trim()) {
                  api.updateDashboard(currentDash.id, { name: name.trim() });
                }
              }}
            >
              <IconEdit size={14} /> Rename
            </button>

            {dashboards.length > 1 && (
              <button
                type="button"
                className="btn btn--ghost small"
                style={{ color: "var(--neg)" }}
                onClick={() => {
                  if (confirm(`Delete dashboard "${currentDash.name}"?`)) {
                    api.deleteDashboard(currentDash.id);
                  }
                }}
              >
                <IconTrash size={14} /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Empty Dashboard State */}
      {(!currentDash || !currentDash.widgets || currentDash.widgets.length === 0) && (
        <Panel pad className="tex-noise mb5">
          <div className="stack align-center" style={{ padding: "32px 16px", textAlign: "center" }}>
            <IconGrid size={32} style={{ color: "var(--text-3)", mb: 8 }} />
            <h2 className="h2" style={{ margin: "8px 0" }}>
              + ADD YOUR FIRST WIDGET
            </h2>
            <p className="t2" style={{ maxWidth: 460, margin: "0 auto 16px" }}>
              Construct this dashboard by picking from 13+ native modular widgets or loading a pre-configured OS starter preset.
            </p>
            <div className="row-flex" style={{ gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <Button variant="primary" onClick={() => setWidgetPickerOpen(true)}>
                <IconPlus size={16} /> Pick Widget from Library
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {/* Responsive Dashboard Grid */}
      {currentDash && currentDash.widgets && currentDash.widgets.length > 0 && (
        <div
          className="grid mb5"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {currentDash.widgets.map((w, idx) => (
            <WidgetContainer
              key={w.id}
              widget={w}
              isFirst={idx === 0}
              isLast={idx === currentDash.widgets.length - 1}
              onMove={(dir) => handleMoveWidget(idx, dir)}
              onResize={() => handleToggleSize(w)}
              onConfigure={() => setConfigWidget(w)}
              onRemove={() => api.removeWidgetFromDashboard(currentDash.id, w.id)}
            >
              <WidgetRenderer widget={w} />
            </WidgetContainer>
          ))}
        </div>
      )}

      {/* Widget Picker Modal */}
      <Modal
        open={pickerOpen}
        onClose={() => setWidgetPickerOpen(false)}
        title="Widget Library"
        sys="WIDGET REGISTRY"
        wide
        footer={
          <Button variant="ghost" onClick={() => setWidgetPickerOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="stack" style={{ gap: 16 }}>
          <p className="t2 small mb0">
            Select a modular widget to add to <strong>{currentDash?.name || "Dashboard"}</strong>.
          </p>

          <div className="stack" style={{ gap: 10 }}>
            {WIDGET_REGISTRY.map((item) => (
              <div
                key={item.type}
                className="row-flex spread p3"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-2)",
                }}
              >
                <div>
                  <div className="row-flex" style={{ gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>
                      {item.label}
                    </span>
                    <span className="tag tag--mono small">{item.category}</span>
                  </div>
                  <p className="t3 small mt1 mb0">{item.desc}</p>
                </div>

                <Button variant="secondary" onClick={() => handleAddWidget(item)}>
                  + Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Widget Config Modal */}
      <WidgetConfigModal
        open={!!configWidget}
        onClose={() => setConfigWidget(null)}
        widget={configWidget}
        onSave={(patch) => {
          if (currentDash && configWidget) {
            api.updateDashboardWidget(currentDash.id, configWidget.id, patch);
          }
        }}
      />

      {/* New Dashboard Creator Modal */}
      <Modal
        open={dashModalOpen}
        onClose={() => setDashModalOpen(false)}
        title="Create Custom Dashboard"
        sys="SYSTEM BUILDER"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDashModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!newDashName.trim()}
              onClick={handleCreateDashboard}
            >
              Create Dashboard
            </Button>
          </>
        }
      >
        <div className="stack" style={{ gap: 16 }}>
          <div className="field">
            <label className="field__label">Dashboard Name *</label>
            <input
              className="input"
              placeholder="e.g. Recovery, Business, School, Fitness"
              value={newDashName}
              onChange={(e) => setNewDashName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field__label">Start from OS Preset</label>
            <select
              className="input"
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
            >
              {DASHBOARD_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              <option value="empty">Blank Dashboard</option>
            </select>
          </div>
        </div>
      </Modal>
    </main>
  );
}

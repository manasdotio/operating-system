import React, { useState, useEffect } from "react";
import { useOS } from "../context/OSContext";
import "./taskmanager/TaskManager.css";

const TaskManager = ({ setStatusText }) => {
  const { processes, killProcess } = useOS();
  const [activeTab, setActiveTab] = useState("processes");
  const [cpuHistory, setCpuHistory] = useState([24, 18, 35, 22, 40, 28, 19, 32, 25, 30]);
  const [memoryUsage, setMemoryUsage] = useState({ used: 42, total: 128 });

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time CPU thread activity based on process count
      const baseLoad = 12 + processes.length * 4;
      const jitter = Math.floor(Math.random() * 14) - 7;
      const nextCpu = Math.max(8, Math.min(95, baseLoad + jitter));

      setCpuHistory((prev) => [...prev.slice(1), nextCpu]);

      // Read real performance memory if browser allows, or simulate
      if (performance?.memory) {
        setMemoryUsage({
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
        });
      } else {
        const simUsed = 38 + processes.length * 6;
        setMemoryUsage({ used: simUsed, total: 256 });
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [processes.length]);

  const currentCpu = cpuHistory[cpuHistory.length - 1];

  useEffect(() => {
    if (setStatusText) {
      setStatusText(
        `Processes: ${processes.length} • CPU: ${currentCpu}% • RAM: ${memoryUsage.used}MB`
      );
    }
  }, [processes.length, currentCpu, memoryUsage.used, setStatusText]);

  return (
    <div className="taskmanager-shell">
      {/* Top Ribbon Tabs */}
      <div className="tm-tabs">
        <button
          className={activeTab === "processes" ? "active" : ""}
          onClick={() => setActiveTab("processes")}
        >
          ⚡ Active Processes ({processes.length})
        </button>
        <button
          className={activeTab === "performance" ? "active" : ""}
          onClick={() => setActiveTab("performance")}
        >
          📈 Performance Telemetry
        </button>
      </div>

      {/* Processes View */}
      {activeTab === "processes" && (
        <div className="tm-body">
          <div className="tm-table-header">
            <span className="col-pid">PID</span>
            <span className="col-name">Process / Application</span>
            <span className="col-status">Status</span>
            <span className="col-memory">Memory (Est.)</span>
            <span className="col-action">Action</span>
          </div>

          <div className="tm-process-list">
            {processes.map((proc) => {
              const memEst = 8 + (proc.pid % 7) * 3 + " MB";
              const isMin = proc.minimized;
              return (
                <div key={proc.pid} className="tm-process-row">
                  <span className="col-pid">{proc.pid}</span>
                  <span className="col-name">
                    <img src={proc.icon} alt="" className="tm-icon" />
                    {proc.name}
                  </span>
                  <span className="col-status">
                    <span className={`status-pill ${isMin ? "min" : "run"}`}>
                      {isMin ? "Suspended" : "Running"}
                    </span>
                  </span>
                  <span className="col-memory">{memEst}</span>
                  <span className="col-action">
                    <button
                      className="tm-btn-end"
                      onClick={() => killProcess(proc.pid)}
                      title="Terminate Process"
                    >
                      End Task
                    </button>
                  </span>
                </div>
              );
            })}

            {processes.length === 0 && (
              <div className="tm-empty">No active user application processes running.</div>
            )}
          </div>
        </div>
      )}

      {/* Performance View */}
      {activeTab === "performance" && (
        <div className="tm-perf-body">
          <div className="perf-card">
            <div className="perf-header">
              <span className="perf-label">CPU Virtual Activity</span>
              <span className="perf-val">{currentCpu}%</span>
            </div>
            <div className="perf-graph">
              {cpuHistory.map((val, idx) => (
                <div
                  key={idx}
                  className="graph-bar"
                  style={{ height: `${val}%` }}
                  title={`${val}%`}
                />
              ))}
            </div>
            <div className="perf-sub">60-second activity graph | React Virtual DOM Dispatcher</div>
          </div>

          <div className="perf-card">
            <div className="perf-header">
              <span className="perf-label">JS Heap Memory</span>
              <span className="perf-val">
                {memoryUsage.used} MB / {memoryUsage.total} MB
              </span>
            </div>
            <div className="perf-bar-wrap">
              <div
                className="perf-bar-fill"
                style={{ width: `${Math.min(100, (memoryUsage.used / memoryUsage.total) * 100)}%` }}
              />
            </div>
            <div className="perf-sub">
              Allocated Heap Capacity: {((memoryUsage.used / memoryUsage.total) * 100).toFixed(1)}% in use
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;

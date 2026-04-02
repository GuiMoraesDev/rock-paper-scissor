"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { getSocket } from "@/lib/socket";

type ServerStatus = {
  status: string;
  uptime: number;
  activeConnections: number;
  activeGames: number;
  socketEngineClientsCount: number;
  cors: string | string[];
  timestamp: number;
};

type CheckStatus = "pending" | "success" | "error";

type HealthCheck = {
  label: string;
  status: CheckStatus;
  detail: string;
  latency?: number;
};

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${secs}s`;
}

const statusColors: Record<CheckStatus, string> = {
  pending: "bg-yellow-400",
  success: "bg-green-500",
  error: "bg-red-500",
};

const statusLabels: Record<CheckStatus, string> = {
  pending: "Checking...",
  success: "OK",
  error: "Failed",
};

export function StatusDashboard() {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const socketPingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateCheck = useCallback(
    (label: string, update: Partial<HealthCheck>) => {
      setChecks((prev) =>
        prev.map((c) => (c.label === label ? { ...c, ...update } : c)),
      );
    },
    [],
  );

  const runChecks = useCallback(async () => {
    setIsRunning(true);
    setServerStatus(null);

    const initialChecks: HealthCheck[] = [
      { label: "Health Endpoint", status: "pending", detail: "Checking..." },
      { label: "Status Endpoint", status: "pending", detail: "Checking..." },
      {
        label: "CORS (Fetch)",
        status: "pending",
        detail: "Checking...",
      },
      {
        label: "Socket.IO Connection",
        status: "pending",
        detail: "Checking...",
      },
      { label: "Socket.IO Ping", status: "pending", detail: "Checking..." },
    ];
    setChecks(initialChecks);

    // 1. Health endpoint
    try {
      const start = performance.now();
      const res = await fetch(`${SERVER_URL}/health`);
      const latency = Math.round(performance.now() - start);
      const data = await res.json();
      updateCheck("Health Endpoint", {
        status: data.status === "ok" ? "success" : "error",
        detail:
          data.status === "ok"
            ? `Server is healthy (${latency}ms)`
            : `Unexpected response: ${JSON.stringify(data)}`,
        latency,
      });
    } catch (err) {
      updateCheck("Health Endpoint", {
        status: "error",
        detail: `Failed to reach server: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    }

    // 2. Status endpoint
    try {
      const start = performance.now();
      const res = await fetch(`${SERVER_URL}/status`);
      const latency = Math.round(performance.now() - start);
      const data: ServerStatus = await res.json();
      setServerStatus(data);
      updateCheck("Status Endpoint", {
        status: "success",
        detail: `Uptime: ${formatUptime(data.uptime)} | ${latency}ms`,
        latency,
      });
    } catch (err) {
      updateCheck("Status Endpoint", {
        status: "error",
        detail: `Failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    }

    // 3. CORS check (fetch with mode: cors)
    try {
      const start = performance.now();
      const res = await fetch(`${SERVER_URL}/health`, { mode: "cors" });
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        updateCheck("CORS (Fetch)", {
          status: "success",
          detail: `CORS headers valid (${latency}ms)`,
          latency,
        });
      } else {
        updateCheck("CORS (Fetch)", {
          status: "error",
          detail: `HTTP ${res.status}: ${res.statusText}`,
        });
      }
    } catch (err) {
      updateCheck("CORS (Fetch)", {
        status: "error",
        detail: `CORS blocked or network error: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    }

    // 4. Socket.IO connection check
    try {
      const socket = getSocket();
      if (socket.connected) {
        updateCheck("Socket.IO Connection", {
          status: "success",
          detail: `Connected (id: ${socket.id})`,
        });
      } else {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Connection timeout (5s)"));
          }, 5000);

          socket.once("connect", () => {
            clearTimeout(timeout);
            resolve();
          });

          socket.once("connect_error", (err) => {
            clearTimeout(timeout);
            reject(err);
          });

          if (socket.disconnected) {
            socket.connect();
          }
        });
        updateCheck("Socket.IO Connection", {
          status: "success",
          detail: `Connected (id: ${socket.id})`,
        });
      }
    } catch (err) {
      updateCheck("Socket.IO Connection", {
        status: "error",
        detail: `${err instanceof Error ? err.message : "Unknown error"}`,
      });
      updateCheck("Socket.IO Ping", {
        status: "error",
        detail: "Skipped (no connection)",
      });
      setIsRunning(false);
      return;
    }

    // 5. Socket.IO ping/pong latency
    try {
      const socket = getSocket();
      const start = performance.now();

      await new Promise<void>((resolve, reject) => {
        socketPingTimeout.current = setTimeout(() => {
          reject(new Error("Ping timeout (5s)"));
        }, 5000);

        socket.volatile.emit("ping-check", () => {
          const latency = Math.round(performance.now() - start);
          if (socketPingTimeout.current) {
            clearTimeout(socketPingTimeout.current);
          }
          updateCheck("Socket.IO Ping", {
            status: "success",
            detail: `Round-trip: ${latency}ms`,
            latency,
          });
          resolve();
        });
      });
    } catch (err) {
      updateCheck("Socket.IO Ping", {
        status: "error",
        detail: `${err instanceof Error ? err.message : "Unknown error"}`,
      });
    }

    setIsRunning(false);
  }, [updateCheck]);

  useEffect(() => {
    runChecks();

    return () => {
      if (socketPingTimeout.current) {
        clearTimeout(socketPingTimeout.current);
      }
    };
  }, [runChecks]);

  const allSuccess =
    checks.length > 0 && checks.every((c) => c.status === "success");
  const hasErrors = checks.some((c) => c.status === "error");

  return (
    <section className="w-full max-w-2xl flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <h1 className="font-fun text-4xl md:text-5xl text-gray-800">
          Server Status
        </h1>
        <Button
          variant="blue"
          size="sm"
          onClick={runChecks}
          disabled={isRunning}
        >
          {isRunning ? "Checking..." : "Re-check"}
        </Button>
      </header>

      {checks.length > 0 && (
        <div
          className={`font-fun text-xl px-4 py-3 rounded-xl text-white text-center ${
            hasErrors
              ? "bg-red-500"
              : allSuccess
                ? "bg-green-500"
                : "bg-yellow-400"
          }`}
        >
          {hasErrors
            ? "Some checks failed"
            : allSuccess
              ? "All systems operational"
              : "Running checks..."}
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {checks.map((check) => (
          <li
            key={check.label}
            className="flex items-center gap-4 bg-white rounded-xl px-5 py-4 shadow-sm"
          >
            <span
              className={`size-3 rounded-full shrink-0 ${statusColors[check.status]}`}
            />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-fun text-lg text-gray-800">
                {check.label}
              </span>
              <span className="text-sm text-gray-500 truncate">
                {check.detail}
              </span>
            </div>
            <span
              className={`font-fun text-sm ${
                check.status === "success"
                  ? "text-green-600"
                  : check.status === "error"
                    ? "text-red-600"
                    : "text-yellow-600"
              }`}
            >
              {statusLabels[check.status]}
            </span>
          </li>
        ))}
      </ul>

      {serverStatus && (
        <section className="bg-white rounded-xl px-5 py-4 shadow-sm flex flex-col gap-3">
          <h2 className="font-fun text-2xl text-gray-800">Server Details</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500">Uptime</dt>
            <dd className="text-gray-800 font-medium">
              {formatUptime(serverStatus.uptime)}
            </dd>

            <dt className="text-gray-500">Active Connections</dt>
            <dd className="text-gray-800 font-medium">
              {serverStatus.activeConnections}
            </dd>

            <dt className="text-gray-500">Active Games</dt>
            <dd className="text-gray-800 font-medium">
              {serverStatus.activeGames}
            </dd>

            <dt className="text-gray-500">Socket Engine Clients</dt>
            <dd className="text-gray-800 font-medium">
              {serverStatus.socketEngineClientsCount}
            </dd>

            <dt className="text-gray-500">CORS Origins</dt>
            <dd className="text-gray-800 font-medium break-all">
              {Array.isArray(serverStatus.cors)
                ? serverStatus.cors.join(", ")
                : serverStatus.cors}
            </dd>

            <dt className="text-gray-500">Server URL</dt>
            <dd className="text-gray-800 font-medium break-all">
              {SERVER_URL}
            </dd>
          </dl>
        </section>
      )}
    </section>
  );
}

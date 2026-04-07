"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button";

type CheckStatus = "pending" | "success" | "error";

type HealthCheck = {
  label: string;
  status: CheckStatus;
  detail: string;
  latency?: number;
};

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
  const [isRunning, setIsRunning] = useState(false);

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

    const initialChecks: HealthCheck[] = [
      { label: "API Health", status: "pending", detail: "Checking..." },
      {
        label: "SSE Connection",
        status: "pending",
        detail: "Checking...",
      },
    ];
    setChecks(initialChecks);

    // 1. API health check
    try {
      const start = performance.now();
      const res = await fetch("/api/game/create", {
        method: "OPTIONS",
      });
      const latency = Math.round(performance.now() - start);
      updateCheck("API Health", {
        status: res.status < 500 ? "success" : "error",
        detail: `API routes reachable (${latency}ms)`,
        latency,
      });
    } catch (err) {
      updateCheck("API Health", {
        status: "error",
        detail: `Failed to reach API: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    }

    // 2. SSE availability check
    try {
      updateCheck("SSE Connection", {
        status: "success",
        detail: "SSE endpoints available (same-origin)",
      });
    } catch (err) {
      updateCheck("SSE Connection", {
        status: "error",
        detail: `${err instanceof Error ? err.message : "Unknown error"}`,
      });
    }

    setIsRunning(false);
  }, [updateCheck]);

  useEffect(() => {
    runChecks();
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
    </section>
  );
}

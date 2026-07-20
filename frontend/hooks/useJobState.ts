"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { initialState, loadJobState, saveJobState, type JobState } from "@/lib/jobState";

export function useJobState() {
  const [state, setState] = useState<JobState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    setState(loadJobState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveJobState(state);
  }, [state, hydrated]);

  const update = useCallback((patch: Partial<JobState> | ((s: JobState) => JobState)) => {
    setState((prev) => (typeof patch === "function" ? patch(prev) : { ...prev, ...patch }));
  }, []);

  return { state, update, hydrated, stateRef };
}

export type EquipmentType = "hvac" | "server_rack" | "printer";
export type Severity = "routine" | "critical";

export type ChatMessage = {
  id: string;
  role: "expert" | "tech";
  text: string;
  ts: number;
};

export type TabKey = "scoping" | "documentation" | "qa";

export type JobState = {
  equipment: EquipmentType | null;
  severity: Severity | null;
  prepDone: boolean;
  activeTab: TabKey;
  completedTabs: TabKey[];
  chats: { scoping: ChatMessage[]; qa: ChatMessage[] };
  scopingScriptIndex: number;
  qaScriptIndex: number;
  docRecorded: boolean;
  activityDeadline: number | null;
  finishedAt: number | null;
};

const KEY = "rftsp:job";

export const initialState: JobState = {
  equipment: null,
  severity: null,
  prepDone: false,
  activeTab: "scoping",
  completedTabs: [],
  chats: { scoping: [], qa: [] },
  scopingScriptIndex: 0,
  qaScriptIndex: 0,
  docRecorded: false,
  activityDeadline: null,
  finishedAt: null,
};

export function loadJobState(): JobState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<JobState>;
    return { ...initialState, ...parsed, chats: { ...initialState.chats, ...(parsed.chats ?? {}) } };
  } catch { return initialState; }
}

export function saveJobState(state: JobState) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function clearJobState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export const EQUIPMENT_LABEL: Record<EquipmentType, string> = {
  hvac: "HVAC System",
  server_rack: "Server Rack",
  printer: "Industrial Printer",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  routine: "Routine Maintenance",
  critical: "Critical Fault",
};

export const SAFETY_INSTRUCTIONS: Record<EquipmentType, string[]> = {
  hvac: [
    "De-energize all high-voltage circuits at the disconnect before opening the unit.",
    "Verify refrigerant lines are depressurized; wear cryogenic-rated gloves.",
    "Confirm airflow path is clear and ladder is secured on a level surface.",
  ],
  server_rack: [
    "Attach ESD wrist strap to grounded chassis before handling components.",
    "Confirm redundant power feeds are labeled; never pull both PSUs simultaneously.",
    "Route all cabling away from cooling intakes and verify hot/cold aisle direction.",
  ],
  printer: [
    "Lock out main power and pneumatic supply before opening service panels.",
    "Allow fuser/dryer assemblies at least 15 minutes to cool below 40°C.",
    "Ensure ink/solvent containment tray is empty and PPE respirator is fitted.",
  ],
};

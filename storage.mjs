export const KEY = "fse_academy_v2";
export const LEGACY_KEYS = [
  "fse3_done",
  "fse3_answers",
  "fse3_memo",
  "fse_dictionary_v1_3",
  "fse_ai_dictionary_v1_4",
  "fse_ai_model_v1_5",
];
export function emptyState() {
  return {
    version: 2,
    completed: {},
    assessments: {},
    reflections: {},
    lastLesson: null,
  };
}
export function validateState(s, ids) {
  if (!s || s.version !== 2 || typeof s !== "object")
    throw Error("지원하지 않는 학습 데이터 버전입니다.");
  const allowed = new Set(ids),
    next = emptyState();
  for (const field of ["completed", "assessments", "reflections"]) {
    if (!s[field] || Array.isArray(s[field]) || typeof s[field] !== "object")
      throw Error("학습 데이터 구조가 올바르지 않습니다.");
    for (const [id, value] of Object.entries(s[field])) {
      if (!allowed.has(id)) throw Error("알 수 없는 레슨 ID입니다.");
      if (field === "completed") {
        if (typeof value !== "boolean")
          throw Error("완료 상태가 올바르지 않습니다.");
        next[field][id] = value;
      } else if (field === "reflections") {
        if (typeof value !== "string" || value.length > 10000)
          throw Error("자기 설명 데이터가 올바르지 않습니다.");
        next[field][id] = value;
      } else {
        if (!value || typeof value !== "object" || Array.isArray(value))
          throw Error("평가 상태가 올바르지 않습니다.");
        next[field][id] = {};
        for (const [k, v] of Object.entries(value)) {
          if (
            !["choice", "number", "rubric", "diagnosis"].includes(k) ||
            typeof v !== "boolean"
          )
            throw Error("평가 결과가 올바르지 않습니다.");
          next[field][id][k] = v;
        }
      }
    }
  }
  if (s.lastLesson !== null && !allowed.has(s.lastLesson))
    throw Error("최근 레슨이 올바르지 않습니다.");
  next.lastLesson = s.lastLesson;
  return next;
}
export function loadState(storage, ids) {
  try {
    const raw = storage.getItem(KEY);
    return {
      state: raw ? validateState(JSON.parse(raw), ids) : emptyState(),
      error: "",
    };
  } catch {
    return {
      state: emptyState(),
      error:
        "저장 데이터를 읽지 못했습니다. 원본은 보존됩니다. 백업을 내려받은 후 복구하세요.",
    };
  }
}
export function saveState(storage, state) {
  try {
    storage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
export function legacySnapshot(storage) {
  const out = {};
  for (const k of LEGACY_KEYS) out[k] = storage.getItem(k);
  return out;
}
export function exportBackup(storage, state) {
  return {
    format: "fse-academy-backup",
    version: 2,
    exportedAt: new Date().toISOString(),
    academy: state,
    legacy: legacySnapshot(storage),
  };
}
// Restore is additive for completion/reflections; legacy keys are never overwritten.
export function mergeBackup(current, backup, ids) {
  if (!backup || backup.format !== "fse-academy-backup" || backup.version !== 2)
    throw Error("FSE v2 백업 파일이 아닙니다.");
  const next = validateState(backup.academy, ids),
    merged = validateState(current, ids);
  for (const [id, done] of Object.entries(next.completed))
    merged.completed[id] = done || merged.completed[id] === true;
  for (const [id, v] of Object.entries(next.reflections))
    if (!merged.reflections[id]) merged.reflections[id] = v;
  // Preserve the current assessment when present; merge only missing recorded abilities.
  for (const [id, v] of Object.entries(next.assessments))
    merged.assessments[id] = { ...v, ...merged.assessments[id] };
  if (!merged.lastLesson) merged.lastLesson = next.lastLesson;
  return merged;
}

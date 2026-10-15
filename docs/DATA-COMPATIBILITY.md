# Storage and recovery contract

V2 is additive. It never deletes legacy keys or changes the numeric unit/question indices used by v1. A legacy completed lesson is not evidence that an expanded engineering lesson's assessment passed.

`fse_academy_v2`:

```json
{"version":2,"completed":{},"assessments":{},"reflections":{},"lastLesson":null}
```

Keys in each map are stable lesson IDs, e.g. `p2-l1`. Assessment subkeys are `choice`, `number`, `diagnosis`, `rubric`; values are booleans. Reflection length is limited to 10,000 characters. Every stored/imported ID is validated against the curriculum. A future schema version is rejected without rewriting its raw data.

Full JSON export: versioned format, export timestamp, academy state, raw snapshots of `fse3_done`, `fse3_answers`, `fse3_memo`, `fse_dictionary_v1_3`, `fse_ai_dictionary_v1_4`, `fse_ai_model_v1_5`. Corrupt v2 exports also include `rawAcademy` for forensic recovery. A storage-denied browser reports export failure rather than inventing a backup.

Restore: parse and validate before any write; reject >2 MB, unsupported versions, unknown IDs and malformed fields. Preserve current evaluations/reflections and OR completion flags. Save current raw v2 under `fse_academy_v2_before_restore` before replacing it. If any storage step fails, show failure. Corrupt state is write-protected until a valid recovery succeeds.

Legacy raw snapshots are retained for recovery but not silently imported by v2. The legacy dictionary has its own validated JSON restoration. For other legacy keys, keep the complete export and use an explicitly reviewed, version-aware recovery procedure; do not clear all localStorage. No production data was accessed, transferred or reset during development.

Rollback of application files to v1.6 continues to read the original legacy keys; the added v2 key is ignored. Rollback/production changes still require user approval. Different origins, private browsing and cleared browser data have normal browser-local storage limitations. This is not cloud backup or multi-device sync.

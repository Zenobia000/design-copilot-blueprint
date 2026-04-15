# 04-deliver — Can we ship and operate it?

> Gates: TR8-TR10

## Gate Reviews

| #     | Document | Status |
|-------|----------|--------|
| GR10  | [GR10--ga-readiness](GR10--ga-readiness.md) (v1.0, 2026-04-15) — Security AI-01..15 / Deploy / Observability / Support / Docs / Legal / GA decision | Draft |

## Essential Documents

| #   | Document | Status | VibeCoding 模板對齊 |
|-----|----------|--------|---------------------|
| E8  | [E8--security-and-readiness-checklists](E8--security-and-readiness-checklists.md) | Draft | #13 — A-G 七段齊備（含 15 項 action items 表、D-G checklist 展開） |
| E9  | [E9--deployment-and-operations-guide](E9--deployment-and-operations-guide.md) | Draft | #14 — Partial（CI/CD YAML 三階段 v1.1 範本、Blue-Green / Rolling / Canary 可行性評估、Rollback 決策樹） |
| E9x | [E9x--documentation-maintenance-guide](E9x--documentation-maintenance-guide.md) | Draft | #15 — 含本專案文檔清單（60+ 份）、MkDocs vs Docusaurus vs GitBook 工具選型、5 個量測指標、RACI |

> 2026-04-15 升級摘要：E8 補齊 D-G（D 新增 13 項基礎設施 checklist、E 新增 GDPR 適用性 / 刪除權 / 保留策略、F 擴至 15 項 AI-## action items、G 擴至 30+ 項可觀測性 / 可靠性 / 效能 / 可維護性 checklist）；E9 補齊 CI/CD YAML 範本（build/test/deploy）+ 三策略評估表 + Rollback 決策樹；E9x 新增文檔清單（7 區、60+ 檔）+ 工具選型矩陣 + M1-M5 指標。

## User Documentation

- [E9x--user-manual-v0.1](E9x--user-manual-v0.1.md) — 使用者手冊 v0.1 ← from 00-discover

## Operations

- [runbook_pc_decomposition](operations/runbook_pc_decomposition.md) — PC Decomposition Rollback Runbook
- [TRIZ_Layered_Rollout_Runbook](operations/TRIZ_Layered_Rollout_Runbook.md) — TRIZ Layered Drill-Down 灰度上線 Runbook

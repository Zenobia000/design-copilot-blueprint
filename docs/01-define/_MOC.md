# 01-define — How does the system work?

> Gates: TR2-TR3
> 模板對應：VibeCoding 04 (ADR) · 05 (Architecture & Design) · 16 (WBS)

## Essential Documents

| #   | Gate | Document | VibeCoding | Status |
|-----|------|----------|------------|--------|
| E2  | TR2  | [E2--statement-of-work](E2--statement-of-work.md) | — | Approved |
| E3  | TR3  | [E3--architecture-and-design](E3--architecture-and-design.md) | 05 | Approved |

## User-Facing 視角

- [E3x--system-interaction-flow](E3x--system-interaction-flow.md) — 目標狀態系統互動流程（對照 00-discover 現狀痛點，描繪設計後使用者 × 子系統 × State Machine 的 end-to-end 體驗流；3 scenarios：Forward TRIZ / Reverse Anti-Anchor / Pre-CAD 審查）

## E3 Appendices — 架構細節（已整合進 E3 主檔）

以下 5 份 SA 視角架構附錄已合併進 E3 主檔（對齊 VibeCoding 05「整合性架構與設計文檔」單檔概念），連結指向 E3 內部錨點：

- [Appendix A · Forward Subsystem Discovery Architecture](E3--architecture-and-design.md#appendix-a-forward-subsystem-discovery-architecture) — 正向分析 · 子系統定義
- [Appendix B · Forward TRIZ Solver Architecture](E3--architecture-and-design.md#appendix-b-forward-triz-solver-architecture) — 正向分析 · TRIZ 解矛盾
- [Appendix C · Reverse Anti-Anchor Architecture](E3--architecture-and-design.md#appendix-c-reverse-anti-anchor-architecture) — 反向探索 · Anti-Anchor
- [Appendix D · State Machine](E3--architecture-and-design.md#appendix-d-state-machine) — 狀態機與 R&R
- [Appendix E · TRIZ → SCAMPER Flow](E3--architecture-and-design.md#appendix-e-triz--scamper-flow) — 雙軌分析決策中心

## ADRs (VibeCoding 04)

- [ADR-001](adrs/ADR-001-baas-first-architecture.md) — BaaS-First Architecture
- [ADR-002](adrs/ADR-002-server-side-business-logic.md) — Server-Side Business Logic
- [ADR-003](adrs/ADR-003-llm-service-hardening.md) — LLM Service Hardening
- [ADR-004](adrs/ADR-004-qa-devops-infrastructure.md) — QA/DevOps Infrastructure
- [ADR-005](adrs/ADR-005-scope-expansion.md) — Scope Expansion

## WBS (VibeCoding 16)

- [E3x--wbs-development-plan](E3x--wbs-development-plan.md) — 主 WBS (release axis)：WS-A API 對齊 / WS-B E2E 差距 / WS-C Mock→Live（2026-04-15 統整，歷史版本見 [_superseded/](../_superseded/_MOC.md)）
- [E3x--wbs-development-plan-addendum](E3x--wbs-development-plan-addendum.md) — Addendum (feature axis)：WS-D..H
  - [`wbs-workstreams/WS-D--triz-layered-drilldown-development`](wbs-workstreams/WS-D--triz-layered-drilldown-development.md) — TRIZ 分層開發 (Create Tab ①)
  - [`wbs-workstreams/WS-E--subsystem-interface-development`](wbs-workstreams/WS-E--subsystem-interface-development.md) — 子系統介面 (Create Tab ②)
  - [`wbs-workstreams/WS-F--tc-to-multipc-decomposition`](wbs-workstreams/WS-F--tc-to-multipc-decomposition.md) — Explore TC→多 PC 分解
  - [`wbs-workstreams/WS-G--l3-sf-parallel-check`](wbs-workstreams/WS-G--l3-sf-parallel-check.md) — Explore L3 Su-Field 平行旁路
  - [`wbs-workstreams/WS-H--playwright-e2e-followup`](wbs-workstreams/WS-H--playwright-e2e-followup.md) — Playwright E2E 補測

## Relocated Files

> 審計後移至正確階段：
> - `E3x--methodology-overview` → [`_domain-knowledge/`](../_domain-knowledge/E3x--methodology-overview.md)
> - `E3x--first-principles-analysis` → [`00-discover/`](../00-discover/E3x--first-principles-analysis.md)
> - `E3x--functional-specification` → [`_superseded/`](../_superseded/E3x--functional-specification.md)（與 E1 PRD §5-§12 重複）
> - `scripts/` (BD Pitch 簡報生成) → [`00-discover/presentations/`](../00-discover/presentations/)
> - `E2x--wbs-api-alignment` · `E2x--wbs-e2e-gap-closure` · `E2x--wbs-mock-to-live-migration` → [`_superseded/`](../_superseded/)（待合併為單一 WBS）

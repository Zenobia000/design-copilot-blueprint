# 01-define — How does the system work?

> Gates: TR2-TR3
> 模板對應：VibeCoding 04 (ADR) · 05 (Architecture & Design) · 16 (WBS)

## Essential Documents

| #   | Gate | Document | VibeCoding | Status |
|-----|------|----------|------------|--------|
| E2  | TR2  | [E2--statement-of-work](E2--statement-of-work.md) | — | Approved |
| E3  | TR3  | [E3--architecture-and-design](E3--architecture-and-design.md) (v2.0, 2026-04-15) | 05 | Active |
| E4  | TR3  | [diagrams/E4--erd](diagrams/E4--erd.md) (v1.0, 2026-04-15) — Supabase migration 權威 ERD、5 張子圖、41 條 FK、RLS 矩陣 | 05 §5 | Draft |

## User-Facing 視角

- [E3x--system-interaction-flow](E3x--system-interaction-flow.md) — 目標狀態系統互動流程（對照 00-discover 現狀痛點，描繪設計後使用者 × 子系統 × State Machine 的 end-to-end 體驗流；3 scenarios：Forward TRIZ / Reverse Anti-Anchor / Pre-CAD 審查）

## E3 結構導覽（v2.0 重構後，2026-04-15）

E3 v2.0 依 VibeCoding Template 05 骨架組織為三部分：

**Part 1 · 架構總覽（§1 – §10，新增 ~600 行）**
- §1 文件目的與範圍
- §2 需求摘要（摘自 E1 PRD）
- §3 高層次架構設計（C4 Context / Container / Component 三層圖）
- §4 技術選型詳述（彙整 package.json / pyproject.toml / ADR-001..005）
- §5 數據架構（Supabase migrations + schemas.py；完整 ERD 待 E4）
- §6 部署與基礎設施（指向 E9 + ADR-001/004）
- §7 跨領域考量（NFR：效能 / 安全 / 可觀測性 / 可靠性 / 可維護性 / 可測試性 / i18n / a11y）
- §8 風險與緩解策略
- §9 架構演進路線圖
- §10 附錄（術語表、變更記錄）

**Part 2 · 詳細設計（§11，承接 v1.4 全部 AI Agent 內容）**
- §11.1 Multi-Agent 架構總覽（原 §1）
- §11.2 逐步自動化分級（原 §2）
- §11.3 打破路徑依賴的 AI 機制（原 §3 + §5，閱讀順序 11.3.1/.2 → 11.4 → 11.3.3/.4）
- §11.4 Agent 間協作流程（原 §4）
- §11.5 技術實作建議（原 §6 + API Endpoints）
- §11.6 驗證方式（原 §7）

**Part 3 · 附錄（SA 視角架構，5 份保留原樣）**
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
- [ADR-006 (harness)](adrs/ADR-006-harness-architecture.md) — Backend Harness Architecture
- [ADR-007 (TC-only)](adrs/ADR-007-tc-only-explore-pc-sf-derivation-in-create.md) — Explore TC-only；Create 派生 PC/SF（2026-04-15）

## WBS (VibeCoding 16)

- **[E3x--wbs-development-plan-v2-0to1](E3x--wbs-development-plan-v2-0to1.md)** — **主 WBS v2.1**（0→1 VibeCoding Template 16 模組結構 1.0–7.0；2026-04-15 經 PM/ARCH/QA 三方 reviewer 交互評估修訂）
- [E3x--wbs-development-plan](E3x--wbs-development-plan.md) — 舊版 WBS v1.0 (workstream axis)：WS-A API 對齊 / WS-B E2E 差距 / WS-C Mock→Live（保留交叉驗證用，歷史版本見 [_superseded/](../_superseded/_MOC.md)）
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

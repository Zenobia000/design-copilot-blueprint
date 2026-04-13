# 01-define — How does the system work?

> Gates: TR2-TR3

## Essential Documents

| #   | Document | Status |
|-----|----------|--------|
| E2  | [E2--statement-of-work](E2--statement-of-work.md) | Approved |
| E3  | [E3--architecture-and-design](E3--architecture-and-design.md) | Approved |

## Extended Documents

- [E3x--state-machine](E3x--state-machine.md) — 狀態機與 R&R
- [E3x--methodology-overview](E3x--methodology-overview.md) — 整合方法論總覽 (E2E) ← from 00-discover
- [E3x--first-principles-analysis](E3x--first-principles-analysis.md) — 第一性原理批判分析 ← from 00-discover
- [E3x--functional-specification](E3x--functional-specification.md) — 功能規格書 (PRD §5-§12 提取) ← from 00-discover

## Architecture (SA 視角)

- [Forward_Subsystem_Discovery_Architecture](architecture/Forward_Subsystem_Discovery_Architecture.md) — 正向分析 · 子系統定義
- [Forward_TRIZ_Solver_Architecture](architecture/Forward_TRIZ_Solver_Architecture.md) — 正向分析 · TRIZ 解矛盾
- [Reverse_Anti_Anchor_Architecture](architecture/Reverse_Anti_Anchor_Architecture.md) — 反向探索 · Anti-Anchor

## ADRs

- [ADR-001](adrs/ADR-001-baas-first-architecture.md) — BaaS-First Architecture
- [ADR-002](adrs/ADR-002-server-side-business-logic.md) — Server-Side Business Logic
- [ADR-003](adrs/ADR-003-llm-service-hardening.md) — LLM Service Hardening
- [ADR-004](adrs/ADR-004-qa-devops-infrastructure.md) — QA/DevOps Infrastructure
- [ADR-005](adrs/ADR-005-scope-expansion.md) — Scope Expansion

## Diagrams

- [triz-to-scamper-flow](diagrams/triz-to-scamper-flow.md) — 雙軌分析 → 候選方案決策中心

## Scripts / Tools

- [build_bd_pitch.py](scripts/build_bd_pitch.py) — BD 簡報 PowerPoint 生成腳本
- [RD_Copilot_BD_Pitch_v1.pptx](scripts/RD_Copilot_BD_Pitch_v1.pptx) — BD 簡報 PowerPoint 檔案

## WBS / Project Schedule

- [E2x--wbs-api-alignment](E2x--wbs-api-alignment.md) — WBS × API 對齊分析
- [E2x--wbs-e2e-gap-closure](E2x--wbs-e2e-gap-closure.md) — E2E 差距修正 WBS
- [E2x--wbs-mock-to-live-migration](E2x--wbs-mock-to-live-migration.md) — Mock → Live 遷移 WBS

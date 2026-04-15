# 02-design — What exactly do we build?

> Gates: TR4-TR5
> Last restructured: 2026-04-15 (5D alignment — flat specs reorganised by domain)

## 頂層架構文檔 (TR4 Gate 主文檔)

- **[E5--system-design-overview](E5--system-design-overview.md)** — 系統設計總覽（IA↔API 對應、specs 導航、TR4 gate 條件）

## Workflow & BDD

- [E6x--schema-codegen-workflow](E6x--schema-codegen-workflow.md) — Schema Codegen Workflow (Pydantic → TS)
- [E7x--e2e-manual-scripts/](E7x--e2e-manual-scripts/) — E2E 手測腳本

## Specs — 依領域分組

### UX / Information Architecture
- [specs/ux/E5x--create-ux-spec](specs/ux/E5x--create-ux-spec.md) — Create 頁面完整 UX 規格 (Tab ①–④)

### TRIZ 解矛盾子系統
- [specs/triz/E5x--triz-layered-drilldown-optimization](specs/triz/E5x--triz-layered-drilldown-optimization.md) — 分層 Drill-Down 架構優化 (L1/L2/L3)
- [specs/triz/E5x--triz-multi-solution-adoption-strategy](specs/triz/E5x--triz-multi-solution-adoption-strategy.md) — 多解併行採納策略 (M1–M6)

### Explore / 子系統
- [specs/explore/E5x--tc-to-multipc-type-alignment](specs/explore/E5x--tc-to-multipc-type-alignment.md) — BE Pydantic ↔ FE TS 型別對照
- [specs/explore/E5x--subsystem-persistence-policy](specs/explore/E5x--subsystem-persistence-policy.md) — Subsystem 持久化策略
- [specs/explore/E5x--three-tier-tree-review-checklist](specs/explore/E5x--three-tier-tree-review-checklist.md) — 三層樹 + 六維契約 Review Checklist

### Review / Gate 模板
- [specs/review-templates/E5x--must-rulebook-template](specs/review-templates/E5x--must-rulebook-template.md) — MUST 可機器執行規則模板
- [specs/review-templates/E5x--pre-cad-review-template](specs/review-templates/E5x--pre-cad-review-template.md) — Pre-CAD Gate 審查模板
- [specs/review-templates/E5x--evidence-matrix-risk-register-template](specs/review-templates/E5x--evidence-matrix-risk-register-template.md) — 證據矩陣 & 風險登記

## 其他位置 (交叉引用)

**WBS 任務分解** 已統一歸檔至 DEFINE 階段：
- [01-define/E3x--wbs-development-plan](../01-define/E3x--wbs-development-plan.md) — 主 WBS (WS-A/B/C release axis)
- [01-define/E3x--wbs-development-plan-addendum](../01-define/E3x--wbs-development-plan-addendum.md) — Addendum (WS-D..H feature axis)
  - WS-D TRIZ 分層開發 / WS-E 子系統介面 / WS-F TC→多 PC / WS-G L3 SF / WS-H Playwright E2E

## VibeCoding 模板對齊

| Template | 對應 |
|----------|------|
| 06 API Design | `E5--system-design-overview.md` §2-3 |
| 07 Module Spec | `specs/triz/*` + `specs/explore/*` |
| 12 Frontend Arch | `specs/ux/E5x--create-ux-spec.md` |
| 17 Frontend IA | `specs/ux/E5x--create-ux-spec.md` (Tab 結構) |

# RD Design Copilot — Documentation Hub

## TR Gate View — Where Are We?

```
DISCOVER        DEFINE         DESIGN         DEVELOP           DELIVER
TR0  TR1       TR2  TR3      TR4  TR5       TR6    TR7        TR8  TR9  TR10
 *    *         *    *        *    ~         .      .          ~    ~    .
```
`*` = gate passed | `~` = in progress | `.` = not started

## 9 Essential Documents + 3 Gate Reviews

| #    | Gate | Document | Status |
|------|------|----------|--------|
| E1   | TR1  | [00-discover/E1--project-brief-and-prd](00-discover/E1--project-brief-and-prd.md) | Approved |
| E2   | TR2  | [01-define/E2--statement-of-work](01-define/E2--statement-of-work.md) + [01-define/adrs/](01-define/adrs/) | Approved |
| E3   | TR3  | [01-define/E3--architecture-and-design](01-define/E3--architecture-and-design.md) | Approved |
| E4   | TR3  | 01-define/diagrams/E4--06_erd (TBD) | Planned |
| E5   | TR4  | [02-design/E5--system-design-overview](02-design/E5--system-design-overview.md) | Active |
| E6   | TR5  | [02-design/E6x--schema-codegen-workflow](02-design/E6x--schema-codegen-workflow.md) | Active |
| E7   | TR5  | [02-design/E7x--e2e-manual-scripts/](02-design/E7x--e2e-manual-scripts/) | Active |
| GR6  | TR6  | 03-develop/GR6--code-complete (TBD) | Template |
| GR7  | TR7  | 03-develop/GR7--integration (TBD) | Template |
| E8   | TR8  | 04-deliver/E8--security-and-readiness-checklists (TBD) | Planned |
| E9   | TR9  | 04-deliver/E9--deployment-and-operations-guide (TBD) | Draft |
| GR10 | TR10 | 04-deliver/GR10--ga-readiness (TBD) | Template |

## The 5D Phases

| Phase    | Folder | Question | Gates |
|----------|--------|----------|-------|
| DISCOVER | [00-discover/](00-discover/_MOC.md) | What problem are we solving? | TR0-TR1 |
| DEFINE   | [01-define/](01-define/_MOC.md) | How does the system work? | TR2-TR3 |
| DESIGN   | [02-design/](02-design/_MOC.md) | What exactly do we build? | TR4-TR5 |
| DEVELOP  | [03-develop/](03-develop/_MOC.md) | Does the code work? | TR6-TR7 |
| DELIVER  | [04-deliver/](04-deliver/_MOC.md) | Can we ship and operate it? | TR8-TR10 |

## Supporting Zones

| Zone | Purpose |
|------|---------|
| [_domain-knowledge/](_domain-knowledge/_MOC.md) | RD 設計方法論專業知識 (SCAMPER, TRIZ, KT) |
| [_gap-analysis/](_gap-analysis/) | 缺口分析 vs 投資人/合約需求 |
| [_meeting-minutes/](_meeting-minutes/) | 會議決策紀錄 |
| [_superseded/](_superseded/_MOC.md) | 已被取代的文件版本 |

## Knowledge Flow

```
00-discover (WHY)
    |
    v
01-define (HOW) <---> _domain-knowledge (WHAT WE KNOW)
    |
    v
02-design (WHAT TO BUILD)
    |
    v
03-develop (CODE & VERIFY)
    |
    v
04-deliver (SHIP & OPERATE)

_gap-analysis <--- validates all zones
```

## Reading Paths

### Path A: New Team Member
1. [E1--project-brief-and-prd](00-discover/E1--project-brief-and-prd.md) — What we are building and why
2. [E1x--user-journey-map](00-discover/E1x--user-journey-map.md) — How users interact with the system
3. [E3--architecture-and-design](01-define/E3--architecture-and-design.md) — Technical architecture overview
4. [E6x--schema-codegen-workflow](02-design/E6x--schema-codegen-workflow.md) — How we work

### Path B: Investor / Stakeholder
1. [RD_Copilot_Executive_Summary](00-discover/presentations/RD_Copilot_Executive_Summary.md) — One-page architecture
2. [RD_Copilot_BD_Pitch_v1](00-discover/presentations/RD_Copilot_BD_Pitch_v1.md) — Competitive advantages
3. [E2--statement-of-work](01-define/E2--statement-of-work.md) — Timeline and progress

### Path C: Building a Feature
1. [02-design/specs/](02-design/_MOC.md) — Find the technical spec
2. [01-define/E3--architecture-and-design § Appendix](01-define/E3--architecture-and-design.md#appendix架構細節整合) — Visual references + SA architecture appendices (A-E, integrated into E3)

### Path D: Understanding the Domain
1. [_domain-knowledge/](_domain-knowledge/_MOC.md) — 方法論知識庫

## Document Status Legend

| Status | Meaning |
|--------|---------|
| Approved | Reviewed and accepted |
| Active | Living document, updated regularly |
| Draft | Work in progress |
| Template | Gate review checklist, fill in during gate review |
| Planned | Identified but not yet created |
| Superseded | Replaced by newer version (see [_superseded/](_superseded/_MOC.md)) |

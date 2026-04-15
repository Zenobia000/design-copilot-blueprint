# E5x — 前端資訊架構 (Frontend Information Architecture)

---

**文件版本 (Document Version):** `v1.0`
**最後更新 (Last Updated):** `2026-04-15`
**主要作者 (Lead Author):** `UX / Frontend Lead`
**狀態 (Status):** `Active`
**對應 VibeCoding 模板:** `17_frontend_information_architecture_template.md`
**上游:** [`specs/ux/E5x--create-ux-spec.md`](specs/ux/E5x--create-ux-spec.md) · [`01-define/E3x--system-interaction-flow.md`](../01-define/E3x--system-interaction-flow.md)

> **說明**：本檔為 IA 骨架；各頁面細節（尤其 Create）在 [`specs/ux/E5x--create-ux-spec.md`](specs/ux/E5x--create-ux-spec.md) 已充分覆蓋。

---

## 目錄

- [1. 文檔目的與範圍](#1-文檔目的與範圍)
- [2. 核心設計原則](#2-核心設計原則)
- [3. 資訊架構總覽](#3-資訊架構總覽)
- [4. 核心用戶旅程](#4-核心用戶旅程)
- [5. 網站地圖與導航結構](#5-網站地圖與導航結構)
- [6. 頁面詳細規格](#6-頁面詳細規格)
- [7. 組件連結與導航系統](#7-組件連結與導航系統)
- [8. 數據流與狀態管理](#8-數據流與狀態管理)
- [9. URL 結構與路由規範](#9-url-結構與路由規範)
- [10. 實施檢查清單與驗收標準](#10-實施檢查清單與驗收標準)
- [11. 附錄](#11-附錄)

---

## 1. 文檔目的與範圍

為 **RD Design Copilot** 前端所有頁面定義統一 IA，作為導航 / 組件連結 / 狀態流 / URL 規範的權威參考；對齊 E3x 三大 Scenario 與 Create UX spec 的 Tab 結構。

**包含**：所有路由、導航、跨頁狀態、URL 規範。  
**排除**：Create 頁 Tab ①–④ 細節互動（見 UX spec）。

## 2. 核心設計原則

- **任務導向**：以 RD 核心任務（解矛盾、探索反向、審查 gate）為分區。
- **Progressive disclosure**：複雜流程以 Tab + drill-down 分層揭露。
- **可追溯**：URL 可還原精確狀態（project_id / tab / contradiction_id 等）。
- **最短路徑**：核心三流程（TRIZ / Anti-Anchor / Pre-CAD）從 dashboard 最多 2 次點擊抵達。
- **一致性**：所有頁面共用 `layouts/` 與 sidebar/topbar。

## 3. 資訊架構總覽

```
RD Design Copilot
├── 認證 (Auth)
│   ├── /auth (登入/註冊)
│   └── /reset-password
├── 專案入口
│   ├── /projects            (ProjectList)
│   └── /projects/:id        (ProjectDashboard)
├── 5D 階段流程
│   ├── /projects/:id/task-definition   (Define: Brief + 5W1H)
│   ├── /projects/:id/explore           (Explore: Anti-Anchor + L2/L3)
│   ├── /projects/:id/create            (Design: TRIZ + Subsystem + 3 tier tree)
│   │   ├── ?tab=triz        Tab ①
│   │   ├── ?tab=subsystem   Tab ②
│   │   ├── ?tab=decision    Tab ③
│   │   └── ?tab=tree        Tab ④
│   ├── /projects/:id/pre-cad-review/:rid (Review Gate)
│   ├── /projects/:id/decision-record     (KT 決策)
│   ├── /projects/:id/track               (假設追蹤 / 實驗)
│   ├── /projects/:id/cad-in-progress     (CAD 階段佔位)
│   └── /projects/:id/design-review
├── 知識庫 / 輔助
│   ├── /knowledge-base
│   ├── /constraint-label-dictionary
│   └── /feynman                  (learning / explainer)
├── 系統
│   ├── /settings
│   └── /dev-seed                 (dev only)
└── /* (NotFound)
```

## 4. 核心用戶旅程

### Journey 1: Forward TRIZ 解矛盾（對應 E3x §2）
1. `/projects` → 選 project → `/projects/:id`
2. Dashboard → 點 "Create" → `/projects/:id/create?tab=triz`
3. 選 contradiction → "Solve Layered" → L1 卡顯示
4. 若需 → 手動或自動 drill-down → L2/L3
5. 多解時 → Tab ③ Decision Center 決定採納策略

### Journey 2: Reverse Anti-Anchor（對應 E3x §3）
1. `/projects/:id` → "Explore" → `/projects/:id/explore`
2. 選 anchor solution → "Anti-Anchor Routes" → 3 條路線
3. 點 "Validation Passport" → Track 頁追蹤假設
4. `/projects/:id/track`

### Journey 3: Pre-CAD Gate（對應 E3x §4）
1. Dashboard → "Pre-CAD Review" → `/projects/:id/pre-cad-review/:rid`
2. "AI Analyze" → 六維評分 + citations
3. "Sign & Pass Gate" → `/projects/:id/decision-record`

## 5. 網站地圖與導航結構

### 全域導航
- **Topbar**：Logo / Project picker / User menu / Theme toggle。
- **Sidebar**（專案內）：Dashboard / Task Definition / Explore / Create / Pre-CAD Review / Decision Record / Track / Knowledge Base / Settings。
- **Breadcrumb**：`Projects > [Name] > [Stage]`。

### 底層結構
- 所有 `/projects/:id/*` 受 `ProtectedRoute` + project ownership 檢查保護。
- `/auth`、`/reset-password` 為 public。
- `/dev-seed` dev-only。

## 6. 頁面詳細規格

| Page | Route | 主要組件 | 對應後端端點 | 參考 Spec |
|---|---|---|---|---|
| ProjectList | `/projects` | `projects/*` | `TBD — project CRUD` | — |
| ProjectDashboard | `/projects/:id` | `dashboard/*` | 多端點聚合 | — |
| TaskDefinition | `/projects/:id/task-definition` | `task-definition/*`, `brief/*` | `/definitions/*`, `/questions/*` | — |
| Explore | `/projects/:id/explore` | `explore/*`, `contradiction/*` | `/alternatives/anti-anchor`, `/unknown-factors/*`, `/causal-loops/*` | — |
| Create | `/projects/:id/create` | `create/*`（Tab ①–④） | `/triz/solve-layered`, `/scamper/*`, `/contradictions/*` | **[create-ux-spec](specs/ux/E5x--create-ux-spec.md)** |
| PreCadReview | `/projects/:id/pre-cad-review/:rid` | `precad/*`, `review/*` | `/pre-cad-reviews/:rid/ai-analyze`, `/must/*` | [pre-cad template](specs/review-templates/E5x--pre-cad-review-template.md) |
| DecisionRecord | `/projects/:id/decision-record` | `solution/*`, `evidence/*` | `/actions/*`, `/risks/*` | — |
| Track | `/projects/:id/track` | `track/*`, `assumption/*` | `/assumptions/*`, `/alternatives/validation-passport` | — |
| DesignReview | `/projects/:id/design-review` | `review/*` | TBD | — |
| KnowledgeBase | `/knowledge-base` | — | `/knowledge/*` | — |
| Auth | `/auth`, `/reset-password` | `auth/*` | Supabase Auth | — |
| Settings | `/settings` | — | TBD | — |
| Feynman | `/feynman` | — | — | — |
| NotFound | `/*` | — | — | — |

頁面細節 `TBD — <fe-lead TBD> by 2026-05-15 TBD`（除 Create 已在 UX spec 詳盡）。

## 7. 組件連結與導航系統

- **NavLink.tsx**：所有頁間連結；自動高亮當前路由。
- **Breadcrumb**：衍生自 route meta — `TBD` 是否集中 meta 或每頁宣告。
- **Cross-link 規則**：
  - Contradiction 卡 → 可跳 Create Tab ① 對應 contradiction。
  - Anti-Anchor 路線 → 可跳 Track 頁對應 Validation Passport。
  - Pre-CAD 評分 → 可跳 Decision Record 當前 gate。
- **Command Menu**：`TBD — <fe-lead TBD> by 2026-Q3 TBD`（cmd+k 全局搜尋）。

## 8. 數據流與狀態管理

- **Server state**：`@tanstack/react-query`；per-page hooks in `src/hooks/`。
- **Client UI state**：Zustand store per feature（e.g. `createStore` 管 Tab 切換、drill-down 狀態）— 具體劃分 TBD。
- **Global context**：`AuthContext`, `ThemeContext`（`src/contexts/`）。
- **URL as state**：主要 state（tab、當前 contradiction、filter）寫入 query string，可分享/回復。
- **Form state**：`react-hook-form` + `zod`。

## 9. URL 結構與路由規範

- **Pattern**：`/projects/:projectId/:stage[/:resourceId][?tab=X&...]`
- **stage** ∈ `task-definition | explore | create | pre-cad-review | decision-record | track | design-review | cad-in-progress`。
- **Query params**：`tab`, `contradictionId`, `subsystemId`, `view`；均需為 URL-safe (kebab / short slug)。
- **404 fallback**：`NotFound.tsx`。

## 10. 實施檢查清單與驗收標準

- [ ] 每個 Route 有對應 page 元件
- [ ] 所有 `/projects/:id/*` 受 auth guard
- [ ] Breadcrumb 可還原層級
- [ ] 關鍵 state 可由 URL 重建（深連結測試）
- [ ] 側欄 active 狀態準確
- [ ] BDD scenarios 覆蓋三大 Journey
- [ ] E7x 手測腳本覆蓋核心 URL

## 11. 附錄

### A. 延伸閱讀
- Create 頁完整 UX → [`specs/ux/E5x--create-ux-spec.md`](specs/ux/E5x--create-ux-spec.md)
- 前端架構 → [`E5x--frontend-architecture.md`](E5x--frontend-architecture.md)
- BDD scenarios → [`E5x--bdd-scenarios.md`](E5x--bdd-scenarios.md)
- E3x 三大 scenario → [`../01-define/E3x--system-interaction-flow.md`](../01-define/E3x--system-interaction-flow.md)

### B. TBD 清單
- 各頁面（除 Create）完整 wireframe · command menu · breadcrumb meta · Zustand store 劃分

# E5x — 前端架構規格 (Frontend Architecture Specification)

---

**文件版本 (Document Version):** `v1.0`
**最後更新 (Last Updated):** `2026-04-15`
**主要作者 (Lead Author):** `Frontend Lead`
**狀態 (Status):** `Active`
**對應 VibeCoding 模板:** `12_frontend_architecture_specification.md`
**上游:** [`specs/ux/E5x--create-ux-spec.md`](specs/ux/E5x--create-ux-spec.md) · [`E5--api-design-specification.md`](E5--api-design-specification.md)

> **說明**：本文件為骨架文件；具體 Create 頁 UX 與互動細節已在 [`specs/ux/E5x--create-ux-spec.md`](specs/ux/E5x--create-ux-spec.md) 詳盡記錄。本檔聚焦跨頁面的架構級決策。

---

## 目錄

- [第一部分：前端架構的第一性原理](#第一部分前端架構的第一性原理)
- [第二部分：前端架構的系統化分層](#第二部分前端架構的系統化分層)
- [第三部分：前端設計系統](#第三部分前端設計系統)
- [第四部分：技術選型與架構決策](#第四部分技術選型與架構決策)
- [第五部分：效能與優化策略](#第五部分效能與優化策略)
- [第六部分：可用性與無障礙設計](#第六部分可用性與無障礙設計)
- [第七部分：前端工程化實踐](#第七部分前端工程化實踐)
- [第八部分：前後端協作契約](#第八部分前後端協作契約)
- [第九部分：監控、日誌與安全](#第九部分監控日誌與安全)
- [第十部分：前端開發檢查清單](#第十部分前端開發檢查清單)
- [附錄](#附錄)

---

## 第一部分：前端架構的第一性原理

1. **User-centric**：所有 UI 決策回答「RD 要解什麼問題？」（參 00-discover 痛點 → E3x Scenario 1/2/3）。
2. **Single source of truth**：型別來自 `backend/app/models/schemas.py`（透過 pydantic2ts 同步至 `src/types/generated/`）。
3. **Feature-first organization**：`src/components/{create,explore,review,...}` 按頁面功能切分，避免 MVC 按類型切分。
4. **Progressive disclosure**：複雜流程（TRIZ L1→L2→L3）採分層 drill-down，不一次全展開。
5. **Observable state**：所有跨組件狀態走 React Query（server）+ Zustand/Context（local UI）；避免 prop drilling。

## 第二部分：前端架構的系統化分層

```
┌──────── Pages (src/pages/) ────────┐
│  Route 宣告、高階 layout            │
├──────── Features (src/components/{create,explore,...}/) ──┤
│  Feature 組件；呼叫 hooks            │
├──────── Hooks (src/hooks/) ────────┤
│  useLayeredTrizSolve / useSubsystemSuggestion / ...        │
├──────── Integrations (src/integrations/) ────────┤
│  fetch + auth + adapter (snake↔camel) + error normalize    │
├──────── Types (src/types/ + types/generated/) ────────┤
│  手寫 UI 型別 + codegen 後端契約                          │
├──────── UI primitives (src/components/ui/) ────────┤
│  shadcn/ui + radix-ui                                      │
└────────────────────────────────────┘
```

**分層規則**：
- 上層可依賴下層，反向禁止。
- `components/ui/` 為葉節點，不可 import feature 或 hook。
- `pages/` 不直接呼叫 API；必須透過 hook。

## 第三部分：前端設計系統

- **UI Kit**：shadcn/ui（手動安裝組件至 `src/components/ui/`，便於客製）。
- **樣式系統**：TailwindCSS 3.x + CSS variables for theme（`src/index.css`）。
- **Theme**：Light / Dark 透過 `ThemeProvider.tsx` 切換。
- **Design tokens**：`tailwind.config.ts` 中的 `theme.extend.colors` 集中管理；對齊 `rd_assistant_design_system/` 視覺規範 — `TBD — <design lead TBD> by 2026-05 TBD`。
- **Iconography**：`lucide-react`（預設）；品牌圖示 TBD。

## 第四部分：技術選型與架構決策

| 決策 | 選擇 | 備選 | 理由 | ADR |
|---|---|---|---|---|
| Framework | React 19 | Vue 3, Svelte | 團隊熟悉、生態系 | TBD |
| Build tool | Vite | Next.js, Webpack | SPA 需求，啟動快 | TBD |
| Routing | react-router v6 | tanstack router | 成熟、路徑配置集中 | TBD |
| Server state | `@tanstack/react-query` | SWR | cache/invalidation 完整 | TBD |
| Client state | Zustand / Context | Redux | 輕量、React 19 相容 | TBD |
| Form | react-hook-form + zod | Formik | 效能 + 型別 | TBD |
| Styling | Tailwind + shadcn/ui | CSS Modules, Emotion | utility-first、可客製 | TBD |
| Type system | TypeScript strict + codegen | — | 與 backend schema 零漂移 | ADR-003 schema codegen |
| Test | Vitest + React Testing Library + Playwright (E2E) | Jest, Cypress | 與 Vite 原生整合 | TBD |

## 第五部分：效能與優化策略

- **Code splitting**：react-router route-level lazy import（`Create`, `Explore`, `PreCadReview` 等大頁）。
- **React Query**：`staleTime` 預設較長、結合 `invalidateQueries` 精準失效。
- **Memoization**：`React.memo` + `useMemo` 僅對明確瓶頸使用。
- **Bundle budget**：主 bundle < 300KB gz — `TBD — <fe-lead TBD>`。
- **LLM latency 緩解**：Create Tab ① 採 streaming UI（skeleton + 分層逐步顯示）；對應 `specs/triz/E5x--triz-layered-drilldown-optimization.md`。

## 第六部分：可用性與無障礙設計

- **WCAG 2.1 AA**：依賴 radix-ui primitive 的 aria 屬性；focus ring 維持預設。
- **鍵盤**：所有 Tab / dialog / command menu 可鍵盤操作。
- **錯誤狀態**：`ErrorBoundary.tsx` 全域包裹；顯示友善 fallback 並 capture 至 observability。
- **i18n**：目前 zh-TW only；英文介面為 `TBD — <pm TBD> by 2026-Q3 TBD`。

## 第七部分：前端工程化實踐

- **Lint / Format**：ESLint + Prettier；pre-commit hook — `TBD — <infra TBD>`。
- **TypeScript strict**：`strict: true`, `noUnusedLocals: true`。
- **Commit**：Conventional Commits（見專案 git log）。
- **Storybook**：`TBD — <fe-lead TBD> by 2026-Q3 TBD`（優先 `components/ui/`）。
- **CI**：`TBD — <infra TBD>`（build, typecheck, vitest, playwright smoke）。

## 第八部分：前後端協作契約

- **API 契約**：見 [`E5--api-design-specification.md`](E5--api-design-specification.md)。
- **Schema codegen**：Pydantic → TS 一鍵同步，見 [`E6x--schema-codegen-workflow.md`](E6x--schema-codegen-workflow.md)。
- **命名轉換**：前端 camelCase、後端 snake_case；`src/integrations/` 擔任 adapter。參 [`specs/explore/E5x--tc-to-multipc-type-alignment.md`](specs/explore/E5x--tc-to-multipc-type-alignment.md)。
- **錯誤契約**：後端 `{error:{type,code,message,param,request_id}}` → 前端 normalize 成 `ApiError` 物件並 toast。

## 第九部分：監控、日誌與安全

- **Monitoring**：`TBD — <infra TBD>`（預設用 Sentry for FE + Anthropic/OpenAI 使用量）。
- **Logging**：console in dev；prod 送至 observability endpoint `TBD`。
- **Security**：
  - Auth：Supabase Auth session，`Authorization: Bearer <jwt>` 由 `src/integrations/` 自動附加。
  - XSS：依賴 React 預設 escape；任何 `dangerouslySetInnerHTML` 必須 PR review。
  - CSP：部署於 edge — `TBD`。

## 第十部分：前端開發檢查清單

- [ ] 新頁面/組件放對 `src/components/{feature}/`？
- [ ] 型別來自 `src/types/generated/` 還是手寫 `src/types/`（分清邊界）？
- [ ] 有 hook 隔離 API 呼叫？避免組件內直接 fetch？
- [ ] 無障礙：focus / aria / keyboard？
- [ ] Error boundary / loading skeleton / empty state 三態齊備？
- [ ] BDD scenario（`E5x--bdd-scenarios.md`）有對應？
- [ ] E7x 手測腳本有覆蓋關鍵路徑？

---

## 附錄

### A. 延伸閱讀（已在其他 spec 覆蓋）
- Create 頁完整 UX → [`specs/ux/E5x--create-ux-spec.md`](specs/ux/E5x--create-ux-spec.md)
- 資訊架構總覽 → [`E5x--frontend-information-architecture.md`](E5x--frontend-information-architecture.md)
- 檔案依賴 → [`specs/E5x--file-dependencies.md`](specs/E5x--file-dependencies.md)
- 類別關係 → [`specs/E5x--class-relationships.md`](specs/E5x--class-relationships.md)
- 專案結構 → [`E5x--project-structure-guide.md`](E5x--project-structure-guide.md)

### B. TBD 清單
- Bundle budget 定案 · Storybook 建置 · i18n 策略 · 完整 design token · monitoring 方案

# GR6x — Code Review and Refactoring Guide

| 項目 | 內容 |
|------|------|
| **文件版本** | v1.0 |
| **最後更新** | 2026-04-15 |
| **狀態** | Active |
| **擁有者** | Development Team |

> 本指南將 VibeCoding 模板 `11_code_review_and_refactoring_guide.md` 結構對應至 RD Design Copilot 專案（FastAPI 後端 + Vite/React/TS 前端 + Supabase BaaS）實況。

---

## 🎯 Purpose

為 RD Design Copilot 專案（前端 Vite + React 18 + TypeScript、後端 FastAPI + Python 3.10+、資料層 Supabase PostgreSQL）提供統一的 code review 與重構流程，確保 AI 編排層、前端業務邏輯、以及 Supabase migrations 的品質與可維護性。

範疇：
- `backend/app/` — FastAPI + LangGraph + Anthropic Agent 編排層（16 個 AI 端點，10 個 routers）
- `src/` — Vite + React + shadcn/ui + React Query + `@supabase/supabase-js`
- `supabase/migrations/` — 27 張表 Schema + RLS 策略

---

## 🔍 Code Review Process

### Pre-Review Checklist

提交 PR 前，作者需確認：

- [ ] **前端** `npm run lint` 無錯誤（eslint 9 + typescript-eslint，設定見 `eslint.config.js`）
- [ ] **前端** `npm run build` 成功（Vite build，tsc 型別檢查）
- [ ] **前端** `npm run test` 綠燈（Vitest + Testing Library；見 `vitest.config.ts`）
- [ ] **後端** `ruff check backend/app` 無錯誤（規則 `E, F, I, N, W`，line-length=120；見 `backend/pyproject.toml`）
- [ ] **後端** `pytest backend/tests` 綠燈（`asyncio_mode=auto`）
- [ ] **Migrations** 新增 SQL 有對應 rollback 說明或 down migration
- [ ] 自我 review 完成（diff 過一遍）
- [ ] 相關 ADR / _MOC.md / E 系列文件同步更新（若影響架構或交付物）

> CI/CD pipeline 尚未建立（見 ADR-004 — 不納入 v1.0 範圍）。在 CI 就緒前，上述檢查由作者本地執行並於 PR 描述中勾選。TBD — DevOps owner TBD by 2026-Q3 TBD。

### Review Focus Areas

#### 1. Code Quality
- **Readability**：命名對齊領域詞彙（Contradiction / TC / PC / Layered Solution / Gate）
- **Maintainability**：AI prompt 變更是否仍落在 `backend/app/prompts/`（ADR-003 Phase 2 外部化後為 `templates/*.md`）
- **Consistency**：前端 hooks 使用 `useSupabaseQuery` / `useSupabaseMutation`（見 `src/hooks/api/useSupabaseQuery.ts`）；後端 agent functions 統一呼叫 `call_llm_json` / `call_llm_structured`
- **Complexity**：LangGraph / 多 agent 編排流程需附流程圖或註解

#### 2. Architecture & Design
- **SOLID**：agent 各司其職（analyst / triz_solver / evaluator / knowledge），不跨層呼叫
- **BaaS-First 紀律（ADR-001）**：CRUD 走前端 Supabase client + RLS；後端僅負責 AI 編排，勿新增 CRUD endpoint
- **Server-side 業務邏輯（ADR-002）**：狀態機、Gate 檢查若必要，放 Supabase RPC 或 FastAPI
- **API Design**：新增 FastAPI 端點需有 Pydantic request/response schema，`/docs` 自動文件可預覽

#### 3. Performance & Security
- **Performance**：LLM 呼叫須走 retry 裝飾器（ADR-003 Phase 1），避免阻塞型輪詢
- **Security**：
  - 禁止硬編碼 secrets（`ANTHROPIC_API_KEY` / Supabase service-role key 僅透過 `.env`）
  - 前端不得使用 service-role key（僅 anon key + RLS）
  - 所有 SQL 走 parameterised query（Supabase JS client 預設安全）
- **Error Handling**：LLM JSON 解析走 Pydantic `.model_validate()`（ADR-003）

---

## 🔄 Refactoring Guidelines

### When to Refactor

- LLM prompt 膨脹 > 3KB，考慮拆 sub-prompt
- 前端元件 > 300 行，考慮拆 hook / sub-component
- Supabase query 在多處重複，考慮抽 `useSupabaseQuery` key
- Agent function 超過 3 次 LLM 呼叫未抽模組

### Refactoring Strategies（對齊 VibeCoding 模板）

#### 1. Extract Method
本專案常見場景：將 LLM 呼叫、JSON 容錯、Pydantic 驗證抽成 `agents/base.py::call_llm_structured`（見 ADR-003 Phase 1）。

#### 2. Extract Variable / Hook
前端常見場景：將 Supabase `select / filter / order` 條件抽成自訂 hook，例如 `useContradictionScan`、`useConvergenceLoop`。

#### 3. Prompt 外部化（Phase 2）
Python 字串常數 → `backend/app/prompts/templates/*.md`，Python 模組僅 `load_template("...")`。

---

## 📋 Review Templates

### Pull Request Template

```markdown
## Summary
簡述變更目的與範圍。

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change（需同步 ADR）
- [ ] Documentation update
- [ ] Migration（含 Supabase schema 或 RLS）

## Testing
- [ ] `npm run lint` pass
- [ ] `npm run test` pass
- [ ] `ruff check backend/app` pass
- [ ] `pytest backend/tests` pass
- [ ] Manual smoke test（描述步驟）

## Checklist
- [ ] 自我 review 完成
- [ ] 相關 _MOC.md / ADR / E 文件已更新
- [ ] 無硬編碼 secrets
- [ ] LLM prompt 變更已記錄於 commit 說明
```

### Review Comment Templates
- **Suggestion**：「建議以 `useSupabaseQuery` 替代，可重用快取與錯誤處理」
- **Question**：「這段為何不走 RLS？service-role 繞過 RLS 是刻意的嗎？」
- **Nitpick**：「變數名建議用 `contradictionId` 與 schema 對齊」
- **Praise**：「Prompt 抽成 template 很俐落，後續 A/B 測試會受益」

---

## 🎯 Quality Gates

### Before Merge
- [ ] 所有自動檢查（lint / type / test）pass
- [ ] 至少 1 名同儕 review 通過
- [ ] 若涉及安全（認證、RLS、secrets），需安全 owner sign-off — owner TBD by 2026-Q2 TBD
- [ ] 若涉及新 AI 端點，需更新 `backend/tests/routers/test_*.py`（ADR-004）
- [ ] 文件審查（README / _MOC.md / ADR）

### Post-Merge
- [ ] 部署至 staging 成功（docker-compose up；見 E9 Deployment Guide）
- [ ] `/api/v1/health` / `/health` 200
- [ ] 5 分鐘內無新 5xx 異常 — 告警接收人 TBD by 2026-Q3 TBD
- [ ] 用戶驗收（若功能面向外部）

---

## 附錄 — 專案實際工具鏈

| 面向 | 工具 | 設定檔 |
|------|------|--------|
| 前端 Lint | eslint 9 + typescript-eslint | `eslint.config.js` |
| 前端 Test | Vitest + Testing Library | `vitest.config.ts` |
| 前端 Build | Vite + SWC | `vite.config.ts` |
| 後端 Lint | ruff (E,F,I,N,W) | `backend/pyproject.toml` |
| 後端 Test | pytest + pytest-asyncio | `backend/pyproject.toml` |
| 型別 | TypeScript 5 / Pydantic 2 | `tsconfig*.json`, `schemas.py` |
| CI | 未建立 | TBD — DevOps owner TBD by 2026-Q3 TBD |

---

**Note**：本指南為 Active 文件，隨工具鏈演進（尤其 CI 建立後）更新。

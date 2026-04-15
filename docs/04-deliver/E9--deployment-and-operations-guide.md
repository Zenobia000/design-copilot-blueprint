# E9 — Deployment and Operations Guide

| 項目 | 內容 |
|------|------|
| **文件版本** | v1.0 |
| **最後更新** | 2026-04-15 |
| **狀態** | Draft |
| **擁有者** | DevOps / Release Eng. TBD by 2026-Q3 TBD |

> 本指南將 VibeCoding 模板 `14_deployment_and_operations_guide.md` 對應至 RD Design Copilot v1.0 的 BaaS-First 架構，並引用既有 operations runbook，避免重複。

---

## 🎯 Purpose

為 RD Design Copilot v1.0 提供統一的部署、基礎設施與運維指南，涵蓋：
- docker-compose 單機部署（dev / staging）
- Supabase 作為外部託管 PostgreSQL + Auth + RLS
- Anthropic API 作為 LLM 供應商
- 兩份既有 feature-level rollout / rollback runbook（見 §Runbook 引用）

---

## 🏗️ Deployment Architecture

### Environment Strategy

```
Development → Staging → Production
     ↓           ↓          ↓
   docker      docker     docker-compose 或
   compose     compose    K8s（TBD by 2026-Q4 TBD）
   localhost   staging    production domain TBD
```

### Infrastructure Components

| 元件 | 實作 | 備註 |
|------|------|------|
| **Frontend** | nginx:alpine（Vite build 產物） | `Dockerfile`（multi-stage）、`nginx.conf` |
| **Backend (AI Orchestration)** | FastAPI + uvicorn | `backend/Dockerfile` |
| **Database / Auth / RLS** | Supabase（外部 SaaS） | 27 張表；ADR-001 |
| **LLM Provider** | Anthropic Claude API | ADR-003 retry + Pydantic validation |
| **Load Balancer** | nginx（前端）；上游 LB TBD by 2026-Q3 TBD | |
| **CDN** | TBD by 2026-Q3 TBD | |
| **Monitoring** | 未導入 — 見 E8 §G.1、TBD by 2026-Q3 TBD | |

詳見 `docker-compose.yml` 與 ADR-001 / ADR-004。

---

## 🔄 CI/CD Pipeline

**現況**：無 CI/CD pipeline（ADR-004 明確不納入 v1.0 範圍）。v1.0 採手動部署。

**v1.1 規劃** — TBD by 2026-Q3 TBD（Owner：DevOps TBD）：

### 1. Build Stage
```yaml
build:
  steps:
    - checkout: code
    - install: npm ci（前端）／ pip install -e ".[dev]"（後端）
    - lint: npm run lint + ruff check backend/app
    - test: npm run test + pytest backend/tests
    - docker_build: frontend + backend images
```

### 2. Test Stage
```yaml
test:
  steps:
    - deploy: staging (docker-compose)
    - smoke: curl /health + frontend index
    - e2e: Playwright（ADR-004 規劃 1 個 smoke test）
```

### 3. Deploy Stage
```yaml
deploy:
  strategy: rolling（docker-compose restart 或 K8s rolling update）
  steps:
    - apply: supabase migrations（`supabase/migrations/`）
    - push: images
    - restart: containers
    - verify: /health + smoke
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] 所有 PR 已 code review 通過（見 [GR6x Code Review Guide](../03-develop/GR6x--code-review-guide.md)）
- [ ] `npm run lint` / `npm run build` / `npm run test` 綠燈
- [ ] `ruff check backend/app` / `pytest backend/tests` 綠燈
- [ ] Supabase migrations 已於 staging 驗證（`supabase/migrations/`）
- [ ] 安全檢查清單 E8 的 P0 項目皆 clear
- [ ] Rollback 計畫已明確（見 §Rollback）
- [ ] 團隊通知（Slack / Email — owner TBD by 2026-Q2 TBD）

### During Deployment
- [ ] 監看 `docker-compose logs -f`
- [ ] 驗證 `/health`（backend）與前端首頁 200
- [ ] 觀察 Supabase realtime 連線穩定
- [ ] Anthropic 呼叫成功率 > 95%

### Post-Deployment
- [ ] Smoke：建立專案 → Brief → Socratic → Contradiction → TRIZ（對齊 ADR-004 E2E 流程）
- [ ] 錯誤率觀察 30 分鐘
- [ ] 文件更新（_MOC.md / CHANGELOG — TBD by 2026-Q3 TBD）
- [ ] 若有問題，執行對應 runbook（見 §Runbook 引用）

---

## 🔧 Deployment Strategies

### v1.0 — docker-compose 單機

```bash
# 1. 設定 .env（參考 .env.example — TBD 若不存在 by 2026-Q2 TBD）
cp .env.example .env
vim .env  # 填入 ANTHROPIC_API_KEY, VITE_SUPABASE_* 等

# 2. 套用 Supabase migrations（透過 Supabase CLI 或 Dashboard）

# 3. 啟動
docker-compose up -d --build

# 4. 驗證
curl http://localhost:8000/health
open http://localhost:8080
```

### v1.1+ — Rolling / Blue-Green（規劃）

Rolling / Blue-Green / Canary 策略 TBD by 2026-Q4 TBD（Owner：DevOps TBD）。目前單機 docker-compose 採「停機升級」策略，窗口 < 2 分鐘。

---

## 📊 Monitoring and Alerting

**現況**：未導入監控平台（見 E8 §G.1）。

### Key Metrics（待導入目標）

| 類別 | 指標 | 目標 |
|------|------|------|
| Application | Response time P95 | < 1500ms（含 LLM 呼叫） |
| Application | Error rate | < 1%（不含使用者端取消） |
| Application | LLM retry rate | < 20%（ADR-003 retry） |
| Infrastructure | CPU | < 80% |
| Infrastructure | Memory | < 85% |
| Business | Contradiction scan 成功率 | > 90% |
| Business | Gate sign-off 達成率 | 依 PRD KPI — TBD |

### Alert Configuration
告警工具 / 接收人 TBD by 2026-Q3 TBD（Owner：Ops TBD）。

---

## 🔄 Rollback Procedures

### Feature-level Runbook（已存在，以下引用不重複內容）

本專案已有兩份場景級 runbook，部署遇到以下問題請直接依據：

- **TRIZ Layered Drill-Down 灰度切換與回退**：[`operations/TRIZ_Layered_Rollout_Runbook.md`](operations/TRIZ_Layered_Rollout_Runbook.md)
  - 涵蓋 S1~S4 四階段切換、`VITE_TRIZ_LAYERED_MODE` flag 回退、`layered_solution` JSONB 相容性
- **PC Decomposition 緊急停用**：[`operations/runbook_pc_decomposition.md`](operations/runbook_pc_decomposition.md)
  - 涵蓋前端 early-return 停用、後端停用、Migration 009 回滾

### Release-level Rollback（docker-compose）

```bash
# 1. 查詢上個已知良好版本（git tag）
git tag -l 'v*' | tail -5

# 2. 切回
git checkout v<previous>
docker-compose up -d --build

# 3. 若涉及 Supabase migration，需手動 revert（依 migration down script；若無則 TBD — DBA TBD by 2026-Q2 TBD）

# 4. 驗證
curl http://localhost:8000/health
```

### Automatic Rollback Triggers

尚未自動化。觸發條件（待自動化）：錯誤率 > 5% 持續 5 分鐘、`/health` 連續失敗 3 次、LLM 成功率 < 50%。自動化 TBD by 2026-Q4 TBD。

---

## 🛠️ Infrastructure as Code

### 現況
- `Dockerfile`（frontend, multi-stage node:22-alpine + nginx:alpine）
- `backend/Dockerfile`
- `docker-compose.yml`（backend:8000, frontend:8080）
- `nginx.conf`

### Supabase Schema as Code
- `supabase/migrations/*.sql` — 27 張表 + RLS
- `supabase/migrations/002_rls_policies.sql` — RLS 策略
- 其他 migration 詳見 [`docs/03-develop/_MOC.md`](../03-develop/_MOC.md)

### Kubernetes / Terraform
v1.0 未使用。評估 TBD by 2026-Q4 TBD（Owner：Infra TBD）。

---

## 🔐 Security Considerations

部署相關安全事項統一於 [`E8 Security Checklist`](E8--security-and-readiness-checklists.md)，重點：

- [x] 基礎鏡像來自官方 alpine
- [ ] 鏡像漏洞掃描 — TBD by 2026-Q3 TBD
- [x] 網路最小開放（8000 / 8080）
- [x] Secrets 透過 `.env`（非版本控制）
- [ ] 傳輸加密（TLS 終端）— 依部署環境 TBD by 2026-Q3 TBD
- [x] 靜態加密（Supabase 內建 AES-256）

### Secrets Management

目前：`.env` 檔案掛載。
生產級：Vault / AWS Secrets Manager — TBD by 2026-Q3 TBD。

---

## 📝 Documentation / Runbook Index

| 類型 | 文件 |
|------|------|
| Release Deployment | 本文件（E9） |
| Feature Rollout — TRIZ Layered | [`operations/TRIZ_Layered_Rollout_Runbook.md`](operations/TRIZ_Layered_Rollout_Runbook.md) |
| Emergency Rollback — PC Decomposition | [`operations/runbook_pc_decomposition.md`](operations/runbook_pc_decomposition.md) |
| Security / Readiness | [`E8--security-and-readiness-checklists.md`](E8--security-and-readiness-checklists.md) |
| Documentation Maintenance | [`E9x--documentation-maintenance-guide.md`](E9x--documentation-maintenance-guide.md) |
| User Manual | [`E9x--user-manual-v0.1.md`](E9x--user-manual-v0.1.md) |

---

**Remember**：所有部署程序應先於 staging（鏡像 production 設定）驗證。Staging 環境建置 TBD by 2026-Q3 TBD。

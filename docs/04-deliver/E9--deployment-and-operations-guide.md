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

> ⚠️ **本專案 v1.0 CI/CD 依 ADR-004 暫排除；以下為 v1.1 規劃範本**。v1.0 採手動部署；以下 YAML 範例為規劃交付物，Owner：DevOps TBD by 2026-Q3 TBD。

**現況**：無 CI/CD pipeline。各 commit 由 engineer 手動於本機執行 lint / test / build，部署由 Release Eng. TBD 手動觸發 `docker-compose up -d --build`。

**v1.1 規劃** — 三階段 GitHub Actions / GitLab CI 範本：

### 1. Build Stage

```yaml
# .github/workflows/build.yml (v1.1 TBD — DevOps TBD by 2026-Q3 TBD)
name: Build
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - name: Install frontend deps
        run: npm ci
      - name: Lint + Build frontend
        run: npm run lint && npm run build
      - name: Setup Python
        uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - name: Install backend deps
        run: pip install -e "./backend[dev]"
      - name: Lint backend
        run: ruff check backend/app
      - name: Docker build
        run: |
          docker build -t rd-copilot-frontend:${{ github.sha }} .
          docker build -t rd-copilot-backend:${{ github.sha }} ./backend
```

### 2. Test Stage

```yaml
# .github/workflows/test.yml (v1.1 TBD — QA Lead TBD by 2026-Q3 TBD)
test:
  needs: build
  runs-on: ubuntu-22.04
  steps:
    - name: Unit tests — frontend
      run: npm run test -- --run
    - name: Unit tests — backend
      run: pytest backend/tests -q
    - name: Deploy to staging (docker-compose)
      run: docker compose -f docker-compose.staging.yml up -d
    - name: Smoke — health
      run: |
        curl --fail --retry 5 --retry-delay 3 http://localhost:8000/health
        curl --fail http://localhost:8080
    - name: E2E — Playwright smoke (ADR-004 1 scenario)
      run: npx playwright test tests/e2e/smoke.spec.ts
```

### 3. Deploy Stage

```yaml
# .github/workflows/deploy.yml (v1.1 TBD — Release Eng. TBD by 2026-Q3 TBD)
deploy:
  needs: test
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-22.04
  environment: production
  steps:
    - name: Apply Supabase migrations
      run: supabase db push --db-url ${{ secrets.SUPABASE_DB_URL }}
    - name: Push images to registry
      run: |
        docker push ${REGISTRY}/rd-copilot-frontend:${{ github.sha }}
        docker push ${REGISTRY}/rd-copilot-backend:${{ github.sha }}
    - name: Rolling restart (docker-compose)
      run: ssh deploy@prod "cd /srv/rd-copilot && docker compose pull && docker compose up -d"
    - name: Verify
      run: curl --fail --retry 10 --retry-delay 5 https://api.prod/health
    - name: Rollback on failure
      if: failure()
      run: ssh deploy@prod "cd /srv/rd-copilot && ./rollback.sh"
```

### Pipeline 觸發策略（v1.1 規劃）

| 事件 | Build | Test | Deploy Staging | Deploy Prod |
|------|-------|------|----------------|-------------|
| PR opened | ✅ | ✅ | ❌ | ❌ |
| Merge to `main` | ✅ | ✅ | ✅ | ❌（需 manual approve）|
| Tag `v*.*.*` | ✅ | ✅ | ✅ | ✅ |

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

### v1.1+ — 三種策略概念與可行性評估

本專案為 **BaaS-First + 單機 docker-compose**（ADR-001），下表對三種主流策略作概念說明與本專案適用性評估：

| 策略 | 概念 | Supabase 情境 | docker-compose 情境 | v1.1 建議 |
|------|------|---------------|---------------------|-----------|
| **Blue-Green** | 並存兩套完整環境（Blue = 現行、Green = 新版），驗證後切換流量。切換瞬間完成，rollback 只需切回 Blue。 | Supabase schema 為單一 DB；需以 migration 向後相容方式實作（expand-then-contract pattern）。Auth / Storage 無法同時並存兩版。 | 可於同機起兩組 compose project（`-p blue` / `-p green`），用 nginx upstream 切換。需雙份埠或前置反代。 | ⚠️ 部分可行 — 應用層可做，DB 層受限於 Supabase 單實例。Owner：DevOps TBD by 2026-Q4 TBD |
| **Rolling** | 逐批替換實例（如 10 個 pod 每次替換 2 個），新舊版本短暫共存。 | Supabase 不影響（託管）。 | 單機單副本的 compose 無法 rolling；需擴展為 `deploy.replicas: N` + 外部 LB，或遷移至 K8s / Swarm。 | ✅ 推薦目標 — 配合 K8s 遷移或 compose scale。Owner：DevOps TBD by 2026-Q4 TBD |
| **Canary** | 將小比例流量（如 5%）導向新版，觀察錯誤率 / 指標後逐步擴大。 | N/A 單機部署 — 無流量分流基礎設施。 | **N/A** — 單節點 docker-compose 無法做流量分流；需先具備 LB (nginx/envoy/istio) 權重路由。 | ❌ 不納入 v1.1；v1.2 + K8s + 服務網格再評估。Owner：Infra TBD by 2026-Q4 TBD |

### v1.0 實際採用策略

**停機升級（Recreate）** — docker-compose 預設行為：
- 停機窗口 < 2 分鐘（pull image + recreate container）
- 公告窗口：發布前 30 分鐘 Slack 通知（Owner TBD by 2026-Q2 TBD）
- 風險：Supabase 連線中斷約 15 秒（ADR-003 retry 可吸收）

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

### 決策樹（先判斷影響範圍再選 runbook）

```
發生問題
  ├─ 單一 feature flag 可關閉？
  │    ├─ TRIZ Layered 問題 → operations/TRIZ_Layered_Rollout_Runbook.md
  │    └─ PC Decomposition 問題 → operations/runbook_pc_decomposition.md
  ├─ 多模組皆異常 / 全站 5xx → Release-level rollback（本節下方）
  └─ Supabase migration 錯誤 → DBA 手動 revert（見下方 Step 3）
```

### Feature-level Runbook（已存在，本指南不重複內容，請直接引用）

本專案已有兩份場景級 runbook，部署遇到對應問題請直接依據：

- **TRIZ Layered Drill-Down 灰度切換與回退**：[`operations/TRIZ_Layered_Rollout_Runbook.md`](operations/TRIZ_Layered_Rollout_Runbook.md)
  - 涵蓋 S1~S4 四階段切換、`VITE_TRIZ_LAYERED_MODE` flag 回退、`layered_solution` JSONB 相容性
  - Owner：TRIZ Feature Team（見 runbook metadata）
- **PC Decomposition 緊急停用**：[`operations/runbook_pc_decomposition.md`](operations/runbook_pc_decomposition.md)
  - 涵蓋前端 early-return 停用、後端停用、Migration 009 回滾
  - Owner：Backend Lead（見 runbook metadata）

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

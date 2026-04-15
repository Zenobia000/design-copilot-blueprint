# 綜合品質檢查清單 (Unified Quality Checklist) — RD Design Copilot v1.0

---

| 項目 | 內容 |
|------|------|
| **文件版本 (Document Version)** | v1.0 |
| **最後更新 (Last Updated)** | 2026-04-15 |
| **主要作者 (Lead Author)** | 技術負責人 + Security Lead TBD by 2026-Q2 TBD |
| **狀態 (Status)** | Draft |

---

## 目錄 (Table of Contents)

- [A. 核心安全原則](#a-核心安全原則-core-security-principles)
- [B. 數據生命週期安全與隱私](#b-數據生命週期安全與隱私-data-lifecycle-security--privacy)
- [C. 應用程式安全](#c-應用程式安全-application-security)
- [D. 基礎設施與運維安全](#d-基礎設施與運維安全-infrastructure--operations-security)
- [E. 合規性](#e-合規性-compliance)
- [F. 審查結論與行動項](#f-審查結論與行動項-review-conclusion--action-items)
- [G. 生產準備就緒](#g-生產準備就緒-production-readiness)

---

# 安全與隱私設計審查 (Security and Privacy Design Review) — RD Design Copilot

## 目的

本清單為 v1.0 發布前的統一安全 / 隱私 / 生產就緒評估。勾選規則：`[x]` 已實施，`[ ]` 尚未或部分實施（於行尾標註 TBD / owner）。

---

**審查對象 (Review Target)**：RD Design Copilot v1.0 — BaaS-First 架構（前端 Vite+React + Supabase JS；後端 FastAPI AI 編排；Supabase PostgreSQL + RLS）

**審查日期 (Review Date)**：2026-04-15（Draft）

**審查人員 (Reviewers)**：技術負責人（已參與），Security Lead、Legal / DPO TBD by 2026-Q2 TBD

**相關文檔**：
- 隱私與合規種子：[`docs/00-discover/E1x--privacy-compliance-seed.md`](../00-discover/E1x--privacy-compliance-seed.md)
- 架構決策：[`ADR-001 BaaS-First`](../01-define/adrs/ADR-001-baas-first-architecture.md)、[`ADR-003 LLM Hardening`](../01-define/adrs/ADR-003-llm-service-hardening.md)、[`ADR-004 QA/DevOps`](../01-define/adrs/ADR-004-qa-devops-infrastructure.md)
- 部署與運維：[`E9 Deployment Guide`](E9--deployment-and-operations-guide.md)

---

## A. 核心安全原則 (Core Security Principles)

- [x] **最小權限**：前端使用 Supabase anon key + RLS；service-role key 僅後端持有（ADR-001）
- [ ] **縱深防禦**：RLS + FastAPI validation + Pydantic schema 為三層；WAF / DDoS 層 TBD — Security Lead TBD by 2026-Q3 TBD
- [x] **預設安全**：`.env` 外部掛載，未入版控（`docker-compose.yml` 以 `env_file` 載入）
- [ ] **攻擊面最小化**：僅暴露 `8000`（backend）/ `8080`（frontend nginx）埠；內網限制 TBD by 2026-Q3 TBD
- [ ] **職責分離**：Gate 簽核需人工（E1x §6），但內部 RBAC / approval 流程 TBD by 2026-Q3 TBD

## B. 數據生命週期安全與隱私 (Data Lifecycle Security & Privacy)

### B.1 數據分類與收集
- [x] **數據分類**：E1x §1 定義 4 級（客戶 IP / Design Records / AI-Generated / Telemetry）
- [x] **數據最小化**：不收集信用卡、身分證等高敏感資料
- [ ] **用戶同意 / 告知**：Privacy Policy 文案 TBD — Legal TBD by 2026-Q2 TBD（E1x §7 item 7）

### B.2 數據傳輸
- [x] **傳輸加密**：Supabase / Anthropic API 皆 HTTPS；nginx 可擴充 TLS 終端
- [ ] **內部傳輸加密**：docker-compose 內部網段目前為明文；service mesh / mTLS TBD by 2026-Q4 TBD
- [ ] **證書管理**：自動輪換 TBD（依部署環境 — Let's Encrypt / Cloudflare TBD by 2026-Q3 TBD）

### B.3 數據儲存
- [x] **儲存加密**：Supabase 預設 AES-256 at rest
- [x] **金鑰管理**：Supabase 管理；本地僅 `.env`。生產級 Secrets Manager 待評估 — TBD by 2026-Q3 TBD
- [ ] **備份安全**：Supabase 自動備份已啟用；離線備份策略 TBD by 2026-Q3 TBD

### B.4 數據使用與處理
- [ ] **日誌脫敏**：FastAPI 日誌目前可能含 prompt 內容（含客戶 IP 描述）。遮罩策略 TBD — Backend owner TBD by 2026-Q2 TBD
- [x] **第三方共享**：僅 Anthropic API（用於推論，不訓練）；DPA 審查 TBD — Legal TBD by 2026-Q2 TBD（E1x §7 item 6）

### B.5 數據保留與銷毀
- [ ] **保留策略**：依客戶合約；預設保留期 TBD — Legal by 2026-Q2 TBD
- [ ] **安全銷毀**：Supabase delete + 備份清除流程 TBD by 2026-Q3 TBD

## C. 應用程式安全 (Application Security)

### C.1 身份驗證
- [x] **Supabase Auth**：email/password、OAuth、密碼重設（ADR-001）
- [x] **憑證儲存**：Supabase 內部使用強 hash（bcrypt/scrypt）
- [x] **會話管理**：Supabase JWT + refresh token
- [ ] **MFA**：Supabase 支援但未強制啟用 — TBD by 2026-Q3 TBD
- [ ] **暴力破解防護**：Supabase rate limit 預設；自訂強化 TBD by 2026-Q3 TBD

### C.2 授權與訪問控制
- [x] **物件級別授權**：27 張表的 RLS 策略（`supabase/migrations/002_rls_policies.sql`）
- [x] **功能級別授權**：FastAPI 端點以 Supabase JWT 驗證；tenant_id 綁定每次請求

### C.3 輸入驗證與輸出編碼
- [x] **防注入**：Supabase JS client / supabase-py 皆參數化
- [x] **防 XSS**：React 預設 escape；未使用 `dangerouslySetInnerHTML`（需 review 時確認）
- [ ] **CSP**：nginx CSP header 未設定 — Frontend owner TBD by 2026-Q3 TBD
- [x] **防 CSRF**：JWT Bearer header + SameSite cookie 預設

### C.4 API 安全
- [x] **API 認證 / 授權**：16 個 AI 端點皆需 JWT
- [ ] **速率限制**：FastAPI 層無限流；Anthropic 上游限流 — 專案級 rate limit TBD by 2026-Q2 TBD（ADR-003 Phase 1 retry 已導入）
- [x] **參數校驗**：Pydantic 2 schema（`backend/app/models/schemas.py`）
- [x] **避免過度暴露**：response schema 明確定義

### C.5 依賴庫安全
- [ ] **漏洞掃描**：Dependabot / Snyk 未啟用 — TBD by 2026-Q2 TBD
- [ ] **更新策略**：手動；自動化流程 TBD by 2026-Q3 TBD

## D. 基礎設施與運維安全 (Infrastructure & Operations Security)

### D.1 網路安全
- [ ] **防火牆 / 安全組**：依部署環境；目前以 docker-compose 開放 8000/8080 — 正式部署規則 TBD by 2026-Q3 TBD
- [ ] **DDoS 防護**：Cloudflare / AWS Shield TBD — Infra TBD by 2026-Q3 TBD

### D.2 機密管理
- [x] **安全儲存**：`.env` 外部掛載，未入 git（`.gitignore` 已排除）
- [ ] **權限與輪換**：Supabase / Anthropic key 輪換流程 TBD — Security Lead by 2026-Q3 TBD

### D.3 Docker / 容器安全
- [x] **最小化基礎鏡像**：`node:22-alpine` + `nginx:alpine`（前端 multi-stage，見 `Dockerfile`）
- [ ] **非 Root 用戶**：nginx 預設以 root 啟動 — 硬化 TBD by 2026-Q3 TBD
- [ ] **鏡像掃描**：Trivy / Snyk 未整合 — TBD by 2026-Q3 TBD

### D.4 日誌與監控
- [ ] **安全事件日誌**：FastAPI / Supabase log 存在；集中化 TBD by 2026-Q3 TBD
- [ ] **安全告警**：未配置 — Ops owner TBD by 2026-Q3 TBD

## E. 合規性 (Compliance)

- [x] **法規識別**：E1x §2 / §7 已列 PDPA、GDPR、SOC 2
- [ ] **合規性措施**：E1x §7 清單全為 P0/P1 TBD — Legal + Security Lead by 2026-Q2~Q3 TBD

## F. 審查結論與行動項 (Review Conclusion & Action Items)

### 主要風險（依 E1x §8 STRIDE 摘錄）
- **T4 Information Disclosure（High）**：跨租戶資料外洩 — 需完整 RLS 測試覆蓋
- **T5 Elevation of Privilege（High）**：service-role key 繞過 RLS — 需最小化後端使用場景
- **LLM Prompt Injection（Medium）**：使用者輸入進 prompt — ADR-003 Pydantic 驗證減緩下游，但 prompt 層本身需 sanitization（TBD by 2026-Q3 TBD）

### 行動項

| # | 行動項 | 負責人 | 預計完成 | 狀態 |
|:-:|:--|:--|:--|:--|
| 1 | Privacy Policy / ToS 撰寫 | Legal TBD | 2026-Q2 TBD | 待辦 |
| 2 | Anthropic DPA 審查 | Legal TBD | 2026-Q2 TBD | 待辦 |
| 3 | Dependabot / ruff-audit 整合 | DevOps TBD | 2026-Q2 TBD | 待辦 |
| 4 | API rate limit（FastAPI 層） | Backend TBD | 2026-Q2 TBD | 待辦 |
| 5 | 日誌 PII 遮罩 | Backend TBD | 2026-Q2 TBD | 待辦 |
| 6 | nginx CSP / 安全 header | Frontend TBD | 2026-Q3 TBD | 待辦 |
| 7 | 容器非 root 硬化 | DevOps TBD | 2026-Q3 TBD | 待辦 |
| 8 | MFA 強制 + 暴力破解強化 | Security Lead TBD | 2026-Q3 TBD | 待辦 |
| 9 | 滲透測試 | Security Lead TBD | 2026-Q3 TBD | 待辦（E1x §7 item 5）|
| 10 | IR Plan | Security Lead TBD | 2026-Q3 TBD | 待辦（E1x §7 item 10）|

### 整體評估

Draft 階段。BaaS-First 架構在認證 / 加密 / RLS 三個層面已有強基礎；在可觀測性、合規文件、依賴掃描、限流、secrets 輪換五個面向仍為 TBD。上線前需完成行動項 1-5（P0/P1）。

---

**簽署 (Sign-off)**：
- 安全審查團隊代表：_______________ （TBD）
- 專案 / 功能負責人：_______________ （技術負責人）

---

## G. 生產準備就緒 (Production Readiness)

### G.1 可觀測性 (Observability)
- [ ] **監控儀表板**：無 Grafana / Datadog — TBD by 2026-Q3 TBD
- [ ] **核心指標 (SLIs)**：Latency / Traffic / Errors / Saturation 未暴露 — TBD by 2026-Q3 TBD
- [ ] **結構化日誌**：FastAPI 預設 uvicorn access log；JSON 化 + 中央收集 TBD by 2026-Q3 TBD
- [ ] **全鏈路追蹤**：未導入 OpenTelemetry — TBD by 2026-Q4 TBD
- [ ] **告警**：未配置 — TBD by 2026-Q3 TBD

### G.2 可靠性與彈性 (Reliability & Resilience)
- [x] **健康檢查**：FastAPI `/health` 端點（需確認；若無則 TBD by 2026-Q2 TBD）
- [ ] **優雅啟停**：uvicorn 預設處理 SIGTERM；應用層 hook TBD by 2026-Q3 TBD
- [x] **重試與超時**：LLM 呼叫走 `tenacity` retry（ADR-003 Phase 1）
- [x] **故障轉移**：Supabase 託管級 failover
- [x] **備份與恢復**：Supabase 自動；演練 TBD by 2026-Q3 TBD

### G.3 性能與可擴展性 (Performance & Scalability)
- [ ] **負載測試**：未執行 — TBD by 2026-Q3 TBD
- [ ] **容量規劃**：依 Anthropic quota；token 預算追蹤 ADR-003 Phase 2 — TBD
- [x] **水平擴展**：FastAPI 無狀態；docker-compose replicas 可調
- [x] **依賴擴展性**：Supabase / Anthropic 為託管 SaaS

### G.4 可維護性與文檔 (Maintainability & Documentation)
- [x] **Runbook**：[`operations/TRIZ_Layered_Rollout_Runbook.md`](operations/TRIZ_Layered_Rollout_Runbook.md)、[`operations/runbook_pc_decomposition.md`](operations/runbook_pc_decomposition.md)
- [ ] **CI/CD**：未建立（ADR-004 不納入 v1.0）— TBD by 2026-Q3 TBD
- [x] **配置管理**：`.env` 外部掛載，不硬編碼
- [ ] **功能開關**：部分（如 `VITE_TRIZ_LAYERED_MODE`）— 全面 feature flag 系統 TBD by 2026-Q4 TBD

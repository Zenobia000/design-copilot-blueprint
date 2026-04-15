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
- [ ] **防火牆 / 安全組**：依部署環境；目前以 docker-compose 開放 8000/8080 — 正式部署規則 TBD — Infra TBD by 2026-Q3 TBD
- [ ] **DDoS 防護**：Cloudflare / AWS Shield TBD — Infra TBD by 2026-Q3 TBD
- [ ] **內網隔離**：FastAPI ↔ Supabase 走公網 HTTPS；VPC peering / Private Link TBD — Infra TBD by 2026-Q4 TBD

### D.2 機密管理
- [x] **安全儲存**：`.env` 外部掛載，未入 git（`.gitignore` 已排除）
- [x] **Supabase RLS 啟用狀態**：27 張表皆有 RLS policy（`supabase/migrations/002_rls_policies.sql`）
- [ ] **API Key Rotation**：Supabase service-role key / Anthropic key 輪換週期 TBD — Security Lead TBD by 2026-Q3 TBD
- [ ] **Secrets Manager**：`.env` → Vault / AWS Secrets Manager 遷移 TBD — DevOps TBD by 2026-Q3 TBD
- [ ] **Secret Scanning**：git pre-commit / GitGuardian 未整合 TBD — DevOps TBD by 2026-Q2 TBD

### D.3 Docker / 容器安全
- [x] **最小化基礎鏡像**：`node:22-alpine` + `nginx:alpine`（前端 multi-stage，見 `Dockerfile`）
- [ ] **非 Root 用戶**：nginx 預設以 root 啟動 — 硬化 TBD — DevOps TBD by 2026-Q3 TBD
- [ ] **鏡像漏洞掃描**：Trivy / Snyk 未整合 — TBD — DevOps TBD by 2026-Q3 TBD
- [ ] **SBOM 產出**：Syft / CycloneDX TBD — DevOps TBD by 2026-Q4 TBD
- [ ] **鏡像簽章**：cosign / sigstore TBD — DevOps TBD by 2026-Q4 TBD

### D.4 日誌與監控
- [ ] **安全事件日誌**：FastAPI / Supabase log 存在；集中化 TBD — Ops TBD by 2026-Q3 TBD
- [ ] **安全告警**：未配置 — Ops TBD by 2026-Q3 TBD
- [ ] **審計日誌**：DB-level audit（Supabase `pgaudit`）TBD — DBA TBD by 2026-Q3 TBD
- [ ] **異常偵測**：IDS / 行為基線 TBD — Security Lead TBD by 2026-Q4 TBD

### D.5 CI/CD 安全（對齊 ADR-004 v1.1 規劃）
- [ ] **Pipeline 最小權限**：service principal / OIDC token TBD — DevOps TBD by 2026-Q3 TBD
- [ ] **依賴鎖定**：`package-lock.json` / `uv.lock` 已存在，但驗證流程 TBD — DevOps TBD by 2026-Q2 TBD
- [ ] **Artifact 完整性**：images 未簽章（見 D.3）— DevOps TBD by 2026-Q4 TBD

## E. 合規性 (Compliance)

### E.1 法規識別與適用性
- [x] **法規識別**：E1x §2 / §7 已列 PDPA、GDPR、SOC 2
- [ ] **GDPR 適用性評估**：若有歐盟使用者則適用；目前客戶範圍 TBD — Legal TBD by 2026-Q2 TBD
- [ ] **台灣 PDPA 遵循聲明**：公司主體為台灣 → 預設適用；對應 DPO TBD — Legal TBD by 2026-Q2 TBD

### E.2 資料主體權利
- [ ] **使用者刪除權（Right to Erasure）**：Supabase delete cascade 已具備；面向客戶的自助刪除 UI TBD — Product + Backend TBD by 2026-Q3 TBD
- [ ] **資料可攜權（Data Portability）**：專案匯出功能 TBD — Product TBD by 2026-Q3 TBD
- [ ] **同意撤回**：Privacy Policy 須提供撤回管道 — Legal TBD by 2026-Q2 TBD

### E.3 資料保留與脫敏
- [ ] **資料保留策略**：預設保留期限 TBD — Legal TBD by 2026-Q2 TBD（E1x §7 item 4）
- [ ] **日誌脫敏**：FastAPI 日誌含 prompt 內容（可能含客戶 IP 描述）→ 遮罩策略 TBD — Backend TBD by 2026-Q2 TBD
- [ ] **測試資料脫敏**：staging DB dump 去識別化 TBD — DBA TBD by 2026-Q3 TBD

### E.4 合規審計與文件
- [ ] **合規性措施清單**：E1x §7 全為 P0/P1 TBD — Legal + Security Lead TBD by 2026-Q2~Q3 TBD
- [ ] **DPIA（資料保護影響評估）**：GDPR 要求；TBD — Legal TBD by 2026-Q3 TBD
- [ ] **SOC 2 差距分析**：若客戶要求則啟動 — Compliance Lead TBD by 2026-Q4 TBD

## F. 審查結論與行動項 (Review Conclusion & Action Items)

### 主要風險（依 E1x §8 STRIDE 摘錄）
- **T4 Information Disclosure（High）**：跨租戶資料外洩 — 需完整 RLS 測試覆蓋
- **T5 Elevation of Privilege（High）**：service-role key 繞過 RLS — 需最小化後端使用場景
- **LLM Prompt Injection（Medium）**：使用者輸入進 prompt — ADR-003 Pydantic 驗證減緩下游，但 prompt 層本身需 sanitization（TBD by 2026-Q3 TBD）

### 行動項

| ID | 描述 | Severity | Owner | ETA | 關聯文件 | 狀態 |
|:--:|:--|:--:|:--|:--|:--|:--:|
| AI-01 | Privacy Policy / ToS 撰寫 | P0 | Legal TBD | 2026-Q2 TBD | E1x §7 item 7 | 待辦 |
| AI-02 | Anthropic DPA 審查 | P0 | Legal TBD | 2026-Q2 TBD | E1x §7 item 6；ADR-003 | 待辦 |
| AI-03 | Dependabot / pip-audit / ruff-audit 整合 | P1 | DevOps TBD | 2026-Q2 TBD | §C.5 | 待辦 |
| AI-04 | API rate limit（FastAPI 層，slowapi） | P1 | Backend TBD | 2026-Q2 TBD | §C.4；ADR-003 | 待辦 |
| AI-05 | 日誌 PII / prompt 遮罩 | P0 | Backend TBD | 2026-Q2 TBD | §B.4；§E.3 | 待辦 |
| AI-06 | nginx CSP / 安全 header（HSTS, X-Frame-Options） | P1 | Frontend TBD | 2026-Q3 TBD | §C.3 | 待辦 |
| AI-07 | 容器非 root 硬化（frontend / backend Dockerfile） | P1 | DevOps TBD | 2026-Q3 TBD | §D.3 | 待辦 |
| AI-08 | 鏡像漏洞掃描（Trivy on CI） | P1 | DevOps TBD | 2026-Q3 TBD | §D.3；ADR-004 | 待辦 |
| AI-09 | MFA 強制 + Supabase 暴力破解強化 | P1 | Security Lead TBD | 2026-Q3 TBD | §C.1 | 待辦 |
| AI-10 | API Key Rotation 流程 + 文件化 | P1 | Security Lead TBD | 2026-Q3 TBD | §D.2；E9 §Secrets | 待辦 |
| AI-11 | 滲透測試（黑箱 + 授權測試） | P2 | Security Lead TBD | 2026-Q3 TBD | E1x §7 item 5 | 待辦 |
| AI-12 | Incident Response Plan | P1 | Security Lead TBD | 2026-Q3 TBD | E1x §7 item 10 | 待辦 |
| AI-13 | 使用者刪除權 UI + 流程 | P1 | Product + Backend TBD | 2026-Q3 TBD | §E.2 | 待辦 |
| AI-14 | Supabase RLS 測試覆蓋（跨租戶） | P0 | Backend + QA TBD | 2026-Q2 TBD | STRIDE T4；ADR-001 | 待辦 |
| AI-15 | Secrets Manager（Vault / AWS SM）遷移 | P2 | DevOps TBD | 2026-Q3 TBD | §D.2；E9 §Secrets | 待辦 |

### 整體評估

Draft 階段。BaaS-First 架構在認證 / 加密 / RLS 三個層面已有強基礎；在可觀測性、合規文件、依賴掃描、限流、secrets 輪換五個面向仍為 TBD。上線前需完成行動項 1-5（P0/P1）。

---

**簽署 (Sign-off)**：
- 安全審查團隊代表：_______________ （TBD）
- 專案 / 功能負責人：_______________ （技術負責人）

---

## G. 生產準備就緒 (Production Readiness)

### G.1 可觀測性 (Observability)
- [ ] **監控儀表板**：無 Grafana / Datadog — TBD — Ops TBD by 2026-Q3 TBD
- [ ] **核心指標 (SLIs)**：Latency / Traffic / Errors / Saturation 未暴露 — TBD — Backend TBD by 2026-Q3 TBD
- [ ] **結構化日誌**：FastAPI 預設 uvicorn access log；JSON 化 + 中央收集 TBD — Backend TBD by 2026-Q3 TBD
- [ ] **全鏈路追蹤**：未導入 OpenTelemetry — TBD — Backend TBD by 2026-Q4 TBD
- [ ] **告警**：未配置 — TBD — Ops TBD by 2026-Q3 TBD
- [ ] **LLM 呼叫觀測**：token 使用量 / retry count / P95 latency 指標 — TBD — Backend TBD by 2026-Q3 TBD（ADR-003 Phase 2）
- [ ] **錯誤追蹤**：Sentry / Rollbar TBD — Backend TBD by 2026-Q3 TBD

### G.2 可靠性與彈性 (Reliability & Resilience)
- [x] **健康檢查**：FastAPI `/health` 端點（需確認；若無則 TBD — Backend TBD by 2026-Q2 TBD）
- [ ] **優雅啟停**：uvicorn 預設處理 SIGTERM；應用層 shutdown hook TBD — Backend TBD by 2026-Q3 TBD
- [x] **重試與超時**：LLM 呼叫走 `tenacity` retry（ADR-003 Phase 1）
- [x] **故障轉移**：Supabase 託管級 failover
- [x] **備份與恢復**：Supabase 自動
- [ ] **備份恢復演練**：半年一次 DR drill TBD — DBA TBD by 2026-Q3 TBD
- [ ] **斷路器 (Circuit Breaker)**：Anthropic 呼叫未包裹 — TBD — Backend TBD by 2026-Q4 TBD
- [x] **Rollback 文件**：見 [`operations/*.md`](operations/) 兩份 runbook

### G.3 性能與可擴展性 (Performance & Scalability)
- [ ] **負載測試**：未執行 — TBD — QA Lead TBD by 2026-Q3 TBD
- [ ] **容量規劃**：依 Anthropic quota；token 預算追蹤 ADR-003 Phase 2 — TBD — Backend TBD by 2026-Q3 TBD
- [x] **水平擴展**：FastAPI 無狀態；docker-compose replicas 可調
- [x] **依賴擴展性**：Supabase / Anthropic 為託管 SaaS
- [ ] **性能基線**：P95 latency / 並發數基準 TBD — QA Lead TBD by 2026-Q3 TBD
- [ ] **前端性能預算**：bundle size / LCP / CLS TBD — Frontend TBD by 2026-Q3 TBD

### G.4 可維護性與文檔 (Maintainability & Documentation)
- [x] **Runbook**：[`operations/TRIZ_Layered_Rollout_Runbook.md`](operations/TRIZ_Layered_Rollout_Runbook.md)、[`operations/runbook_pc_decomposition.md`](operations/runbook_pc_decomposition.md)
- [ ] **CI/CD**：未建立（ADR-004 不納入 v1.0）— TBD — DevOps TBD by 2026-Q3 TBD（見 E9 §CI/CD v1.1 範本）
- [x] **配置管理**：`.env` 外部掛載，不硬編碼
- [ ] **功能開關**：部分（如 `VITE_TRIZ_LAYERED_MODE`）— 全面 feature flag 系統 TBD — Backend TBD by 2026-Q4 TBD
- [x] **ADR 追溯**：ADR-001 ~ ADR-005 已建立
- [x] **文件體系**：5D 結構 + _MOC.md（見 E9x 文檔維護指南）
- [ ] **On-call 輪值**：未建立 — TBD — Tech Lead TBD by 2026-Q3 TBD
- [ ] **事件事後報告 (Postmortem) 模板**：TBD — Tech Lead TBD by 2026-Q3 TBD

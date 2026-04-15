# Module Spec: KnowledgeAgent

---

**文件版本 (Document Version):** `v1.0`
**最後更新 (Last Updated):** `2026-04-15`
**主要作者 (Lead Author):** `Knowledge Team`
**審核者 (Reviewers):** `Tech Lead, QA Lead`
**狀態 (Status):** `Draft (Pilot)`
**對應 VibeCoding 模板:** `07_module_specification_and_tests.md`

---

## 模組: `KnowledgeAgent`

**原始檔**: `backend/app/agents/knowledge.py` (+ `backend/app/agents/knowledge_wb.py` 為 writeback 姊妹 agent)
**對應架構文件**: [`01-define/E3--architecture-and-design.md` Appendix A §3 + §1.4 知識引用規範](../../../01-define/E3--architecture-and-design.md)
**對應 BDD Feature**: Cross-cutting（所有 Agent 調用本 agent 取 citation；PRD US-09）
**對應服務**:
- `backend/app/services/evidence_retrieval.py` — vector search over enterprise KB
- `backend/app/services/web_search.py` — 外部文獻補充
- `backend/app/services/reference_library.py` — TRIZ 40 原理 / 76 標準解靜態資料
**對應 API**: `GET /knowledge/search`, `POST /knowledge/ingest-source` (多模態), `POST /knowledge/cite`

---

### 規格 1: `search(request: KnowledgeSearchRequest) -> KnowledgeSearchResponse`

**描述**: 給定自然語言查詢 + 領域標籤，並聯企業 RAG + Web Search + Reference Library，回傳排序後的 citation 清單。

**契約式設計 (DbC)**:
* **前置條件 (Preconditions)**:
  1. `request.query` 非空字串，長度 ∈ [3, 512]。
  2. `request.domains ⊆ {"fmea", "8d", "decision", "spec", "triz", "web", "patent"}`；若為空，預設全搜。
  3. `request.top_k ∈ [1, 20]`，預設 5。
  4. 呼叫端（通常為其他 Agent）傳入 `caller_agent_id` 供 audit trail。

* **後置條件 (Postconditions)**:
  1. 回傳 `citations: EvidenceReference[]`，長度 ≤ `top_k`。
  2. 每 citation 含：`id`（KB-xxx / WEB-xxx / REF-xxx）、`source_type`、`snippet`、`relevance_score ∈ [0, 1]`、`retrieved_at`（ISO8601）。
  3. `citations` 依 `relevance_score` 由高至低排序。
  4. 若全部來源 zero-hit → 回傳空陣列（**不 fallback 到 LLM 自編**）。
  5. Web 來源的 `source_url` 必為 HTTPS。

* **不變性 (Invariants)**:
  1. KnowledgeAgent 絕不自行生成 citation 內容（無幻覺 rule）；僅負責檢索 + 排序 + 去重。
  2. 同 query + 同 KB 版本多次呼叫，top-k 結果集合穩定（允許排序微動，但 id set 相等）。
  3. `retrieved_at` 必為 UTC。

### 規格 2: `ingest_source(request: IngestSourceRequest) -> IngestSourceResponse`

**描述**: 多模態素材解讀（PDF / 圖片 / Excel）→ 結構化提取至 project scratch KB。

* **Preconditions**: 檔案 size ≤ 20MB；MIME ∈ 白名單；project 存在。
* **Postconditions**:
  1. 回傳 `extracted_items: ExtractedItem[]`（每項含 `type ∈ {constraint, assumption, kpi, figure, citation}`, `confidence`, `source_span`）。
  2. 未達 confidence 門檻 (< 0.5) 的 item 仍返回，但標 `needs_human_review = true`。

---

### 測試情境與案例

#### 情境 1: Happy Path — FMEA 查詢命中企業 KB
* **測試案例 ID**: `TC-Knowledge-001`
* **描述**: query="馬達軸承熱失效", domains=["fmea"]。
* **Arrange**: mock vector DB 回 3 筆 KB-FMEA-xxx，relevance=[0.92, 0.85, 0.71]。
* **Act**: `await knowledge.search(req)`。
* **Assert**:
  - `len(citations) == 3`
  - `citations[0].id.startswith("KB-FMEA-")`
  - 按 relevance 遞減

#### 情境 2: Cross-source — 混合 KB + Web
* **測試案例 ID**: `TC-Knowledge-002`
* **描述**: domains=["fmea", "web"], top_k=5；KB 2 筆、Web 3 筆。
* **Assert**:
  - `len(citations) == 5`
  - id 前綴包含 "KB-" 與 "WEB-"
  - 所有 Web citation 的 source_url 以 `https://` 開頭

#### 情境 3: 邊界 — 全 zero-hit 不幻覺
* **測試案例 ID**: `TC-Knowledge-003`
* **描述**: query="某極冷僻材料 XYZ-123"，所有來源回空。
* **Assert**:
  - `citations == []`
  - **不允許** LLM fallback 生成假 citation（檢查 mock LLM 未被呼叫）

#### 情境 4: 違反前置 — query 過短
* **測試案例 ID**: `TC-Knowledge-004`
* **描述**: query="熱"（長度 1）。
* **Assert**: 422 `query_too_short`。

#### 情境 5: 業務規則 — Audit trail 必要
* **測試案例 ID**: `TC-Knowledge-005`
* **描述**: 呼叫未帶 `caller_agent_id`。
* **Assert**: 422 `missing_caller_agent_id`（追溯性要求）。

#### 情境 6: Ingest — PDF 多模態解讀
* **測試案例 ID**: `TC-Knowledge-006`
* **描述**: 上傳 Brief PDF（含表格 + 圖）。
* **Assert**:
  - `extracted_items` 含至少 1 `type="constraint"` 與 1 `type="kpi"`
  - 低信心項目 `needs_human_review == true`

#### 情境 7: 上游失敗 — Vector DB 不可用
* **測試案例 ID**: `TC-Knowledge-007`
* **描述**: Vector DB 連線 timeout；Web/Reference 仍可用。
* **Assert**:
  - 不整個失敗：Web + Reference 結果仍回
  - response 附 `partial_failure = ["enterprise_kb"]`
  - 若所有來源都掛 → 502 `knowledge_upstream_error`

---

**LLM Prompting Guide:**
> 「為 `KnowledgeAgent.search` 生成 pytest-asyncio TDD 測試。測試案例 ID: TC-Knowledge-003（zero-hit 不幻覺規則，最關鍵）。」

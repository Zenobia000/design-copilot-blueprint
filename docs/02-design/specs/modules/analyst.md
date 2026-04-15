# Module Spec: AnalystAgent

---

**文件版本 (Document Version):** `v1.0`
**最後更新 (Last Updated):** `2026-04-15`
**主要作者 (Lead Author):** `Backend AI Agents Team`
**審核者 (Reviewers):** `Tech Lead, QA Lead, RD Reviewer Lead`
**狀態 (Status):** `Active (Pilot)`
**對應 VibeCoding 模板:** `07_module_specification_and_tests.md`

---

## 模組: `AnalystAgent`

**原始檔**: `backend/app/agents/analyst.py`
**對應架構文件**: [`01-define/E3--architecture-and-design.md` Appendix A (Forward Subsystem Discovery) + §11 Analyst Agent](../../../01-define/E3--architecture-and-design.md#appendix-a-forward-subsystem-discovery-architecture)
**對應 BDD Feature**: [`docs/02-design/E5x--bdd-scenarios.md` §Feature Brief / Socratic / Anti-Anchor](../../E5x--bdd-scenarios.md)
**對應 Prompt**: `backend/app/prompts/analyst.py`
**對應 API**:
- `POST /analyst/extract-brief`, `POST /analyst/rewrite-mission`
- `POST /analyst/suggest-constraints`, `POST /analyst/suggest-kpis`
- `POST /analyst/constraint-feasibility`, `POST /analyst/5w1h`
- `POST /analyst/socratic`, `POST /analyst/socratic/follow-up`, `POST /analyst/socratic/brief-impact`, `POST /analyst/socratic/auto-tag`
- `POST /analyst/cld`, `POST /analyst/anti-anchor`
- `POST /analyst/formalize-contradiction`, `POST /analyst/decompose-tc`
- `POST /analyst/extract-assumptions`, `POST /analyst/discover-unknowns`

---

## 職責

Analyst Agent 是 Discover/Define 階段的主要 LLM actor，負責把自然語言 Brief 轉成結構化的約束 / KPI / 假設 / 矛盾，並驅動蘇格拉底問答、矛盾形式化（TC/PC/SF）、TC → multi-PC drill-down、CLD 因果圖、Anti-Anchor 反向路徑、未知因子探索。所有方法共用 `ANALYST_SYSTEM` prompt 與 `call_llm_json` JSON-mode LLM call；產生結構化資料均經 Pydantic schema（`app.models.schemas`）驗證。

---

### 規格 1: `extract_brief(req: BriefExtractionRequest) -> BriefExtractionResponse`

**描述**: 從 `raw_text`（或 file_urls，尚未實作）抽取 `constraints[]` / `kpis[]` / `assumptions[]` / `feasibility_warnings[]` 4 類結構化欄位。

**契約式設計 (DbC)**:
* **前置條件**:
  1. `req.project_id` 非空且使用者有權限。
  2. `req.raw_text` 或 `req.file_urls` 至少一者非空；若兩者皆空，填入 fallback prompt `"(無文字，請根據 file_urls 推斷)"`。
* **後置條件**:
  1. 回傳 `BriefExtractionResponse` 4 個欄位皆為 list（可為空）。
  2. 僅回傳 prompt 要求的 4 個 key；其他多餘 LLM key 被過濾丟棄（防 Pydantic `extra="forbid"` 爆錯）。
  3. `constraints[*]` 結構符合 `ExtractedConstraint`（code / description / source / type / feasibility）。
* **不變性**:
  1. Agent 不落資料庫；落庫由 router 層 `pre_analyst.py` 負責。

---

### 規格 2: `formalize_contradiction(req: ContradictionFormalizeRequest) -> ContradictionFormalizeResponse`

**描述**: 把一條自然語言矛盾形式化為 TRIZ `TC`（工程矛盾，對應 39 參數）/ `PC`（物理矛盾，同一屬性同時要 A 與 ¬A）/ `SF`（物場模型）。

**契約式設計 (DbC)**:
* **前置條件**:
  1. `req.natural_description` 非空字串。
  2. `req.contradiction_id` 對應存在於 `contradictions` table 的 row。
* **後置條件**:
  1. 回傳之 `type ∈ {"TC", "PC", "SF"}`。
  2. 若 `type == "TC"`，則 `improving_param` 與 `worsening_param` 必為 `int` 且 ∈ [1, 39]；否則會被 agent 自動降級為 `PC`（見 `analyst.py` L344–358）。
  3. 若自動降級發生，`physical_contradiction` 欄位至少被填成 `engineering_statement` 的副本（不可為空）。
  4. `confidence ∈ [0, 1]`。
* **不變性**:
  1. **TC MUST have both params**（invariant enforced by explicit downgrade logic）。
  2. `socraticAnswers` 若提供，需先經 `_extract_socratic_insights` 轉為 bullet 字串注入 prompt。

---

### 規格 3: `decompose_tc_to_pcs(req: ContradictionDecomposeRequest) -> ContradictionDecomposeResponse`

**描述**: Explore 階段 TC → multi-PC drill-down。先跑 L1 rule-based critic 判定是否值得分解；若觸發，再呼叫 LLM 取得 `DecomposedPC[]`，並對 `derived_parameter` 去重、對 `separation_principle_id` 驗證（必屬 canonical 16 項集合）。

**契約式設計 (DbC)**:
* **前置條件**:
  1. `req.engineering_statement` 非空。
  2. `req.severity ∈ {"minor", "major", "critical"}`。
* **後置條件**:
  1. 若 critic 判定 `triggered=False`，回傳 `decomposed_pcs=[]` 且 `reasoning="L1 critic judged drill-down unnecessary."`。
  2. 若 critic 觸發但 LLM 或驗證失敗，回傳 `triggered=True, decomposed_pcs=[], reasoning="Decomposition failed: {exc}"`（error isolation per WBS §3.3）。
  3. 回傳 `decomposed_pcs[*].derived_parameter` **兩兩相異**（in-list dedup）。
  4. 每個 PC 的 `separation_principle_id` 屬於 canonical 16 項（由 Pydantic validator 自動拒絕）。
* **不變性**:
  1. 任何 exception 不得逃逸至 router（EVERY branch wrapped in try/except）。
  2. `enable_llm_critic=False` — decomposition 內部僅用 rule layer 做 gating 以節省 token。

---

### 規格 4: `generate_anti_anchor(req: AntiAnchorRequest) -> AntiAnchorResponse`

**描述**: 從 mission + current_constraints + existing_alternatives 產生 ≥3 條非典型架構候選（Anti-Anchor routes），每條附 mechanism / why_unconventional / potential_advantage / cross_domain_source。對應 E3 Appendix C。

**契約式設計 (DbC)**:
* **前置條件**:
  1. `req.mission` 非空；`req.current_constraints` 至少 1 條。
  2. 呼叫端應預先用 `get_contradiction_leaves()` 把 contradictions 過濾到葉節點，避免 parent + child 重複（見 §9.4 及 analyst.py L390–393）。
* **後置條件**:
  1. `result.alternatives` 長度 ≥ 1（理想 ≥ 3，實際以 LLM 為準）。
  2. 每 alternative 的 4 個文字欄位（`mechanism` / `why_unconventional` / `potential_advantage` / `cross_domain_source`）必為 `str` — 若 LLM 返回 dict，agent 以 `_flatten_to_str` 壓平。
  3. 每條 alternative 的 `is_non_typical` 預設為 `True`。
* **不變性**:
  1. Anti-Anchor 產出直接進候選池（Appendix E §R1），不回跑 TRIZ 收斂迴圈。

---

### 規格 5: `generate_socratic_questions(req: SocraticRequest) -> SocraticResponse` (+ follow_up / brief_impact / auto_tag 三姊妹)

**描述**: 產生七類固定類別的蘇格拉底問題：`clarification` / `assumption` / `consequence` / `counter` / `origin` / `action` / `reframing`。LLM 以 dict keyed by category 返回；agent 在 `analyst.py` L221–228 把 dict 轉為 list 並附上 `type_class`。

**契約式設計 (DbC)**:
* **前置條件**:
  1. `req.mission` 非空；`req.constraints` 可為空。
* **後置條件**:
  1. `result.questions[*].type_class ∈ _VALID_CATEGORIES`（7 類）；非屬此集合者被丟棄。
  2. 每個 question 物件為 dict（含 LLM 產出欄位如 `text`）。
* **不變性**:
  1. 問題類別集合 `_VALID_CATEGORIES` 為寫死 constant，不隨 LLM 漂移。

---

### 其他方法（lazy-spec，內部職責摘要）

| 方法 | 職責 | TBD |
| --- | --- | --- |
| `check_constraint_feasibility` | 兩兩約束矛盾檢測 | DbC 契約 TBD — owner: Backend AI, 2026-05 |
| `rewrite_mission` / `suggest_constraints` / `suggest_kpis` / `generate_5w1h` | 帶 `evidence_retrieval` citation 的 Brief 補強 | Citation 必附 — DbC TBD 2026-05 |
| `generate_cld` | 因果環路圖（Causal Loop Diagram） | 節點 / 箭頭 schema 驗證 TBD |
| `extract_assumptions` | 從 Q&A 萃取假設 | evidence_level 欄位契約 TBD |
| `discover_unknown_factors` | 從上下文缺口找未知因子 | Dedup 策略 TBD |

---

## 測試情境與案例

#### 情境 1: Happy Path — Brief 抽取
* **測試案例 ID**: `TC-Analyst-001`
* **描述**: `raw_text = "電動自行車 250W，續航 80km，重量 <25kg"`。
* **Arrange**: mock `call_llm_json` 返回 `{constraints:[{code:"C1",description:"重量<25kg",...}], kpis:[{...}], assumptions:[], feasibility_warnings:[]}`。
* **Act**: `extract_brief(req)`。
* **Assert**:
  - `len(result.constraints) >= 1 && result.constraints[0].code == "C1"`
  - `result` 不含 LLM 多餘欄位（後置條件 2）

#### 情境 2: 邊界 — TC 參數無效自動降級 PC
* **測試案例 ID**: `TC-Analyst-002`
* **描述**: LLM 返回 `type="TC"` 但 `improving_param=null`。
* **Act**: `formalize_contradiction(req)`。
* **Assert**:
  - `result.type == "PC"`（自動降級，analyst.py L344）
  - `result.physical_contradiction` 非空（fallback 到 engineering_statement）
  - log warning 被發射

#### 情境 3: Drill-down — TC→PC critic 不觸發
* **測試案例 ID**: `TC-Analyst-003`
* **描述**: `severity="minor"`，critic rule layer 判定不需分解。
* **Assert**:
  - `result.triggered == False`
  - `result.decomposed_pcs == []`
  - `result.reasoning == "L1 critic judged drill-down unnecessary."`
  - **不呼叫** LLM decomposition prompt（省 token）

#### 情境 4: Error Isolation — decomposition LLM 拋例外
* **測試案例 ID**: `TC-Analyst-004`
* **描述**: critic 觸發但 `call_llm_json` raise timeout。
* **Assert**:
  - **不** re-raise；回傳 `triggered=True, decomposed_pcs=[], reasoning="Decomposition failed: ..."`
  - logger.exception 被呼叫（WBS §3.3 error isolation）

#### 情境 5: Anti-Anchor — LLM 返回 dict 欄位被壓平
* **測試案例 ID**: `TC-Analyst-005`
* **描述**: LLM 在 `alternatives[0].mechanism` 回傳 `{"core":"...","detail":"..."}` dict。
* **Assert**:
  - `result.alternatives[0].mechanism` 為 `str`（被 `_flatten_to_str` 壓平為 `"Core: ... | Detail: ..."`）
  - Pydantic 驗證通過不拋 `ValidationError`

#### 情境 6: Socratic — 非法類別被丟棄
* **測試案例 ID**: `TC-Analyst-006`
* **描述**: LLM 返回 `questions = {"clarification":{...}, "invalid_cat":{...}}`。
* **Assert**:
  - `result.questions` 長度 == 1
  - `result.questions[0].type_class == "clarification"`
  - `"invalid_cat"` 被默默丟棄

#### 情境 7: Decomposition — derived_parameter 去重
* **測試案例 ID**: `TC-Analyst-007`
* **描述**: LLM 返回 2 個 PC 皆 `derived_parameter="重量"`。
* **Assert**:
  - `len(result.decomposed_pcs) == 1`（第 2 個被 dedup 丟棄 + logger.warning）

---

## 與其他 Agent 的互動

| 方向 | 對方 | 互動點 |
| --- | --- | --- |
| **呼叫者 (upstream)** | Router `pre_analyst.py`, `analyst.py`, `explore.py` | 所有 `/analyst/*` endpoint |
| **被呼叫者 (downstream)** | `TrizCriticAgent.should_trigger_pc_decomposition` | L1 critic gating（analyst.py L35, L442） |
| **共享工具** | `app.services.evidence_retrieval` | `rewrite_mission` / `suggest_constraints` / `suggest_kpis` / `generate_5w1h` 取 citation |
| **共享工具** | `app.tools.triz_kb`, `app.tools.separation_principles` | `decompose_tc_to_pcs` prompt context |
| **下游消費者** | `TrizSolverAgent` | 吃 `formalize_contradiction` 產出之 TC/PC → 解矛盾 |
| **下游消費者** | `AntiAnchorAgent` (router-embedded) | 吃 `generate_anti_anchor` 產出候選進池 |
| **下游消費者** | `ScamperFeedbackAgent` | 吃本 agent 形式化的矛盾作為 dedup baseline |

---

**LLM Prompting Guide:**
> 「請依以下測試規格，使用 pytest + pytest-asyncio 為 `AnalystAgent.formalize_contradiction` 生成失敗的 TDD 測試。測試案例 ID: TC-Analyst-002（TC 自動降級 PC 路徑）。」

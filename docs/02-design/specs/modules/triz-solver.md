# Module Spec: TrizSolverAgent

---

**文件版本 (Document Version):** `v1.0`
**最後更新 (Last Updated):** `2026-04-15`
**主要作者 (Lead Author):** `Backend AI Agents Team`
**審核者 (Reviewers):** `Tech Lead, QA Lead`
**狀態 (Status):** `In Progress`
**對應 VibeCoding 模板:** `07_module_specification_and_tests.md`

---

## 模組: `TrizSolverAgent`

**原始檔**: `backend/app/agents/triz_solver.py`
**對應架構文件**: [`01-define/E3--architecture-and-design.md` Appendix B](../../../01-define/E3--architecture-and-design.md)
**對應 BDD Feature**: [`docs/02-design/E5x--bdd-scenarios.md` §Feature 1](../../E5x--bdd-scenarios.md)
**對應 Spec**: [`specs/triz/E5x--triz-layered-drilldown-optimization.md`](../triz/E5x--triz-layered-drilldown-optimization.md) · [`specs/triz/E5x--triz-multi-solution-adoption-strategy.md`](../triz/E5x--triz-multi-solution-adoption-strategy.md)
**對應 API**: `POST /triz/solve-layered`（`backend/app/routers/triz.py`）

---

### 規格 1: `solve_layered(request: SolveTrizLayeredRequest) -> LayeredTrizSolution`

**描述**: 針對一個技術矛盾，執行 L1 Surface → L2 Root Cause → L3 Su-Field 分層分析，並由 L1 critic 決定是否向下 drill-down。

**契約式設計 (DbC)**:
* **前置條件 (Preconditions)**:
  1. `request.contradiction_id` 非空，且該 contradiction 存在於 project。
  2. `request.improving`, `request.worsening` ∈ TRIZ 39 工程參數集合。
  3. `request.project_id` 對應使用者有權限的 project。

* **後置條件 (Postconditions)**:
  1. 回傳之 `LayeredTrizSolution` 至少含 `l1_surface`（非 None）。
  2. 若 L1 critic confidence < 0.6 → `l2_root_cause` 非 None。
  3. 若 L2 選擇 `System-Level separation` → `l3_sufield` 非 None。
  4. 所有 `InventivePrinciple` 建議均附 `EvidenceReference`（citation）。
  5. `phase_b_directive` 僅在多解情況下非 None。

* **不變性 (Invariants)**:
  1. 同一 `contradiction_id` 多次呼叫應冪等（相同 seed 時）；`temperature` 控制在 `<= 0.3`。
  2. L1/L2/L3 必定遵守 drill-down 單向性（不可跳層）。
  3. citation 的 `source_url` 若有，必為 HTTPS。

---

### 測試情境與案例

#### 情境 1: Happy Path — L1 即解
* **測試案例 ID**: `TC-TrizSolve-001`
* **描述**: 矛盾「重量 vs 剛性」，L1 surface 直接返回 Principle 40 (複合材料) 且 confidence ≥ 0.8。
* **Arrange**: mock TRIZ KB 返回 `[P40, P1, P15]`；mock L1 critic 回 `confidence=0.85`。
* **Act**: `await solver.solve_layered(req)`。
* **Assert**: `result.l1_surface` 含 P40；`result.l2_root_cause is None`；`result.l3_sufield is None`。

#### 情境 2: Drill-Down — L1 不足進 L2
* **測試案例 ID**: `TC-TrizSolve-002`
* **描述**: L1 critic confidence=0.4 → 觸發 L2 分離原理。
* **Arrange**: mock critic 返回低信心；mock separation agent 返回 `["Space", "Time"]`。
* **Act**: solve_layered。
* **Assert**: `result.l2_root_cause.separation_candidates` 長度 ≥ 1；每項含 `DeepenLink` 指向 L3 slot。

#### 情境 3: 邊界 — 未知工程參數
* **測試案例 ID**: `TC-TrizSolve-003`
* **描述**: `improving="玄學"`（非 39 表內）。
* **Act**: solve_layered。
* **Assert**: 拋出 `ValidationError`（Pydantic）或返回 HTTP 422。

#### 情境 4: 業務規則 — Phase B directive 觸發
* **測試案例 ID**: `TC-TrizSolve-004`
* **描述**: 同 project 已有 2 條 layered solutions，新 solve 完成後系統應返回 `phase_b_directive="cross-check-then-merge"`。
* **Arrange**: fixture 建立 2 筆先行 solutions。
* **Act**: solve_layered。
* **Assert**: `result.phase_b_directive.strategy == "merge"`。

#### 情境 5: 上游失敗 — LLM timeout
* **測試案例 ID**: `TC-TrizSolve-005`
* **描述**: Anthropic API 5s timeout。
* **Assert**: 拋 `LlmUpstreamError` → 502 + `error.code=llm_upstream_error`。

---

**LLM Prompting Guide:**
> 「請根據以下測試規格，使用 pytest + pytest-asyncio 為 `TrizSolverAgent.solve_layered` 生成失敗的 TDD 測試。測試案例 ID: TC-TrizSolve-002。」

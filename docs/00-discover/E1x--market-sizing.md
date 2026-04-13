# E1x — Market Sizing (市場規模估算)

| 項目 | 內容 |
|------|------|
| **版本** | v0.1 (Draft — 需市場數據驗證) |
| **日期** | 2026-04-13 |
| **狀態** | 框架建立完成，所有數字待市場研究驗證 |
| **擁有者** | [PM 姓名] |

---

## §1 TAM — Total Addressable Market (全球可觸及市場)

> 全球工程設計軟體市場。

| 指標 | 數值 | 來源 |
|------|------|------|
| 全球 CAD/CAE/PLM 市場規模 (2025) | [TBD — 需市場研究驗證] | Gartner / IDC |
| 年複合成長率 (CAGR) | [TBD — 需市場研究驗證] | Statista |
| 其中「早期設計 / 概念設計」占比 | [TBD — 需市場研究驗證] | 產業報告 |
| TAM 估算 | [TBD — 需市場研究驗證] | 計算: 市場規模 x 概念設計占比 |

---

## §2 SAM — Serviceable Addressable Market (可服務市場)

> 早期概念設計階段工具，目標客群: 硬體 RD 團隊 (機構/電子/機電整合)。

| 指標 | 數值 | 來源 |
|------|------|------|
| 全球硬體 RD 工程師人數 | [TBD — 需市場研究驗證] | Bureau of Labor Statistics / 產業報告 |
| 目標產業 (消費電子、電動載具、工業設備) 占比 | [TBD — 需市場研究驗證] | 產業分析 |
| 有概念設計需求的 RD 團隊比例 | [TBD — 需市場研究驗證] | 客戶訪談推估 |
| SAM 估算 | [TBD — 需市場研究驗證] | 計算: 工程師數 x 目標產業占比 x 年費 |

---

## §3 SOM — Serviceable Obtainable Market (可獲取市場, Year 1)

> 台灣/亞洲硬體 OEM/ODM 區段，第一年可觸及客戶。

| 指標 | 數值 | 來源 |
|------|------|------|
| 台灣 + 亞洲主要 OEM/ODM 數量 | [TBD — 需市場研究驗證] | 產業名錄 |
| 有 RD 概念設計需求的企業比例 | [TBD — 需市場研究驗證] | 客戶訪談 |
| Year 1 可觸及企業數 | [TBD — 需市場研究驗證] | 銷售管道評估 |
| 平均每企業 RD 席位數 | [TBD — 需市場研究驗證] | 客戶訪談 |
| SOM 估算 | [TBD — 需市場研究驗證] | 計算: 企業數 x 席位 x 年費 |

---

## §4 定價假設 (Pricing Model Hypotheses)

| 模式 | 說明 | 適用場景 | 參考價格帶 |
|------|------|---------|-----------|
| **Per-Seat SaaS** | 按用戶數月/年訂閱 | 中小型 RD 團隊 (5–30 人) | [TBD — 需市場研究驗證] /seat/month |
| **Enterprise License** | 企業包年授權，含部署支援 | 大型 OEM (100+ RD) | [TBD — 需市場研究驗證] /year |
| **Usage-Based** | 按 AI Agent 呼叫次數 / Token 用量計費 | 用量波動大的團隊 | [TBD — 需市場研究驗證] /1K calls |
| **Freemium + Upgrade** | 免費基礎功能 + 付費進階功能 | 市場推廣期 | Free → [TBD] /seat/month |

> **初步假設**: Year 1 以 Per-Seat SaaS 為主要模式，Enterprise License 為輔。

---

## §5 收入模型 (Revenue Projection Framework)

| 指標 | Year 1 | Year 2 | Year 3 |
|------|--------|--------|--------|
| 付費企業數 | [TBD] | [TBD] | [TBD] |
| 平均席位數/企業 | [TBD] | [TBD] | [TBD] |
| 平均單價 (ARR/seat) | [TBD] | [TBD] | [TBD] |
| **ARR (Annual Recurring Revenue)** | **[TBD]** | **[TBD]** | **[TBD]** |
| 毛利率 | [TBD] (扣除 LLM API 成本) | [TBD] | [TBD] |
| LLM API 成本占比 | [TBD] | [TBD] | [TBD] |
| 客戶流失率 (Churn) | [TBD] | [TBD] | [TBD] |

---

## §6 數據來源 (待查閱)

| 來源 | 用途 | 狀態 |
|------|------|------|
| Gartner — Engineering Software Market Report | TAM 基準 | [TBD — 待取得] |
| IDC — PLM/CAD Market Forecast | TAM/SAM 交叉驗證 | [TBD — 待取得] |
| Statista — CAD/CAE Market Size | TAM 快速參考 | [TBD — 待查] |
| Bureau of Labor Statistics — Engineers Employment | 工程師人數基準 | [TBD — 待查] |
| 經濟部工業局 — 台灣製造業統計 | SOM 本地市場 | [TBD — 待查] |
| 客戶訪談 (E1x--user-research-synthesis.md) | 定價敏感度、付費意願 | [TBD — 待執行] |
| 競品定價 (E1x--competitive-landscape.md) | 定價參考 | [TBD — 待補齊] |

---

**下一步行動**:
- [ ] 取得 Gartner / IDC 報告或摘要
- [ ] 客戶訪談中加入定價敏感度問題
- [ ] 完成 SOM 估算後更新本文件至 v1.0

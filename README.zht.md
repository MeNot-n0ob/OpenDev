<p align="center">
  <img src="logo.png" alt="OpenDev logo">
</p>
<p align="center">OpenDev — 開源 AI 編碼代理的變體。</p>

---

> [!IMPORTANT]
> OpenDev **並非**由 OpenCode 團隊開發，也**不**與其存在任何關聯。
> 本專案是 [anomalyco](https://github.com/anomalyco) 開發的 [OpenCode](https://github.com/anomalyco/opencode)（最初的
> 開源 AI 編碼代理）的一個變體。上游程式碼的所有功勞歸於 OpenCode 的作者和貢獻者。

---

### 什麼是 OpenDev？

OpenDev 是 OpenCode 的個人變體，是一個在終端中執行的開源 AI 編碼代理。它基於 OpenCode
的程式碼，並進行了本地修改和針對我工作方式的設定調整。

如需了解完整的上游功能、文件和社群，請參閱
[**OpenCode**](https://github.com/anomalyco/opencode) 及其文件 [**opencode.ai**](https://opencode.ai/docs)。

### 安裝

OpenDev 使用 [Bun](https://bun.sh) 從原始碼執行。

```bash
# 安裝依賴
bun install

# 執行開發伺服器
bun dev
```

如需上游二進位安裝（未修改的 OpenCode），請參閱[官方安裝程式](https://opencode.ai/install)。

### 內建代理

與 OpenCode 一樣，此變體包含兩個內建代理，可使用 `Tab` 鍵切換。

- **build** - 預設代理，具有開發工作的完整存取權限
- **plan** - 唯讀代理，用於分析和探索程式碼

了解有關 OpenCode 代理的更多資訊，請造訪 [opencode.ai/docs/agents](https://opencode.ai/docs/agents)。

### 文件

如需了解 OpenCode 的設定方式，請參閱上游文件：
[**opencode.ai/docs**](https://opencode.ai/docs)。

### 參與貢獻

這是一個個人專案，但歡迎向上游 [**anomalyco/opencode**](https://github.com/anomalyco/opencode) 貢獻程式碼。

---

**致謝：** 基於 [anomalyco](https://github.com/anomalyco) 開發的 [OpenCode](https://github.com/anomalyco/opencode) 建置。

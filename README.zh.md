<p align="center">
  <img src="logo.png" alt="OpenDev logo">
</p>
<p align="center">OpenDev — 开源 AI 编码代理的变体。</p>

---

> [!IMPORTANT]
> OpenDev **并非**由 OpenCode 团队开发，也**不**与其存在任何关联。
> 本项目是 [anomalyco](https://github.com/anomalyco) 开发的 [OpenCode](https://github.com/anomalyco/opencode)（最初的
> 开源 AI 编码代理）的一个变体。上游代码的所有功劳归于 OpenCode 的作者和贡献者。

---

### 什么是 OpenDev？

OpenDev 是 OpenCode 的个人变体，是一个在终端中运行的开源 AI 编码代理。它基于 OpenCode
的代码，并进行了本地修改和针对我工作方式的配置调整。

如需了解完整的上游功能、文档和社区，请参阅
[**OpenCode**](https://github.com/anomalyco/opencode) 及其文档 [**opencode.ai**](https://opencode.ai/docs)。

### 安装

OpenDev 使用 [Bun](https://bun.sh) 从源码运行。

```bash
# 安装依赖
bun install

# 运行开发服务器
bun dev
```

如需上游二进制安装（未修改的 OpenCode），请参阅[官方安装程序](https://opencode.ai/install)。

### 内置代理

与 OpenCode 一样，此变体包含两个内置代理，可使用 `Tab` 键切换。

- **build** - 默认代理，具有开发工作的完整访问权限
- **plan** - 只读代理，用于分析和探索代码

了解有关 OpenCode 代理的更多信息，请访问 [opencode.ai/docs/agents](https://opencode.ai/docs/agents)。

### 文档

如需了解 OpenCode 的配置方式，请参阅上游文档：
[**opencode.ai/docs**](https://opencode.ai/docs)。

### 参与贡献

这是一个个人项目，但欢迎向上游 [**anomalyco/opencode**](https://github.com/anomalyco/opencode) 贡献代码。

---

**致谢：** 基于 [anomalyco](https://github.com/anomalyco) 开发的 [OpenCode](https://github.com/anomalyco/opencode) 构建。

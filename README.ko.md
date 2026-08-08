<p align="center">
  <a href="https://opencode.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="OpenDev logo">
    </picture>
  </a>
</p>
<p align="center">OpenDev — 오픈소스 AI 코딩 에이전트의 변형입니다.</p>

---

> [!IMPORTANT]
> OpenDev는 OpenCode 팀이 만들지 **않았으며** 그들과 **어떠한** 관련도 없습니다.
> 이 프로젝트는 원래 오픈소스 AI 코딩 에이전트인
> [anomalyco](https://github.com/anomalyco)의 [OpenCode](https://github.com/anomalyco/opencode)의 포크/변형입니다.
> 업스트림 코드의 모든 공로는 OpenCode의 작성자와 기여자에게 있습니다.

---

### OpenDev란 무엇인가요?

OpenDev는 터미널에서 실행되는 오픈소스 AI 코딩 에이전트인 OpenCode의 개인 변형입니다.
OpenCode 코드베이스를 기반으로, 제 작업 방식에 맞게 로컬 수정과 구성을 추가했습니다.

전체 업스트림 기능, 문서 및 커뮤니티는
[**OpenCode**](https://github.com/anomalyco/opencode) 및 [**opencode.ai**](https://opencode.ai/docs) 문서를 참조하세요.

### 설치

OpenDev는 [Bun](https://bun.sh)으로 소스 코드에서 실행됩니다.

```bash
# 의존성 설치
bun install

# 개발 서버 실행
bun dev
```

업스트림 바이너리 설치(수정되지 않은 OpenCode)는 [공식 설치 프로그램](https://opencode.ai/install)을 참조하세요.

### 내장 에이전트

OpenCode와 마찬가지로 이 변형에는 `Tab` 키로 전환할 수 있는 두 가지 내장 에이전트가 있습니다.

- **build** - 개발 작업을 위한 기본 풀 액세스 에이전트
- **plan** - 분석 및 코드 탐색을 위한 읽기 전용 에이전트

OpenCode 에이전트에 대한 자세한 내용은 [opencode.ai/docs/agents](https://opencode.ai/docs/agents)를 참조하세요.

### 문서

OpenCode 구성 방법에 대한 내용은 업스트림 문서를 참조하세요:
[**opencode.ai/docs**](https://opencode.ai/docs).

### 기여

이것은 개인 프로젝트이지만 업스트림 [**anomalyco/opencode**](https://github.com/anomalyco/opencode)에 대한 기여를 환영합니다.

---

**크레딧:** [anomalyco](https://github.com/anomalyco)의 [OpenCode](https://github.com/anomalyco/opencode) 기반으로 제작되었습니다.

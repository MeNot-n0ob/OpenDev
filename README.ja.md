<p align="center">
  <img src="logo.png" alt="OpenDev logo">
</p>
<p align="center">OpenDev — オープンソースの AI コーディングエージェントの変種です。</p>

---

> [!IMPORTANT]
> OpenDev は OpenCode チームによって開発されたものでは**なく**、同チームと**一切**関係ありません。
> このプロジェクトは、[anomalyco](https://github.com/anomalyco) による
> [OpenCode](https://github.com/anomalyco/opencode)（オリジナルのオープンソース AI コーディングエージェント）の変種です。
> アップストリームのコードの功績はすべて OpenCode の作者と貢献者に帰属します。

---

### OpenDev とは？

OpenDev は OpenCode の個人用変種で、ターミナルで動作するオープンソースの AI コーディングエージェントです。
OpenCode のコードベースに基づき、自分の作業方法に合わせてローカルな変更と設定を加えています。

完全なアップストリームの機能、ドキュメント、コミュニティについては、
[**OpenCode**](https://github.com/anomalyco/opencode) とそのドキュメント [**opencode.ai**](https://opencode.ai/docs) を参照してください。

### インストール

OpenDev は [Bun](https://bun.sh) でソースコードから実行します。

```bash
# 依存関係をインストール
bun install

# 開発サーバーを起動
bun dev
```

アップストリームのバイナリインストール（未変更の OpenCode）は、[公式インストーラー](https://opencode.ai/install) を参照してください。

### 組み込みエージェント

OpenCode と同様に、この変種には `Tab` キーで切り替えられる 2 つの組み込みエージェントが含まれています。

- **build** - 開発作業用のデフォルトのフルアクセスエージェント
- **plan** - 分析とコード探索のための読み取り専用エージェント

OpenCode エージェントの詳細は [opencode.ai/docs/agents](https://opencode.ai/docs/agents) を参照してください。

### ドキュメント

OpenCode の設定方法については、アップストリームのドキュメントを参照してください:
[**opencode.ai/docs**](https://opencode.ai/docs)。

### 貢献

これは個人プロジェクトですが、アップストリームの [**anomalyco/opencode**](https://github.com/anomalyco/opencode) への貢献を歓迎します。

---

**クレジット:** [anomalyco](https://github.com/anomalyco) による [OpenCode](https://github.com/anomalyco/opencode) に基づいて構築。

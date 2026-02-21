# Session Context

## User Prompts

### Prompt 1

.git/hooks/post-checkout に以下を置く。

#!/bin/bash
PREV_HEAD="$1"

# worktree add のとき $1 は 40 個のゼロになる（ブランチ切り替え時は実際のコミットハッシュ）
[ "$PREV_HEAD" != "0000000000000000000000000000000000000000" ] && exit 0

# フック実行時のカレントディレクトリが新しい worktree になる
WORKTREE_DIR="$(pwd)"
# --git-common-dir: 全 worktree が共有する .git ディレクトリを返す → その親がメインリポジ�...


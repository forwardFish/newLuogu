# 洛谷每日训练题库说明

这个题库不是简单保存洛谷原标签，而是把 `https://www.luogu.com.cn/problem/list` 的公开题目元数据转换成每日训练系统可直接使用的结构。

## 生成文件

```bash
pnpm exec tsx scripts/problem-bank/crawl-luogu-problem-list.ts \
  --max-pages 500 \
  --delay-ms 1500 \
  --output data/problem-bank/luogu_problem_catalog.json

pnpm exec tsx scripts/problem-bank/build-luogu-daily-training-bank.ts \
  --input data/problem-bank/luogu_problem_catalog.json \
  --output data/problem-bank/luogu_daily_training_bank.json
```

也可以直接在 GitHub Actions 里运行 `Update Luogu Problem Catalog`，workflow 会自动生成并提交：

- `data/problem-bank/luogu_problem_catalog.json`
- `data/problem-bank/luogu_daily_training_bank.json`

## 为什么不直接使用洛谷标签

洛谷原标签适合检索题目，但每日训练还需要额外判断：

- 这道题更适合 CSP-J 还是 CSP-S？
- 是热身题、新课题、薄弱点修复题，还是限时模拟题？
- 推荐做多久？
- 做完后几天复测？
- 这道题主要训练哪类能力？
- 是否需要人工复核，例如疑似错题、Special Judge、提交答案题？

所以训练题库会在保留洛谷原始标签的基础上，增加训练分类字段。

## 核心字段

每道题会生成如下结构：

```json
{
  "pid": "P1002",
  "title": "[NOIP 2002 普及组] 过河卒",
  "url": "https://www.luogu.com.cn/problem/P1002",
  "difficulty": {
    "level": null,
    "name": "未知",
    "band": "UNKNOWN"
  },
  "rawLuoguTags": ["动态规划 DP", "递推", "NOIP 普及组"],
  "classification": {
    "targetTrack": "CSP_J",
    "stage": "CSP_J_CORE",
    "primaryModule": {
      "id": "dp_foundation",
      "name": "动态规划基础",
      "bucket": "dp"
    },
    "abilityTags": ["STATE_DESIGN", "TRANSITION_REASONING", "BOUNDARY_INITIALIZATION"],
    "contestTags": ["NOIP_POPULAR"],
    "yearTags": ["YEAR_2002"],
    "cautionTags": []
  },
  "dailyTraining": {
    "recommendedUse": "WEAKNESS_REPAIR",
    "recommendedMinutes": 45,
    "repeatGapDays": [1, 3, 7],
    "trainingRoles": ["CONTEST_REVIEW", "DAILY_DRILL", "WEAKNESS_REPAIR"],
    "scoreFocus": ["状态定义是否清楚", "转移方程是否能解释", "初始化和边界是否漏掉"],
    "selectionScore": {
      "cspJ": 100,
      "cspS": 69,
      "daily": 93
    }
  }
}
```

## 分类层级

### targetTrack

- `CSP_J`：适合 CSP-J / NOIP 普及组 / 普及难度训练
- `CSP_S`：适合 CSP-S / NOIP 提高组 / 提高难度训练
- `ADVANCED`：省选、NOI、CTSC 或难度明显高于 CSP-S 常规训练
- `MIXED`：暂时无法稳定归类，或需要人工判断

### stage

- `FOUNDATION`：基础热身
- `CSP_J_CORE`：CSP-J 核心训练
- `CSP_S_CORE`：CSP-S 核心训练
- `ADVANCED`：进阶拓展
- `REVIEW_ONLY`：只建议人工复核或复盘，不自动进入普通每日训练

### recommendedUse

- `WARMUP`：热身题
- `NEW_LESSON`：新知识点引入题
- `DAILY_DRILL`：日常训练题
- `WEAKNESS_REPAIR`：薄弱点修复题
- `CONTEST_REVIEW`：历年比赛题复盘
- `MOCK_SECTION`：限时模拟题
- `REVIEW_ONLY`：人工复核题

## 主要模块

当前规则优先识别：

- `implementation_simulation`：实现与模拟
- `prefix_difference`：前缀和 / 差分
- `greedy_sorting`：贪心与排序
- `binary_search`：二分答案 / 二分查找
- `search_dfs_bfs`：搜索 DFS/BFS
- `dp_foundation`：动态规划基础
- `dp_knapsack`：背包 DP
- `dp_interval`：区间 DP
- `dp_state_compression`：状态压缩 DP
- `graph_basic`：图论基础
- `data_structure_basic`：基础数据结构
- `data_structure_advanced`：进阶数据结构
- `math_number_theory`：数学与数论
- `string_processing`：字符串处理

## 每日训练模板

输出文件里内置 4 套模板：

- `CSP_J_45MIN_FOUNDATION`
- `CSP_J_75MIN_SCORE_UP`
- `CSP_S_90MIN_CORE`
- `CSP_S_120MIN_TARGET_200`

后续每日训练生成器可以直接根据这些模板，从 `indexes.byRecommendedUse`、`indexes.byPrimaryModule`、`indexes.byAbilityTag` 中选题。

## 注意

本项目只保存题目元数据、标签和训练分类，不复制题面正文。正式做题时仍跳转洛谷原题链接。

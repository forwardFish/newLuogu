# 本地洛谷代码文件分析第一阶段 · Codex 开发需求文档 v1.0

> 项目：AI 信奥训练教练  
> 当前阶段：本地代码文件分析第一阶段  
> 使用对象：Codex 开发任务  
> 目标：对本地已抽取的洛谷代码文件进行程序化扫描，生成结构化分析数据，为后续 CSP-S 能力诊断和大模型深读做准备。  
> 核心原则：先做数据结构化，不要让大模型直接读取全部源码。

---

# 1. 当前背景

当前已经把某个洛谷用户的代码文件抽取到了本地。

下一步不是直接让大模型读取全部代码，而是先解决一个核心问题：

```text
每个代码文件必须知道：
1. 它是哪道题
2. 它是哪一次提交
3. 它的提交结果是什么
4. 它的分数是多少
5. 它的提交时间是什么
6. 它使用的语言是什么
```

如果没有这些信息，系统只能做：

```text
1. 代码风格分析
2. 算法模块识别
3. 编码习惯分析
```

但不能准确做：

```text
1. 错误轨迹分析
2. 从 WA 到 AC 的变化分析
3. 每道题提交次数分析
4. 多次失败后 AC 的过程分析
5. CSP-S 比赛风险判断
```

所以第一阶段最重要的任务是：

```text
先生成 submission_manifest.json
```

---

# 2. 第一阶段总体目标

实现一个本地代码分析流水线：

```text
本地代码目录
    ↓
生成 submission_manifest.json
    ↓
全量静态扫描
    ↓
按题聚合提交轨迹
    ↓
识别算法模块
    ↓
挑选高价值深读样本
    ↓
生成初步 Markdown 报告
```

第一阶段不要做：

```text
1. 不要让大模型直接读取全部源码
2. 不要生成题解代码
3. 不要修改原始代码文件
4. 不要做页面美化
5. 不要做商业化
6. 不要做训练计划
7. 不要做每日复盘
```

---

# 3. 输入数据要求

## 3.1 本地代码目录

需要支持递归扫描本地代码目录，例如：

```text
data/luogu_codes/
```

或：

```text
codes/
```

支持文件类型：

```text
.cpp
.cc
.cxx
.c
```

可选支持：

```text
.hpp
.h
```

---

## 3.2 最理想的文件结构

如果本地文件目录或文件名包含题号、结果、分数、时间，分析效果最好。

示例：

```text
data/luogu_codes/
  P3371/
    2026-06-01_20-30_AC_100.cpp
    2026-06-01_20-10_WA_0.cpp
  P4779/
    2026-06-02_21-00_TLE_30.cpp
    2026-06-02_21-30_AC_100.cpp
```

或者：

```text
codes/
  P1001_AC_100.cpp
  P3371_WA_0.cpp
  P3371_AC_100.cpp
```

或者：

```text
codes/
  1024038/
    P3371/
      12345678.cpp
```

---

## 3.3 如果文件名信息不完整

如果文件名无法解析题号、结果、分数、时间，也必须生成 manifest。

无法解析的字段允许为 null，但 `filePath` 必须存在。

---

# 4. 输出目录

所有分析结果统一写入：

```text
data/analysis/
```

如果目录不存在，程序必须自动创建。

---

# 5. 最终输出文件

第一阶段必须生成以下文件：

```text
data/analysis/submission_manifest.json
data/analysis/code_static_metrics.json
data/analysis/problem_code_timeline.json
data/analysis/algorithm_module_stats.json
data/analysis/error_pattern_candidates.json
data/analysis/deep_review_samples.json
data/analysis/csp_s_risk_profile.json
data/analysis/final_code_analysis_report.md
```

---

# 6. 第一步：生成 submission_manifest.json

## 6.1 功能目标

扫描本地代码目录，生成每份代码文件的基础索引。

输出文件：

```text
data/analysis/submission_manifest.json
```

---

## 6.2 manifest 最低字段

每个代码文件必须生成一条记录：

```json
{
  "filePath": "data/luogu_codes/P3371/2026-06-01_20-30_AC_100.cpp",
  "problemPid": "P3371",
  "problemTitle": "单源最短路径",
  "result": "AC",
  "score": 100,
  "language": "C++17",
  "submitTime": "2026-06-01T20:30:00+08:00",
  "recordId": "optional",
  "source": "local_export",
  "fileSize": 1234
}
```

---

## 6.3 字段说明

| 字段 | 必填 | 说明 |
|---|---:|---|
| filePath | 是 | 本地代码文件路径 |
| problemPid | 尽量 | 洛谷题号，例如 P3371 |
| problemTitle | 否 | 题目名称 |
| result | 否 | AC / WA / TLE / RE / CE / PC / UNKNOWN |
| score | 否 | 分数 |
| language | 否 | 默认 C++ |
| submitTime | 否 | 提交时间 |
| recordId | 否 | 洛谷提交记录 ID |
| source | 是 | local_export |
| fileSize | 是 | 文件大小 |

---

## 6.4 文件名解析规则

需要尽量从文件名或目录名解析：

```text
problemPid:
匹配 P + 数字，例如 P3371

result:
匹配 AC / WA / TLE / RE / CE / MLE / PC / UKE / UNKNOWN

score:
匹配 0-100 的数字，优先识别 result 后面的分数

submitTime:
匹配常见日期格式：
2026-06-01_20-30
2026-06-01 20:30
20260601_2030
```

---

## 6.5 解析不到时的处理

如果解析不到题号：

```json
{
  "problemPid": null
}
```

如果解析不到结果：

```json
{
  "result": "UNKNOWN"
}
```

如果解析不到时间：

```json
{
  "submitTime": null
}
```

禁止因为字段缺失跳过文件。

---

# 7. 第二步：全量代码静态扫描

## 7.1 功能目标

读取 `submission_manifest.json`，扫描所有代码文件，生成静态指标。

输出文件：

```text
data/analysis/code_static_metrics.json
```

---

## 7.2 每个文件必须输出字段

```json
{
  "filePath": "",
  "problemPid": "",
  "result": "",
  "score": null,
  "fileSize": 0,
  "lineCount": 0,
  "nonEmptyLineCount": 0,
  "blankLineCount": 0,
  "commentLineCount": 0,
  "maxLineLength": 0,
  "includeBits": false,
  "useDefineIntLongLong": false,
  "useTypedefLongLong": false,
  "useUsingNamespaceStd": false,
  "useGlobalArray": false,
  "globalArrayCount": 0,
  "globalVectorCount": 0,
  "functionCount": 0,
  "mainLineCount": 0,
  "maxBraceDepth": 0,
  "maxIndentDepth": 0,
  "loopCount": 0,
  "nestedLoopDepth": 0,
  "recursionLikely": false,
  "usesFreopen": false,
  "usesMemset": false,
  "usesModulo": false,
  "usesLongLong": false,
  "usesLambda": false,
  "usesStruct": false,
  "usesClass": false,
  "usesPriorityQueue": false,
  "usesMapSet": false,
  "usesQueueStack": false,
  "riskFlags": []
}
```

---

## 7.3 基础代码指标

必须统计：

```text
1. 总行数 lineCount
2. 有效代码行数 nonEmptyLineCount
3. 空行数 blankLineCount
4. 注释行数 commentLineCount
5. 文件大小 fileSize
6. 最长行长度 maxLineLength
7. 函数数量 functionCount
8. main 函数长度 mainLineCount
9. 最大缩进深度 maxIndentDepth
10. 最大大括号嵌套层数 maxBraceDepth
```

---

## 7.4 编程习惯指标

扫描是否出现：

```text
#include <bits/stdc++.h>
#define int long long
typedef long long ll
using namespace std
全局数组
全局 vector
递归函数
lambda
freopen
memset
MOD
INF
long long
priority_queue
map / set
queue / stack
```

---

## 7.5 风险代码模式

必须标记 riskFlags：

```text
DEFINE_INT_LONG_LONG
DEEP_NESTING
LONG_MAIN
VERY_LONG_CODE
GLOBAL_ARRAY_HEAVY
MEMSET_USED
MOD_USED
POSSIBLE_RECURSION
FREOPEN_USED
LONG_LINE
MANY_LOOPS
```

建议规则：

```text
maxBraceDepth >= 6 → DEEP_NESTING
mainLineCount >= 120 → LONG_MAIN
nonEmptyLineCount >= 200 → VERY_LONG_CODE
globalArrayCount >= 5 → GLOBAL_ARRAY_HEAVY
maxLineLength >= 160 → LONG_LINE
loopCount >= 8 → MANY_LOOPS
```

---

# 8. 第三步：按题聚合提交轨迹

## 8.1 功能目标

按 `problemPid` 聚合多份代码文件，生成每道题的提交轨迹。

输出文件：

```text
data/analysis/problem_code_timeline.json
```

---

## 8.2 每道题输出结构

```json
{
  "problemPid": "P3371",
  "problemTitle": "单源最短路径",
  "attemptCount": 3,
  "hasAc": true,
  "firstResult": "WA",
  "finalResult": "AC",
  "firstAcIndex": 3,
  "results": ["WA", "WA", "AC"],
  "scores": [0, 30, 100],
  "files": [],
  "totalLines": 350,
  "maxCodeLength": 180,
  "mainErrorTypes": ["WA"],
  "timelineTags": [
    "MULTI_FAIL_THEN_AC",
    "WA_THEN_AC"
  ]
}
```

---

## 8.3 排序规则

同一道题的提交文件排序：

```text
1. 优先按 submitTime 升序
2. 如果没有 submitTime，按文件名排序
3. 如果文件名也无序，按文件创建时间或扫描顺序
```

---

## 8.4 必须标记的题目类型

```text
ONE_SHOT_AC:
一次 AC

MULTI_FAIL_THEN_AC:
多次失败后 AC

WA_THEN_AC:
WA 后 AC

TLE_THEN_AC:
TLE 后 AC

RE_THEN_AC:
RE 后 AC

NEVER_AC:
多次提交仍未 AC

PARTIAL_SCORE:
存在部分分

STUCK_PROBLEM:
提交次数 >= 5

LONG_CODE_PROBLEM:
代码明显过长

DEEP_NESTING_PROBLEM:
嵌套明显过深
```

---

# 9. 第四步：算法模块识别

## 9.1 功能目标

基于代码文本和静态特征，识别每份代码可能涉及的算法模块。

输出文件：

```text
data/analysis/algorithm_module_stats.json
```

---

## 9.2 识别模块

必须识别：

```text
dp
graph
shortest_path
dfs_bfs
dsu
segment_tree
fenwick
heap
greedy
binary_search
math
string
search
toposort
mst
tree
```

---

## 9.3 图论特征

如果代码出现以下特征，标记 graph：

```text
vector<int> g
vector<pair<int,int>>
edge
addEdge
head
to[]
nxt[]
dfs
bfs
queue<int>
priority_queue
dist
vis
topo
indeg
fa
find
union
```

进一步判断：

```text
shortest_path:
dijkstra / spfa / floyd / dist / priority_queue

dfs_bfs:
dfs / bfs / queue

dsu:
find / fa[] / parent[] / union

toposort:
topo / indeg / queue

mst:
kruskal / prim / sort edges
```

---

## 9.4 DP 特征

如果代码出现以下特征，标记 dp：

```text
dp[
f[
状态数组
转移 max
转移 min
for i
for j
```

进一步判断：

```text
linear_dp:
一维 dp 或 f[i]

knapsack_dp:
容量循环、w/v/cost、倒序循环

interval_dp:
len / l / r / 区间枚举

tree_dp:
树上 dfs + dp

state_compression_dp:
bitmask / 1<<n / mask
```

---

## 9.5 数据结构特征

```text
fenwick:
lowbit / add / sum / BIT / tree[]

segment_tree:
segment tree / pushdown / pushup / lazy / query / modify

heap:
priority_queue

map_set:
map / set / unordered_map / unordered_set
```

---

## 9.6 数学特征

```text
gcd
lcm
pow
qpow
mod
inv
prime
sieve
comb
C[
factorial
```

---

## 9.7 字符串特征

```text
string
substr
find
kmp
next
fail
trie
hash
```

---

## 9.8 输出结构

```json
{
  "summary": {
    "dp": {
      "fileCount": 120,
      "problemCount": 80,
      "acProblemCount": 50,
      "avgAttempts": 2.3
    },
    "graph": {}
  },
  "byProblem": [
    {
      "problemPid": "P3371",
      "modules": ["graph", "shortest_path", "heap"],
      "confidence": 0.85,
      "evidence": ["priority_queue", "dist", "vector<pair<int,int>>"]
    }
  ],
  "byFile": [
    {
      "filePath": "",
      "modules": ["dp"],
      "confidence": 0.7,
      "evidence": ["dp[", "max("]
    }
  ]
}
```

---

# 10. 第五步：错误模式候选

## 10.1 功能目标

基于提交轨迹和静态扫描指标，生成可能的错误模式候选。

输出文件：

```text
data/analysis/error_pattern_candidates.json
```

---

## 10.2 必须输出的候选

```text
1. 多次 WA 后 AC
2. 多次 TLE 后 AC
3. 多次 RE 后 AC
4. 高提交次数仍未 AC
5. 部分分长期未满
6. 代码过长导致调试风险
7. 嵌套过深导致实现风险
8. 重模板依赖风险
9. long long / int 风险
10. 数组边界风险
```

---

## 10.3 输出结构

```json
{
  "waThenAc": [],
  "tleThenAc": [],
  "reThenAc": [],
  "neverAcHighAttempts": [],
  "partialScoreProblems": [],
  "longCodeRisks": [],
  "deepNestingRisks": [],
  "templateDependencyRisks": [],
  "integerRisks": [],
  "arrayBoundaryRisks": []
}
```

---

# 11. 第六步：挑选深读样本

## 11.1 功能目标

不要让大模型读所有代码，只挑最有价值的样本。

输出文件：

```text
data/analysis/deep_review_samples.json
```

---

## 11.2 必须挑选的样本组

```text
1. 提交次数最多的 20 道题
2. 多次失败后 AC 的 20 道题
3. TLE 后 AC 的题
4. RE 后 AC 的题
5. 多次提交仍未 AC 的题
6. 每个算法模块代表题 3-5 道
7. 最近 30 天代码
8. 最长代码前 20
9. 嵌套最深代码前 20
```

---

## 11.3 输出结构

```json
{
  "topAttemptProblems": [],
  "multiFailThenAc": [],
  "tleThenAc": [],
  "reThenAc": [],
  "neverAcHighAttempts": [],
  "moduleRepresentatives": {
    "dp": [],
    "graph": [],
    "shortest_path": [],
    "segment_tree": []
  },
  "recentCodes": [],
  "longestCodes": [],
  "deepestNestingCodes": []
}
```

---

# 12. 第七步：CSP-S 风险画像

## 12.1 功能目标

基于代码统计、算法模块、提交轨迹，生成 CSP-S 比赛风险画像。

输出文件：

```text
data/analysis/csp_s_risk_profile.json
```

---

## 12.2 风险维度

```text
T1 稳定性：
基础实现、边界、输入输出、模拟、简单贪心

T2 解题与实现：
中档题代码结构、二分、图论基础、DP 基础、数据结构基础

T3 部分分能力：
复杂题拆分、部分分代码、长代码调试能力

T4 难题策略：
复杂算法模板、长时间调试、取舍能力
```

---

## 12.3 输出结构

```json
{
  "t1Stability": {
    "score": 75,
    "risks": [],
    "evidence": []
  },
  "t2Solving": {
    "score": 62,
    "risks": [],
    "evidence": []
  },
  "t3Partial": {
    "score": 45,
    "risks": [],
    "evidence": []
  },
  "t4Strategy": {
    "score": 30,
    "risks": [],
    "evidence": []
  },
  "mainRisks": [
    "多次 WA 后 AC 的题较多，说明边界与实现稳定性需要加强。",
    "TLE 后 AC 样本较多，说明复杂度判断和优化能力需要提升。"
  ]
}
```

---

# 13. 第八步：生成 Markdown 初步报告

## 13.1 输出文件

```text
data/analysis/final_code_analysis_report.md
```

---

## 13.2 报告结构

```md
# 本地洛谷代码文件分析报告

## 1. 总体代码画像

## 2. AC / 非 AC 分布

## 3. 题目提交轨迹分析

## 4. 编码习惯风险

## 5. 高频错误模式候选

## 6. 算法模块能力分布

## 7. 高价值样本清单

## 8. CSP-S 比赛风险初判

## 9. 下一步大模型深读建议

## 10. 结论
```

---

# 14. 脚本命令设计

在 `package.json` 中增加：

```json
{
  "scripts": {
    "analyze:codes": "tsx scripts/analyze-codes.ts",
    "analyze:manifest": "tsx scripts/build-manifest.ts",
    "analyze:static": "tsx scripts/scan-code-static.ts",
    "analyze:timeline": "tsx scripts/build-problem-timeline.ts",
    "analyze:modules": "tsx scripts/detect-algorithm-modules.ts",
    "analyze:samples": "tsx scripts/select-deep-review-samples.ts",
    "analyze:report": "tsx scripts/generate-code-analysis-report.ts"
  }
}
```

总入口：

```bash
pnpm analyze:codes --input data/luogu_codes --output data/analysis
```

---

# 15. 总入口脚本

创建：

```text
scripts/analyze-codes.ts
```

功能：

```text
1. 调用 build-manifest
2. 调用 scan-code-static
3. 调用 build-problem-timeline
4. 调用 detect-algorithm-modules
5. 调用 select-deep-review-samples
6. 调用 generate-code-analysis-report
```

---

# 16. Codex 开发顺序

请严格按这个顺序实现：

```text
1. 创建 scripts/build-manifest.ts
2. 创建 scripts/scan-code-static.ts
3. 创建 scripts/build-problem-timeline.ts
4. 创建 scripts/detect-algorithm-modules.ts
5. 创建 scripts/select-deep-review-samples.ts
6. 创建 scripts/generate-code-analysis-report.ts
7. 创建 scripts/analyze-codes.ts 总入口
8. 更新 package.json scripts
9. 运行测试
10. 检查 data/analysis 输出文件
```

---

# 17. 验收标准

## 17.1 manifest 验收

```text
1. 能扫描所有 .cpp / .cc / .cxx / .c 文件
2. 每个文件都有 filePath
3. 能从文件名或目录名尽量解析 problemPid
4. 解析不到时不报错
5. 输出 submission_manifest.json
```

---

## 17.2 静态扫描验收

```text
1. 每个文件都有 code_static_metrics
2. 能统计行数
3. 能识别 bits/stdc++.h
4. 能识别 #define int long long
5. 能识别全局数组
6. 能识别 main 函数长度
7. 能识别大括号嵌套深度
8. 能识别循环数量
9. 能生成 riskFlags
```

---

## 17.3 题目轨迹验收

```text
1. 能按 problemPid 聚合
2. 能统计 attemptCount
3. 能判断 hasAc
4. 能判断 firstResult
5. 能判断 finalResult
6. 能判断 firstAcIndex
7. 能标记多次失败后 AC
8. 能标记多次提交仍未 AC
```

---

## 17.4 算法模块验收

```text
1. 能识别 dp
2. 能识别 graph
3. 能识别 shortest_path
4. 能识别 dsu
5. 能识别 segment_tree
6. 能识别 fenwick
7. 能识别 binary_search
8. 能输出 module stats
```

---

## 17.5 深读样本验收

```text
1. 能选出提交次数最多的 20 道题
2. 能选出多次失败后 AC 的题
3. 能选出 TLE 后 AC 的题
4. 能选出 RE 后 AC 的题
5. 能选出未 AC 且提交多的题
6. 能选出每个模块代表题
7. 能选出最长代码
8. 能选出嵌套最深代码
```

---

## 17.6 报告验收

```text
1. 能生成 final_code_analysis_report.md
2. 报告包含总体画像
3. 报告包含错误候选
4. 报告包含算法模块分布
5. 报告包含 CSP-S 风险初判
6. 报告包含下一步大模型深读样本
```

---

# 18. 不合格情况

出现以下情况视为不合格：

```text
1. 直接让大模型读取全部源码
2. 修改原始代码文件
3. 没有 manifest
4. 没有 code_static_metrics
5. 没有 problem_code_timeline
6. 没有 deep_review_samples
7. 只输出自然语言报告，没有结构化 JSON
8. 只看 AC，不看 WA / TLE / RE / CE
9. 不能按题聚合提交轨迹
```

---

# 19. 给 Codex 的最终一句话

```text
请实现本地洛谷代码文件分析第一阶段：递归扫描本地 C/C++ 代码文件，生成 submission_manifest.json、code_static_metrics.json、problem_code_timeline.json、algorithm_module_stats.json、error_pattern_candidates.json、deep_review_samples.json、csp_s_risk_profile.json 和 final_code_analysis_report.md。不要让大模型直接读全部源码，不要修改原始代码文件，所有输出写入 data/analysis/。
```

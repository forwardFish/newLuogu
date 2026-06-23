# 自用版 AI 信奥训练教练 · CSP-S 一等奖冲刺系统功能实现文档 v1.1

> 当前阶段：个人自用验证版  
> 第一目标：帮助自己的孩子每天训练，提高 CSP-S 提高组一等奖竞争力  
> 第二目标：如果自用有效，再逐步商业化  
> 产品形态：先做单用户 Web 系统，不做家长端、不做机构端、不做支付、不做多用户复杂权限  
> 核心原则：先验证训练效果，再考虑商业化

---

## 0. 产品阶段路线

本项目必须分阶段推进，不能一开始就做商业化大系统。

### 0.1 第一阶段：自用验证版

目标：

```text
只服务自己的孩子。
```

核心验证：

```text
1. 系统能不能每天给孩子安排合理训练任务
2. 孩子是否愿意每天打开使用
3. 系统推荐的题目是否符合孩子当前水平
4. 复盘是否真的能帮助孩子发现问题
5. 30 天后孩子能力是否明显提升
6. 是否更接近 CSP-S 提高组一等奖水平
```

这一阶段不考虑：

```text
1. 商业化
2. 多用户
3. 家长端
4. 机构后台
5. 付费系统
6. 营销页面
7. 数据大屏
8. 排行榜
```

---

### 0.2 第二阶段：可复制使用版

当自用有效后，再支持：

```text
1. 支持多个学生
2. 支持每个学生独立训练计划
3. 支持训练报告导出
4. 支持配置不同目标：
   - CSP-J 一等奖
   - CSP-S 一等奖
   - NOIP 提高
5. 支持基础版家长查看
```

---

### 0.3 第三阶段：商业化版

只有当第一阶段、第二阶段都验证成功后，再考虑商业化。

商业化方向包括：

```text
1. 30 天 CSP-S 冲刺营
2. AI 信奥训练教练月费版
3. 家长端周报
4. 老师辅助后台
5. 机构学生管理系统
6. 错题复盘订阅服务
```

商业化不是现在的重点。

当前重点只有一个：

```text
先让自己的孩子每天用起来，并且真的提升。
```

---

## 1. 项目目标

本系统只服务一个核心目标：

```text
帮助孩子每天进行 CSP-S 提高组训练，持续 30 天，尽最大可能提升冲击一等奖的能力。
```

系统不承诺“30 天一定一等奖”，但要做到：

```text
1. 第 0 天：分析孩子当前洛谷做题历史
2. 第 1 天：生成第一天训练任务
3. 每一天：安排 2-3 道题
4. 每一题：记录结果、用时、错因
5. 每一天结束：生成当天复盘
6. 第二天：根据昨天表现自动调整任务
7. 每 7 天：做一次阶段复盘
8. 第 30 天：输出最终冲刺评估
```

---

## 2. 自用版产品边界

### 2.1 要做的功能

第一版只做：

```text
1. 孩子档案
2. 洛谷 UID 数据同步
3. 初始能力评估
4. 30 天训练计划
5. 每日训练任务
6. 做题复盘
7. 明日任务动态调整
8. 每 7 天阶段复盘
9. 第 30 天最终评估
```

---

### 2.2 不做的功能

第一版不做：

```text
1. 不做家长端
2. 不做机构后台
3. 不做多学生管理
4. 不做微信小程序
5. 不做支付
6. 不做排行榜
7. 不做社区
8. 不做自动登录洛谷
9. 不保存洛谷账号密码
10. 不保存洛谷 Cookie
11. 不自动提交代码
12. 不输出完整题解代码
13. 不做商业化落地页
14. 不做营销裂变
```

---

## 3. 系统核心逻辑

系统的本质是一个训练闭环：

```text
洛谷历史数据
    ↓
初始能力评估
    ↓
30 天训练计划
    ↓
今日任务
    ↓
孩子做题
    ↓
同步提交结果
    ↓
孩子填写错因
    ↓
AI 生成复盘
    ↓
系统调整明日任务
```

---

## 4. 自用版成功标准

第一阶段不是看“有没有商业收入”，而是看孩子训练是否有效。

### 4.1 使用成功标准

```text
1. 孩子连续使用 7 天以上
2. 每天至少完成 2 道训练题
3. 每题都能记录是否独立完成
4. 每题都能记录是否看题解
5. 每天都有复盘
6. 系统能根据结果调整第二天任务
```

---

### 4.2 训练成功标准

```text
1. 30 天完成至少 60 道有效训练题
2. 至少完成 20 道复盘质量合格的错题
3. 独立 AC 数逐步上升
4. 看题解后 AC 比例下降
5. TLE / WA 比例下降
6. 绿题稳定性提升
7. 蓝题尝试能力提升
```

---

### 4.3 一等奖竞争力判断标准

系统最终不是简单说“能不能一等奖”，而是判断：

```text
1. T1 是否能稳定拿满
2. T2 是否有较高完成概率
3. T3 是否有部分分能力
4. T4 是否知道取舍和骗分
5. 比赛 4 小时是否能保持稳定
6. 是否具备独立读题、建模、实现、调试能力
```

---

## 5. 使用流程

### 5.1 第 0 天：建立孩子档案

输入：

```text
1. 洛谷 UID
2. 当前目标：CSP-S 提高组一等奖
3. 当前年级
4. 每天可训练时间
5. 当前是否学过：
   - DP
   - 图论
   - 数据结构
   - 数学
   - 搜索
6. 最近一次模拟赛成绩，可选
```

系统做：

```text
1. 同步洛谷已 AC 题目
2. 同步最近提交记录
3. 统计题目难度
4. 统计知识点覆盖
5. 统计 WA / TLE / RE / CE
6. 生成初始评估
7. 判断当前是 A/B/C/D 档
8. 生成 30 天训练计划
```

---

### 5.2 每天使用流程

每天孩子打开系统后：

```text
1. 查看今日训练主题
2. 查看今日必做题 2 道
3. 查看今日选做题 1 道
4. 点击题目跳转洛谷做题
5. 做完后回到系统填写：
   - 是否 AC
   - 用时
   - 是否看题解
   - 错因
   - 自己总结
6. 系统生成本题复盘
7. 每天结束后生成今日总结
8. 系统调整明日任务
```

---

## 6. 页面设计

自用版只需要 6 个页面。

---

## 6.1 页面一：孩子档案页

### 路由

```text
/profile
```

### 页面目标

配置孩子基础信息。

### 页面内容

```text
孩子训练档案

洛谷 UID：
[____________]

目标：
[ CSP-S 提高组一等奖 ]

当前年级：
[ 初二 / 初三 / 高一 / 高二 ]

每天可训练时间：
[ 1小时 / 2小时 / 3小时以上 ]

当前基础：
□ 学过 DP
□ 学过 图论
□ 学过 数据结构
□ 学过 数学
□ 学过 搜索

[ 保存并开始分析 ]
```

---

## 6.2 页面二：初始分析页

### 路由

```text
/report
```

### 页面目标

告诉你孩子目前离 CSP-S 一等奖差在哪里。

### 页面内容

```text
CSP-S 提高组一等奖冲刺评估

当前评分：72 / 100

当前档位：
B档：有二等基础，可冲一等，但必须专项突破

当前判断：
孩子已经具备一定提高组基础，但图论、DP、复杂度控制仍是主要短板。
如果每天稳定完成训练，30 天内可以明显提升冲击一等奖的竞争力。

能力结构：
动态规划：68
图论：54
数据结构：72
数学：48
搜索：63
贪心：70
代码实现：75
训练稳定性：60

最重要短板：
1. 图论综合能力不足
2. DP 状态设计不稳定
3. 蓝题 AC 稳定性偏低
4. TLE 比例偏高，复杂度判断需要强化
5. 训练连续性不足

[ 生成 30 天训练计划 ]
```

---

## 6.3 页面三：30 天训练计划封面页

### 路由

```text
/plan
```

### 页面目标

让孩子知道接下来 30 天怎么练。

### 页面内容

```text
30 天 CSP-S 提高组一等奖冲刺计划

训练目标：
提升 CSP-S 第二轮 4 题场景下的得分能力。

第 1 阶段：Day 1 - Day 7
目标：补基础短板
重点：图论基础、DP 基础、代码稳定性

第 2 阶段：Day 8 - Day 14
目标：绿题稳定，蓝题突破
重点：中档题、复杂度、模型识别

第 3 阶段：Day 15 - Day 21
目标：综合题能力
重点：T2/T3 思维、限时训练、部分分策略

第 4 阶段：Day 22 - Day 30
目标：模拟赛冲刺
重点：比赛策略、错题回炉、最终评估

[ 开始 Day 1 ]
```

---

## 6.4 页面四：今日训练页

### 路由

```text
/today
```

### 页面目标

孩子每天打开后，只看这个页面。

### 页面内容

```text
Day 8 / 30

今日主题：
图论最短路强化

今日目标：
提高最短路建模能力和复杂度控制能力。

必做任务 1：
P3371 单源最短路径
难度：黄
知识点：最短路 / Dijkstra
训练目的：复盘基础模型
预计用时：40 分钟

[ 去洛谷做题 ]
[ 填写复盘 ]

必做任务 2：
P4779 单源最短路径标准版
难度：绿
知识点：堆优化 Dijkstra
训练目的：训练复杂度控制
预计用时：60 分钟

[ 去洛谷做题 ]
[ 填写复盘 ]

选做任务：
图论综合题
难度：绿/蓝
训练目的：限时挑战

[ 去洛谷做题 ]
[ 填写复盘 ]

今日完成度：
必做 0 / 2
选做 0 / 1

[ 生成今日总结 ]
```

---

## 6.5 页面五：做题复盘页

### 路由

```text
/review/:taskId
```

### 页面目标

每道题做完后记录真实情况。

### 页面内容

```text
题目：P3371 单源最短路径

做题结果：
○ AC
○ WA
○ TLE
○ RE
○ CE
○ 没做出来

用时：
[ 20 分钟以内 / 20-40 分钟 / 40-60 分钟 / 60 分钟以上 ]

是否看题解：
○ 没看题解，独立完成
○ 看了提示
○ 看了题解思路
○ 看了完整题解
○ 照着代码写出来

主要错误类型：
□ 没思路
□ 题意理解错
□ 状态设计错
□ 边界条件错
□ 复杂度不对
□ 代码实现错误
□ 模板不熟
□ 时间不够

我的总结：
[ 输入框 ]

[ 提交复盘 ]
```

---

## 6.6 页面六：阶段复盘页

### 路由

```text
/stage-report
```

### 页面目标

每 7 天看一次阶段结果。

### 页面内容

```text
第 1 周阶段复盘

训练天数：6 / 7
完成题目：18
AC 题目：11
独立 AC：7
看题解后 AC：4
未完成：3

本周提升：
1. 最短路基础明显改善
2. 黄题稳定性提升
3. TLE 比例下降

仍然问题：
1. DP 状态设计不稳定
2. 蓝题独立完成能力不足
3. 复盘质量不够具体

下周调整：
1. 增加 DP 专项
2. 保留图论中档题
3. 每两天安排一次限时训练
```

---

## 7. 数据库设计

---

## 7.1 children 孩子档案表

```sql
CREATE TABLE children (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255),
  luogu_uid VARCHAR(64) UNIQUE NOT NULL,
  target VARCHAR(64) DEFAULT 'CSP-S_FIRST_PRIZE',
  grade VARCHAR(64),
  daily_training_minutes INT DEFAULT 120,
  current_level VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7.2 problems 题目表

```sql
CREATE TABLE problems (
  id BIGSERIAL PRIMARY KEY,
  luogu_pid VARCHAR(64) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  difficulty INT,
  difficulty_name VARCHAR(64),
  tags JSONB DEFAULT '[]',
  source TEXT,
  csp_weight NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7.3 submissions 洛谷提交记录表

```sql
CREATE TABLE submissions (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES children(id),
  problem_id BIGINT NOT NULL REFERENCES problems(id),
  luogu_record_id VARCHAR(128),
  result VARCHAR(32),
  score INT,
  language VARCHAR(64),
  submit_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(child_id, luogu_record_id)
);
```

---

## 7.4 user_problem_stats 用户题目状态表

```sql
CREATE TABLE user_problem_stats (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES children(id),
  problem_id BIGINT NOT NULL REFERENCES problems(id),
  is_ac BOOLEAN DEFAULT FALSE,
  attempt_count INT DEFAULT 0,
  wrong_count INT DEFAULT 0,
  first_ac_time TIMESTAMP,
  last_submit_time TIMESTAMP,
  main_error_type VARCHAR(64),
  solved_independently BOOLEAN DEFAULT FALSE,
  watched_solution BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(child_id, problem_id)
);
```

---

## 7.5 knowledge_nodes 知识点表

```sql
CREATE TABLE knowledge_nodes (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(255) UNIQUE NOT NULL,
  parent_id BIGINT REFERENCES knowledge_nodes(id),
  level INT DEFAULT 1,
  csp_stage VARCHAR(64),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7.6 problem_knowledge_maps 题目知识点映射表

```sql
CREATE TABLE problem_knowledge_maps (
  id BIGSERIAL PRIMARY KEY,
  problem_id BIGINT NOT NULL REFERENCES problems(id),
  knowledge_id BIGINT NOT NULL REFERENCES knowledge_nodes(id),
  weight NUMERIC(5,2) DEFAULT 1,
  source VARCHAR(64) DEFAULT 'tag_rule',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(problem_id, knowledge_id)
);
```

---

## 7.7 baseline_reports 初始评估表

```sql
CREATE TABLE baseline_reports (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES children(id),
  total_score INT,
  level VARCHAR(64),
  ability_json JSONB,
  weak_points JSONB,
  error_stats JSONB,
  report_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7.8 training_plans 30 天训练计划表

```sql
CREATE TABLE training_plans (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES children(id),
  baseline_report_id BIGINT REFERENCES baseline_reports(id),
  title TEXT,
  goal TEXT,
  plan_type VARCHAR(64) DEFAULT '30d',
  start_date DATE,
  end_date DATE,
  status VARCHAR(64) DEFAULT 'active',
  content JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7.9 training_days 每日训练表

```sql
CREATE TABLE training_days (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES children(id),
  training_plan_id BIGINT NOT NULL REFERENCES training_plans(id),
  day_index INT NOT NULL,
  training_date DATE,
  theme TEXT,
  target TEXT,
  status VARCHAR(64) DEFAULT 'pending',
  daily_summary TEXT,
  adjustment_for_tomorrow TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(child_id, training_plan_id, day_index)
);
```

---

## 7.10 training_tasks 每日任务表

```sql
CREATE TABLE training_tasks (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES children(id),
  training_day_id BIGINT NOT NULL REFERENCES training_days(id),
  problem_id BIGINT REFERENCES problems(id),
  task_order INT,
  task_type VARCHAR(64),
  required BOOLEAN DEFAULT TRUE,
  difficulty_target VARCHAR(64),
  knowledge_codes JSONB DEFAULT '[]',
  purpose TEXT,
  estimated_minutes INT,
  status VARCHAR(64) DEFAULT 'pending',
  luogu_url TEXT,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7.11 task_reviews 做题复盘表

```sql
CREATE TABLE task_reviews (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES children(id),
  task_id BIGINT NOT NULL REFERENCES training_tasks(id),
  result VARCHAR(64),
  time_spent_minutes INT,
  solution_usage VARCHAR(64),
  error_types JSONB DEFAULT '[]',
  self_note TEXT,
  ai_review TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7.12 stage_reports 阶段复盘表

```sql
CREATE TABLE stage_reports (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES children(id),
  training_plan_id BIGINT NOT NULL REFERENCES training_plans(id),
  stage_index INT,
  start_day INT,
  end_day INT,
  report_json JSONB,
  report_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7.13 final_reports 最终评估表

```sql
CREATE TABLE final_reports (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES children(id),
  training_plan_id BIGINT NOT NULL REFERENCES training_plans(id),
  final_score INT,
  final_level VARCHAR(64),
  prize_readiness VARCHAR(64),
  report_json JSONB,
  report_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8. 后端 API 设计

---

## 8.1 保存孩子档案

```http
POST /api/profile
```

### Request

```json
{
  "name": "孩子",
  "luoguUid": "123456",
  "target": "CSP-S_FIRST_PRIZE",
  "grade": "初三",
  "dailyTrainingMinutes": 120
}
```

### Response

```json
{
  "childId": 1,
  "luoguUid": "123456",
  "status": "created"
}
```

---

## 8.2 同步洛谷数据并生成初始评估

```http
POST /api/baseline/analyze
```

### Request

```json
{
  "childId": 1,
  "luoguUid": "123456"
}
```

### Response

```json
{
  "reportId": 1,
  "score": 72,
  "level": "B",
  "summary": "有二等基础，可冲一等，但需要强化图论和 DP。"
}
```

---

## 8.3 创建 30 天训练计划

```http
POST /api/plan/30-days
```

### Request

```json
{
  "childId": 1,
  "baselineReportId": 1
}
```

### Response

```json
{
  "planId": 1,
  "title": "30 天 CSP-S 提高组一等奖冲刺计划",
  "days": 30
}
```

---

## 8.4 获取今日训练

```http
GET /api/today?childId=1
```

### Response

```json
{
  "dayIndex": 8,
  "theme": "图论最短路强化",
  "target": "提高最短路建模和复杂度控制能力",
  "tasks": [
    {
      "taskId": 101,
      "problemId": "P3371",
      "title": "单源最短路径",
      "difficulty": "黄",
      "knowledge": ["shortest_path"],
      "purpose": "复盘最短路基础模型",
      "estimatedMinutes": 40,
      "required": true,
      "luoguUrl": "https://www.luogu.com.cn/problem/P3371"
    }
  ]
}
```

---

## 8.5 开始任务

```http
POST /api/tasks/:taskId/start
```

### Response

```json
{
  "taskId": 101,
  "status": "started"
}
```

---

## 8.6 提交做题复盘

```http
POST /api/tasks/:taskId/review
```

### Request

```json
{
  "result": "WA",
  "timeSpentMinutes": 45,
  "solutionUsage": "hint_only",
  "errorTypes": ["boundary_error", "implementation_error"],
  "selfNote": "最短路初始化时没有处理无穷大和点编号范围。"
}
```

### Response

```json
{
  "reviewId": 1,
  "aiReview": "这道题主要暴露的是边界处理和模板稳定性问题。下次做最短路题前，先检查点编号范围、距离初始化、边权类型和优先队列更新条件。"
}
```

---

## 8.7 生成今日总结

```http
POST /api/daily-summary
```

### Request

```json
{
  "childId": 1,
  "dayIndex": 8
}
```

### Response

```json
{
  "summary": "今天完成 2 道图论题，最短路基础有所改善，但复杂度优化仍需加强。",
  "adjustmentForTomorrow": "明天继续保留一道图论中档题，同时加入一道 DP 基础题防止偏科。"
}
```

---

## 8.8 生成阶段复盘

```http
POST /api/stage-report
```

### Request

```json
{
  "childId": 1,
  "stageIndex": 1
}
```

### Response

```json
{
  "stageReportId": 1,
  "summary": "第 1 周完成度较好，图论基础有提升，但 DP 仍需强化。"
}
```

---

## 8.9 获取最终评估

```http
POST /api/final-report
```

### Request

```json
{
  "childId": 1,
  "trainingPlanId": 1
}
```

### Response

```json
{
  "finalScore": 81,
  "finalLevel": "B+",
  "prizeReadiness": "具备冲击一等的基础，但仍取决于临场发挥、题目分布和省份评级情况。"
}
```

---

## 9. 洛谷数据获取实现

---

## 9.1 获取用户公开数据

### URL

```http
GET https://www.luogu.com.cn/user/{uid}?_contentOnly=1
```

### 解析内容

```text
1. 用户名
2. 已 AC 题目
3. 练习情况
4. 难度分布
```

---

## 9.2 获取提交记录

### URL

```http
GET https://www.luogu.com.cn/record/list?user={uid}&page={page}
```

### 解析内容

```text
1. 题目 ID
2. 提交结果
3. 分数
4. 提交时间
5. 语言
```

---

## 9.3 获取题目信息

### URL

```http
GET https://www.luogu.com.cn/problem/{pid}?_contentOnly=1
```

### 解析内容

```text
1. 题号
2. 标题
3. 难度
4. 标签
5. 来源
```

---

## 9.4 限流策略

必须实现：

```text
1. 同一 UID 10 分钟内只同步一次
2. 每个洛谷请求间隔 500ms
3. 题目信息缓存 7 天
4. 提交记录增量同步
5. 外部请求失败自动重试 3 次
```

---

## 10. CSP-S 知识点图谱

---

## 10.1 一级知识点

```json
[
  { "code": "basic", "name": "基础能力" },
  { "code": "greedy", "name": "贪心" },
  { "code": "binary_search", "name": "二分" },
  { "code": "data_structure", "name": "数据结构" },
  { "code": "dp", "name": "动态规划" },
  { "code": "graph", "name": "图论" },
  { "code": "math", "name": "数学" },
  { "code": "search", "name": "搜索" },
  { "code": "string", "name": "字符串" }
]
```

---

## 10.2 二级知识点

```json
[
  { "parent": "basic", "code": "implementation", "name": "模拟与实现" },
  { "parent": "basic", "code": "prefix_sum", "name": "前缀和" },
  { "parent": "basic", "code": "difference", "name": "差分" },

  { "parent": "data_structure", "code": "stack_queue", "name": "栈与队列" },
  { "parent": "data_structure", "code": "monotonic_stack_queue", "name": "单调栈/单调队列" },
  { "parent": "data_structure", "code": "heap", "name": "堆/优先队列" },
  { "parent": "data_structure", "code": "dsu", "name": "并查集" },
  { "parent": "data_structure", "code": "fenwick", "name": "树状数组" },
  { "parent": "data_structure", "code": "segment_tree", "name": "线段树" },
  { "parent": "data_structure", "code": "lca", "name": "LCA" },
  { "parent": "data_structure", "code": "tree_chain", "name": "树链剖分" },

  { "parent": "dp", "code": "linear_dp", "name": "线性 DP" },
  { "parent": "dp", "code": "knapsack_dp", "name": "背包 DP" },
  { "parent": "dp", "code": "interval_dp", "name": "区间 DP" },
  { "parent": "dp", "code": "tree_dp", "name": "树形 DP" },
  { "parent": "dp", "code": "state_compression_dp", "name": "状压 DP" },
  { "parent": "dp", "code": "digit_dp", "name": "数位 DP" },
  { "parent": "dp", "code": "dp_optimization", "name": "DP 优化" },

  { "parent": "graph", "code": "bfs_dfs_graph", "name": "图上 DFS/BFS" },
  { "parent": "graph", "code": "shortest_path", "name": "最短路" },
  { "parent": "graph", "code": "mst", "name": "最小生成树" },
  { "parent": "graph", "code": "toposort", "name": "拓扑排序" },
  { "parent": "graph", "code": "scc", "name": "强连通分量" },
  { "parent": "graph", "code": "tarjan", "name": "Tarjan" },
  { "parent": "graph", "code": "bipartite_graph", "name": "二分图" },

  { "parent": "math", "code": "number_theory", "name": "数论" },
  { "parent": "math", "code": "combinatorics", "name": "组合数学" },
  { "parent": "math", "code": "probability", "name": "概率期望" },

  { "parent": "search", "code": "dfs_bfs", "name": "DFS/BFS" },
  { "parent": "search", "code": "pruning", "name": "剪枝" },
  { "parent": "search", "code": "memorized_search", "name": "记忆化搜索" },

  { "parent": "string", "code": "kmp", "name": "KMP" },
  { "parent": "string", "code": "trie", "name": "Trie" },
  { "parent": "string", "code": "hash", "name": "字符串 Hash" },
  { "parent": "string", "code": "ac_automaton", "name": "AC 自动机" }
]
```

---

## 11. 能力评分算法

---

## 11.1 总评分公式

```text
总分 =
知识点覆盖分 * 25%
+ 难度上限分 * 20%
+ 独立 AC 稳定性分 * 20%
+ 代码实现能力分 * 15%
+ 错误控制分 * 10%
+ 训练连续性分 * 10%
```

---

## 11.2 档位判断

```typescript
function getTrainingLevel(score: number) {
  if (score >= 85) {
    return {
      level: "A",
      name: "接近一等奖竞争力",
      strategy: "模拟赛冲刺 + 高质量复盘"
    };
  }

  if (score >= 70) {
    return {
      level: "B",
      name: "有二等基础，可冲一等",
      strategy: "补短板 + 蓝题稳定性训练"
    };
  }

  if (score >= 50) {
    return {
      level: "C",
      name: "基础不完整",
      strategy: "先补基础，再冲提高组"
    };
  }

  return {
    level: "D",
    name: "基础断层明显",
    strategy: "建立基础训练体系"
  };
}
```

---

## 11.3 每日任务调整规则

```typescript
function adjustTomorrowPlan(today: {
  completedTasks: number;
  acCount: number;
  independentAcCount: number;
  waCount: number;
  tleCount: number;
  usedSolutionCount: number;
}) {
  if (today.completedTasks === 0) {
    return "明天降低任务量，优先恢复训练节奏。";
  }

  if (today.tleCount >= 2) {
    return "明天降低难度，增加复杂度分析训练。";
  }

  if (today.waCount >= 2) {
    return "明天安排同类基础题，强化边界和状态设计。";
  }

  if (today.usedSolutionCount >= 2) {
    return "明天不提高难度，继续安排同类题，目标是独立完成。";
  }

  if (today.independentAcCount >= 2) {
    return "明天可以小幅提高难度，加入一题中档综合题。";
  }

  return "保持当前难度，继续稳定训练。";
}
```

---

## 12. 30 天训练计划规则

---

## 12.1 总体安排

```text
Day 1 - Day 7：补基础短板
Day 8 - Day 14：绿题稳定 + 蓝题尝试
Day 15 - Day 21：综合题训练 + 限时训练
Day 22 - Day 30：模拟赛冲刺 + 错题回炉
```

---

## 12.2 每天任务结构

```text
每天 2 道必做题 + 1 道选做题

必做题 1：
当前最弱模块的基础题

必做题 2：
当前最弱模块的中档题

选做题：
综合挑战题或模拟赛拆题
```

---

## 12.3 每 7 天阶段目标

```text
第 1 周目标：
恢复训练节奏，补齐最基础短板。

第 2 周目标：
提高绿题稳定性，开始蓝题突破。

第 3 周目标：
训练综合建模能力，增加限时训练。

第 4 周目标：
模拟赛冲刺，训练比赛策略。
```

---

## 13. 大模型提示词

---

## 13.1 初始诊断 Prompt

```text
你是专业 CSP-S 竞赛训练教练。

现在要帮助一个学生进行 30 天提高组一等奖冲刺训练。

注意：
1. 不要承诺一定拿一等奖
2. 不要输出完整题解
3. 不要输出代码
4. 不要鼓励作弊
5. 目标是制定训练策略，而不是替学生做题
6. 分析必须基于数据，不要空泛
7. 当前系统是自用版，只服务一个学生

输入数据：
学生基础信息：
{{childProfile}}

洛谷历史数据：
{{luoguStats}}

能力评分：
{{abilityMetrics}}

知识点覆盖：
{{knowledgeStats}}

提交错误统计：
{{errorStats}}

请输出：

# 初始诊断报告

## 1. 当前档位
A / B / C / D

## 2. 是否适合 30 天冲刺一等奖
说明理由。

## 3. 最重要的短板
最多 5 条，每条包含：
- 短板名称
- 数据依据
- 对 CSP-S 的影响
- 训练方向

## 4. 30 天训练策略
按 4 个阶段说明。

## 5. 今天应该从哪里开始
给出 Day 1 训练建议。
```

---

## 13.2 每日训练任务 Prompt

```text
你是 CSP-S 每日训练教练。

请根据学生当前训练计划、昨日表现、薄弱项，生成今天的训练任务。

要求：
1. 每天 2 道必做题，1 道选做题
2. 任务必须适合当前能力
3. 不能突然提高太多难度
4. 如果昨天 WA/TLE 多，今天要降低难度
5. 如果昨天独立 AC 多，今天可以小幅提高难度
6. 每道题必须写清训练目的
7. 不输出题解
8. 不输出代码

输入：
当前第 {{dayIndex}} 天
当前阶段：{{stage}}
学生档位：{{level}}
昨日表现：{{yesterdayResult}}
薄弱项：{{weakPoints}}
可推荐题目：{{candidateProblems}}

输出 JSON：

{
  "dayIndex": 1,
  "theme": "",
  "target": "",
  "tasks": [
    {
      "problemId": "",
      "title": "",
      "difficulty": "",
      "knowledge": [],
      "purpose": "",
      "estimatedMinutes": 40,
      "required": true
    }
  ],
  "reviewFocus": ""
}
```

---

## 13.3 做题复盘 Prompt

```text
你是 OI 竞赛复盘教练。

学生完成了一道题，请根据结果生成复盘反馈。

要求：
1. 不给完整题解
2. 不给代码
3. 不直接告诉答案
4. 指出主要问题
5. 给出下次做同类题的检查清单
6. 语言简洁，适合每天训练后阅读

输入：
题目：{{problem}}
知识点：{{knowledge}}
结果：{{result}}
用时：{{timeSpent}}
是否看题解：{{solutionUsage}}
错误类型：{{errorTypes}}
学生总结：{{selfNote}}

输出：

# 本题复盘

## 主要问题

## 下次检查清单

## 明天训练建议
```

---

## 13.4 每日总结 Prompt

```text
你是 CSP-S 训练教练。

请根据学生今天的训练记录，生成今日总结和明日调整建议。

要求：
1. 不夸大
2. 不打击学生
3. 直接指出问题
4. 给出明天调整方向
5. 不输出题解和代码

输入：
今日任务：
{{todayTasks}}

今日复盘：
{{taskReviews}}

今日提交结果：
{{submissionResults}}

输出：

# 今日训练总结

## 1. 今天完成情况

## 2. 今天暴露的问题

## 3. 今天值得保留的进步

## 4. 明天训练调整
```

---

## 13.5 30 天最终评估 Prompt

```text
你是 CSP-S 竞赛训练教练。

学生已经完成 30 天训练，请生成最终评估。

要求：
1. 不承诺一定拿一等奖
2. 必须判断是否具备冲击一等奖竞争力
3. 必须指出仍需补强的地方
4. 必须给出最后阶段训练策略
5. 不输出完整题解和代码

输入：
训练前数据：
{{baseline}}

30天训练过程数据：
{{trainingProcess}}

训练后能力指标：
{{finalMetrics}}

输出：

# 30 天训练最终评估

## 1. 训练完成情况

## 2. 能力提升情况

## 3. 是否具备冲击一等奖竞争力

## 4. 仍需补强的问题

## 5. 后续训练策略

## 6. 比赛策略建议
```

---

## 14. 后端模块设计

---

## 14.1 模块结构

```text
src/
  modules/
    profile/
      profile.controller.ts
      profile.service.ts

    luogu/
      luogu.controller.ts
      luogu.service.ts
      luogu.parser.ts

    baseline/
      baseline.controller.ts
      baseline.service.ts

    plan/
      plan.controller.ts
      plan.service.ts

    today/
      today.controller.ts
      today.service.ts

    review/
      review.controller.ts
      review.service.ts

    stage-report/
      stage-report.controller.ts
      stage-report.service.ts

    final-report/
      final-report.controller.ts
      final-report.service.ts

    scoring/
      scoring.service.ts
      weak-point.service.ts

    knowledge/
      knowledge.service.ts
      knowledge.seed.ts
      tag-mapping.ts

    ai/
      llm.service.ts
      prompt.service.ts
```

---

## 14.2 各模块职责

### ProfileService

```text
1. 保存孩子档案
2. 更新训练目标
3. 查询当前训练状态
```

### LuoguService

```text
1. 获取洛谷公开数据
2. 获取提交记录
3. 获取题目信息
4. 写入 submissions / problems
```

### BaselineService

```text
1. 生成初始能力评估
2. 判断 A/B/C/D 档
3. 找主要短板
4. 生成初始诊断报告
```

### PlanService

```text
1. 创建 30 天训练计划
2. 生成 30 个 training_days
3. 生成 Day 1 任务
4. 根据阶段调整策略
```

### TodayService

```text
1. 获取今日任务
2. 开始任务
3. 完成任务
4. 生成今日总结
5. 调整明日任务
```

### ReviewService

```text
1. 保存每题复盘
2. 调用 AI 生成复盘反馈
3. 更新错因统计
4. 更新用户题目状态
```

### StageReportService

```text
1. 每 7 天生成阶段报告
2. 统计完成率
3. 统计独立 AC 数
4. 判断短板是否改善
```

### FinalReportService

```text
1. 生成 30 天最终评估
2. 判断是否具备冲击一等奖竞争力
3. 输出后续训练建议
```

---

## 15. 开发任务拆分

---

## 15.1 第一阶段：跑通自用训练流程

目标：能给孩子每天生成训练任务。

```text
任务 1：创建 children 表
任务 2：创建 profile 页面
任务 3：实现洛谷 UID 同步
任务 4：实现初始能力评估
任务 5：生成 30 天训练计划
任务 6：生成 Day 1 今日任务
任务 7：创建 today 页面
```

---

## 15.2 第二阶段：做题复盘闭环

目标：孩子做完题后可以复盘，并调整明天任务。

```text
任务 1：创建 training_tasks 表
任务 2：创建 task_reviews 表
任务 3：实现 review 页面
任务 4：实现复盘提交 API
任务 5：接入 AI 复盘 Prompt
任务 6：生成今日总结
任务 7：调整明日任务
```

---

## 15.3 第三阶段：阶段复盘

目标：每 7 天看一次训练效果。

```text
任务 1：创建 stage_reports 表
任务 2：统计 7 天训练数据
任务 3：统计完成率 / 独立 AC / 看题解比例
任务 4：生成阶段复盘
任务 5：更新下阶段训练重点
```

---

## 15.4 第四阶段：最终评估

目标：30 天后判断是否具备冲击一等奖竞争力。

```text
任务 1：统计 30 天训练数据
任务 2：重新计算能力评分
任务 3：对比训练前后变化
任务 4：生成最终报告
任务 5：输出后续训练策略
```

---

## 15.5 第五阶段：自用验证完成后的商业化预留

只有当自用版连续使用有效后，才进入此阶段。

```text
任务 1：把 children 扩展为 students
任务 2：支持多个学生档案
任务 3：支持用户账号系统
任务 4：支持家长查看报告
任务 5：支持 30 天训练模板复制
任务 6：支持训练计划导出
任务 7：支持按目标生成不同训练营
任务 8：支持付费入口
```

商业化改造原则：

```text
1. 不推翻自用版核心逻辑
2. 只是在自用版基础上增加多用户、权限和支付
3. 训练闭环仍然是核心
4. 不把产品做成题解工具
```

---

## 16. MVP 验收标准

---

## 16.1 每日训练验收

```text
1. 孩子每天打开 /today 可以看到任务
2. 每个任务都有题目、知识点、目的
3. 每个任务能跳转到洛谷
4. 做完后能填写结果和错因
5. 系统能生成本题复盘
6. 系统能生成今日总结
7. 明天任务会根据今天表现调整
```

---

## 16.2 初始分析验收

```text
1. 能输入洛谷 UID
2. 能同步做题数据
3. 能同步提交记录
4. 能统计 AC / WA / TLE / RE
5. 能输出能力分
6. 能判断 A/B/C/D 档
7. 能输出短板
8. 能生成 30 天计划
```

---

## 16.3 自用验证验收

```text
1. 连续使用 7 天
2. 每天能完成至少 2 道题
3. 每道题有复盘
4. 每日任务能动态调整
5. 孩子愿意继续使用
6. 你能明显看出系统比手动安排训练更省事
7. 训练方向比单纯刷题更清楚
```

---

## 16.4 安全验收

```text
1. 不要求洛谷密码
2. 不保存 Cookie
3. 不自动提交代码
4. 不输出完整题解
5. 不输出完整代码
6. 对洛谷请求限流
```

---

## 17. 最终交付清单

第一版最终应该交付：

```text
页面：
1. /profile 孩子档案页
2. /report 初始分析页
3. /plan 30 天计划封面页
4. /today 今日训练页
5. /review/:taskId 做题复盘页
6. /stage-report 阶段复盘页

API：
1. POST /api/profile
2. POST /api/baseline/analyze
3. POST /api/plan/30-days
4. GET /api/today
5. POST /api/tasks/:taskId/start
6. POST /api/tasks/:taskId/review
7. POST /api/daily-summary
8. POST /api/stage-report
9. POST /api/final-report

核心模块：
1. LuoguService
2. BaselineService
3. PlanService
4. TodayService
5. ReviewService
6. StageReportService
7. FinalReportService
8. ScoringService
9. KnowledgeService
10. LLMService

数据：
1. PostgreSQL 表结构
2. CSP-S 知识点图谱
3. 洛谷标签映射规则
4. Prompt 模板
```

---

## 18. 最终产品定义

这个自用系统最终不是一个“报告工具”。

它应该变成：

```text
孩子每天打开就知道：
今天练什么
为什么练
做完怎么复盘
明天怎么调整
30 天后是否更接近 CSP-S 一等奖
```

核心闭环：

```text
诊断 → 训练 → 复盘 → 调整 → 再训练
```

---

## 19. 商业化判断条件

只有当以下条件满足后，才值得商业化：

```text
1. 自己孩子连续使用 30 天
2. 每日任务生成准确
3. 训练计划确实能持续执行
4. 复盘结果对训练调整有帮助
5. 你自己愿意继续依赖这个系统安排训练
6. 孩子的独立 AC 能力有改善
7. 系统生成的计划比人工随意刷题更有效
```

如果这些条件不成立，不要急着商业化。

如果这些条件成立，再开始做：

```text
1. 多学生
2. 家长报告
3. 训练营模板
4. 商业化订阅
5. 机构后台
```

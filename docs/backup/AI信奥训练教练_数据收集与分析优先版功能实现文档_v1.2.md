# AI 信奥训练教练 · 数据收集与分析优先版功能实现文档 v1.2

> 当前阶段：自用验证版，但数据模型预留“任意洛谷 UID 分析”能力  
> 当前最高优先级：先做好数据收集、数据清洗、数据质量评估、初始能力分析  
> 开发对象：给 Codex / 工程实现使用  
> 页面要求：页面只要能用，不追求好看  
> 核心目标：输入任意公开洛谷 UID，系统能基于公开做题数据分析其距离 CSP-S 提高组一等奖的差距，并给出训练方向

---

# 0. 本版核心结论

上一版文档已经定义了完整训练闭环：

```text
洛谷历史数据
→ 初始能力评估
→ 30 天训练计划
→ 今日任务
→ 做题复盘
→ 明日调整
```

但真正开发时，第一步必须先做好：

```text
数据收集
数据清洗
数据质量判断
特征提取
能力分析
```

如果这一步不准，后面的训练计划、每日任务、AI 复盘都会失真。

所以 v1.2 的开发重点调整为：

```text
先做“洛谷 UID 数据分析系统”
再做“30 天训练系统”
最后才做商业化。
```

---

# 1. 账号与数据边界

## 1.1 “任何一个人的账号”如何理解

系统支持分析：

```text
任意一个公开洛谷 UID
```

也就是说，只要输入洛谷 UID，系统就可以尝试基于公开数据分析：

```text
1. 做过哪些题
2. 通过哪些题
3. 最近提交记录
4. 题目难度分布
5. 题目标签分布
6. AC / WA / TLE / RE 等结果
7. 知识点覆盖
8. CSP-S 提高组一等奖差距
```

---

## 1.2 默认只分析公开数据

第一版只能使用：

```text
1. 洛谷公开页面
2. 洛谷公开提交记录
3. 洛谷公开题目信息
4. 用户手动补充的数据
5. 用户手动导入的数据
```

第一版禁止：

```text
1. 不要求输入洛谷密码
2. 不保存洛谷密码
3. 不保存洛谷 Cookie
4. 不绕过登录限制
5. 不自动提交代码
6. 不抓取非公开数据
7. 不做批量恶意爬取
```

---

## 1.3 任意 UID 分析模式

系统支持三种分析模式：

```text
SELF_CHILD:
自己的孩子，允许长期跟踪、每日训练、复盘。

PUBLIC_UID:
任意公开 UID，只做公开数据分析，不生成私人结论，不需要登录。

AUTHORIZED_UID:
账号本人授权后，可手动导入更多数据，例如模拟赛成绩、复盘记录。
```

第一版先实现：

```text
SELF_CHILD
PUBLIC_UID
```

AUTHORIZED_UID 作为后续扩展。

---

## 1.4 分析可信度说明

不同数据来源，分析可信度不同。

```text
只用公开洛谷数据：
可以判断做题覆盖、提交稳定性、知识点大概分布。
不能准确判断是否独立完成、是否看题解、真实思考过程。

加入手动复盘数据：
可以判断真实错因、独立完成能力、训练质量。

加入模拟赛数据：
可以判断 CSP-S 赛场能力、T1/T2/T3/T4 得分结构。
```

所以系统必须输出：

```text
analysis_confidence
```

用于说明当前分析可信度。

---

# 2. 第一阶段产品目标

第一阶段只做数据分析，不急着做完整训练系统。

## 2.1 输入

```text
洛谷 UID
目标：CSP-S 提高组一等奖
分析模式：SELF_CHILD / PUBLIC_UID
```

---

## 2.2 输出

必须输出：

```text
1. 数据同步报告
2. 数据质量报告
3. 做题历史统计
4. 提交记录统计
5. 题目难度分布
6. 知识点覆盖分析
7. 错误类型分析
8. CSP-S 一等奖差距分析
9. 初始训练方向
10. 后续是否适合生成 30 天训练计划
```

---

## 2.3 第一阶段不做

```text
1. 不做漂亮页面
2. 不做商业化
3. 不做多角色权限
4. 不做微信小程序
5. 不做支付
6. 不做老师后台
7. 不做自动登录
8. 不生成完整题解
9. 不生成完整代码
```

---

# 3. 系统整体数据链路

## 3.1 标准数据流程

```text
createSubject(uid)
    ↓
createSyncJob(subjectId)
    ↓
fetchLuoguProfile(uid)
    ↓
fetchLuoguRecordPages(uid)
    ↓
extractProblemPidsFromRecords()
    ↓
fetchProblemDetails(pids)
    ↓
saveRawSnapshots()
    ↓
parseRawData()
    ↓
normalizeData()
    ↓
upsertSubmissions()
    ↓
upsertProblems()
    ↓
mapProblemsToKnowledgeNodes()
    ↓
runDataQualityCheck()
    ↓
extractAnalysisFeatures()
    ↓
generateBaselineAnalysis()
```

---

## 3.2 关键原则

```text
1. 原始数据必须保存
2. 标准化数据必须可重复生成
3. 每次同步必须有 sync_job
4. 每次解析必须记录 parser_version
5. 每个分析报告必须绑定数据快照
6. 分析结论必须带 confidence
7. 训练建议不能直接依赖大模型胡说
```

---

# 4. 数据采集模块设计

## 4.1 模块划分

```text
LuoguClient
  负责 HTTP 请求

LuoguParser
  负责解析洛谷返回内容

LuoguNormalizer
  负责字段标准化

SyncJobService
  负责同步任务状态

RawSnapshotService
  负责保存原始响应

SubmissionService
  负责提交记录入库

ProblemService
  负责题目信息入库

KnowledgeMappingService
  负责题目标签到知识点映射

DataQualityService
  负责数据质量评分

FeatureExtractorService
  负责提取分析特征

BaselineAnalysisService
  负责生成初始能力分析
```

---

## 4.2 LuoguClient 要求

### 职责

```text
1. 发起 HTTP 请求
2. 设置 User-Agent
3. 设置 Referer
4. 超时控制
5. 重试控制
6. 限流控制
7. 返回原始响应
```

### 默认请求配置

```ts
const LUOGU_REQUEST_CONFIG = {
  timeoutMs: 10000,
  retryTimes: 3,
  retryBaseDelayMs: 1000,
  requestIntervalMs: 500,
  userAgent: "Mozilla/5.0",
  referer: "https://www.luogu.com.cn/"
};
```

### 不允许

```text
1. 不携带用户 Cookie
2. 不模拟登录
3. 不绕过验证码
4. 不高频请求
```

---

## 4.3 LuoguParser 要求

### 职责

```text
1. 从用户页面解析 profile
2. 从 record 页面解析 submissions
3. 从 problem 页面解析 problem detail
4. 如果解析失败，返回 parser_error
5. 不直接写数据库
```

### Parser 版本

所有解析器必须带版本号：

```ts
const PARSER_VERSION = "luogu-parser-v1.0.0";
```

raw_snapshots 中必须保存：

```text
parser_version
```

原因：

```text
洛谷页面结构可能变化。
如果解析器升级，需要知道旧数据由哪个版本解析。
```

---

## 4.4 LuoguNormalizer 要求

### 职责

把不同来源的数据统一成系统内部格式。

例如提交结果：

```text
Accepted → AC
Wrong Answer → WA
Time Limit Exceeded → TLE
Runtime Error → RE
Compile Error → CE
Unaccepted → UNKNOWN
```

### 标准结果枚举

```ts
export type NormalizedResult =
  | "AC"
  | "WA"
  | "TLE"
  | "MLE"
  | "RE"
  | "CE"
  | "PC"
  | "UKE"
  | "JUDGING"
  | "WAITING"
  | "UNKNOWN";
```

---

# 5. 数据源设计

## 5.1 数据源 A：洛谷用户信息

### URL

```http
GET https://www.luogu.com.cn/user/{uid}?_contentOnly=1
```

### 目标

获取：

```text
1. 用户名
2. UID
3. 公开练习概况
4. 公开通过题目
5. 用户基础统计
```

### 保存原始数据

必须保存到：

```text
raw_snapshots.source_type = USER_PROFILE
```

### 标准化输出

```ts
interface NormalizedLuoguProfile {
  luoguUid: string;
  username?: string;
  rating?: number | null;
  passedProblemPids: string[];
  fetchedAt: string;
  parserVersion: string;
}
```

---

## 5.2 数据源 B：洛谷提交记录

### URL

```http
GET https://www.luogu.com.cn/record/list?user={uid}&page={page}
```

### 同步策略

第一版默认：

```text
maxPages = 20
requestIntervalMs = 500
retryTimes = 3
stopWhenEmptyPageCount = 2
```

可配置：

```ts
interface RecordSyncOptions {
  maxPages: number;
  requestIntervalMs: number;
  retryTimes: number;
  stopWhenEmptyPageCount: number;
}
```

### 每页保存原始数据

```text
raw_snapshots.source_type = RECORD_LIST_PAGE
raw_snapshots.source_key = `${uid}:page:${page}`
```

### 标准化输出

```ts
interface NormalizedSubmission {
  luoguRecordId?: string;
  luoguUid: string;
  problemPid: string;
  problemTitle?: string;
  result: string;
  normalizedResult: NormalizedResult;
  score?: number;
  language?: string;
  submitTime?: string;
  source: "luogu";
}
```

---

## 5.3 数据源 C：洛谷题目信息

### URL

```http
GET https://www.luogu.com.cn/problem/{pid}?_contentOnly=1
```

### 获取触发条件

```text
1. 提交记录中出现的新题目
2. 用户已 AC 题目中出现的新题目
3. 训练任务推荐候选题
4. 手动补充题目
```

### 缓存策略

```text
1. 题目信息缓存 7 天
2. 7 天内不重复获取
3. 获取失败不影响同步任务继续
4. 获取失败进入 problem_fetch_failures
```

### 标准化输出

```ts
interface NormalizedProblem {
  luoguPid: string;
  title?: string;
  difficulty?: number;
  difficultyName?: string;
  tags: string[];
  source?: string;
  acceptedCount?: number;
  submittedCount?: number;
  fetchedAt: string;
}
```

---

## 5.4 数据源 D：手动复盘数据

洛谷公开数据无法判断：

```text
1. 是否独立完成
2. 是否看题解
3. 是否照着代码写
4. 是否本地写完后一次 AC
5. 真实卡点是什么
```

所以系统必须支持手动复盘。

### 做题复盘字段

```ts
interface ManualReviewInput {
  subjectId: number;
  problemPid: string;
  result: "AC" | "WA" | "TLE" | "RE" | "CE" | "UNSOLVED";
  timeSpentMinutes: number;
  solutionUsage: SolutionUsage;
  errorTypes: ErrorType[];
  selfNote?: string;
}
```

### solutionUsage 枚举

```ts
export type SolutionUsage =
  | "none"          // 没看题解，独立完成
  | "hint_only"     // 只看提示
  | "idea_only"     // 看了题解思路
  | "full_solution" // 看了完整题解
  | "copied_code"   // 照着代码写出来
  | "unknown";
```

### errorTypes 枚举

```ts
export type ErrorType =
  | "no_idea"
  | "wrong_model"
  | "wrong_algorithm"
  | "state_design"
  | "boundary_error"
  | "complexity_error"
  | "implementation"
  | "template_unfamiliar"
  | "reading_error"
  | "time_management"
  | "debugging_weak"
  | "unknown";
```

---

## 5.5 数据源 E：手动导入兜底

为了让系统不依赖洛谷页面结构，必须支持手动导入。

### CSV 格式

```csv
problem_pid,problem_title,result,score,language,submit_time,difficulty,tags,solution_usage,error_type,time_spent_minutes
P3371,单源最短路径,AC,100,C++17,2026-06-22T20:00:00+08:00,4,"图论;最短路",none,,35
```

### JSON 格式

```json
{
  "luoguUid": "123456",
  "records": [
    {
      "problemPid": "P3371",
      "problemTitle": "单源最短路径",
      "result": "AC",
      "score": 100,
      "language": "C++17",
      "submitTime": "2026-06-22T20:00:00+08:00",
      "difficulty": 4,
      "tags": ["图论", "最短路"],
      "solutionUsage": "none",
      "errorTypes": []
    }
  ]
}
```

---

# 6. 数据库设计：数据采集与分析优先版

## 6.1 analyzed_subjects

用于支持“任意 UID 分析”，不再只叫 children。

```sql
CREATE TABLE analyzed_subjects (
  id BIGSERIAL PRIMARY KEY,
  display_name VARCHAR(255),
  luogu_uid VARCHAR(64) NOT NULL,
  subject_type VARCHAR(64) DEFAULT 'PUBLIC_UID',
  target VARCHAR(64) DEFAULT 'CSP-S_FIRST_PRIZE',
  grade VARCHAR(64),
  daily_training_minutes INT DEFAULT 120,
  current_level VARCHAR(64),
  analysis_confidence NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(luogu_uid, subject_type)
);
```

### subject_type

```text
SELF_CHILD
PUBLIC_UID
AUTHORIZED_UID
```

---

## 6.2 sync_jobs

```sql
CREATE TABLE sync_jobs (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES analyzed_subjects(id),
  luogu_uid VARCHAR(64) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'PENDING',
  sync_type VARCHAR(64) DEFAULT 'baseline',
  max_record_pages INT DEFAULT 20,
  record_pages_fetched INT DEFAULT 0,
  raw_records_parsed INT DEFAULT 0,
  submissions_upserted INT DEFAULT 0,
  unique_problems_found INT DEFAULT 0,
  problems_fetched INT DEFAULT 0,
  problem_fetch_failed INT DEFAULT 0,
  error_json JSONB DEFAULT '[]',
  summary_json JSONB DEFAULT '{}',
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6.3 sync_job_steps

用于 Codex 调试每一步失败在哪里。

```sql
CREATE TABLE sync_job_steps (
  id BIGSERIAL PRIMARY KEY,
  sync_job_id BIGINT NOT NULL REFERENCES sync_jobs(id),
  step_name VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'PENDING',
  input_json JSONB DEFAULT '{}',
  output_json JSONB DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### step_name 枚举

```text
FETCH_PROFILE
FETCH_RECORD_PAGE
FETCH_PROBLEM_DETAIL
PARSE_PROFILE
PARSE_RECORDS
PARSE_PROBLEM
NORMALIZE_SUBMISSIONS
UPSERT_SUBMISSIONS
UPSERT_PROBLEMS
MAP_KNOWLEDGE
QUALITY_CHECK
FEATURE_EXTRACT
BASELINE_ANALYSIS
```

---

## 6.4 raw_snapshots

保存原始响应。

```sql
CREATE TABLE raw_snapshots (
  id BIGSERIAL PRIMARY KEY,
  sync_job_id BIGINT REFERENCES sync_jobs(id),
  subject_id BIGINT NOT NULL REFERENCES analyzed_subjects(id),
  source_type VARCHAR(64) NOT NULL,
  source_key VARCHAR(255),
  url TEXT,
  http_status INT,
  raw_content TEXT,
  raw_json JSONB,
  parser_version VARCHAR(64),
  fetched_at TIMESTAMP DEFAULT NOW()
);
```

### source_type

```text
USER_PROFILE
RECORD_LIST_PAGE
PROBLEM_DETAIL
MANUAL_IMPORT
```

---

## 6.5 luogu_profiles

```sql
CREATE TABLE luogu_profiles (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES analyzed_subjects(id),
  luogu_uid VARCHAR(64) NOT NULL,
  username VARCHAR(255),
  rating INT,
  passed_problem_pids JSONB DEFAULT '[]',
  raw_snapshot_id BIGINT REFERENCES raw_snapshots(id),
  fetched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(subject_id, luogu_uid)
);
```

---

## 6.6 problems

```sql
CREATE TABLE problems (
  id BIGSERIAL PRIMARY KEY,
  luogu_pid VARCHAR(64) UNIQUE NOT NULL,
  title TEXT,
  difficulty INT,
  difficulty_name VARCHAR(64),
  tags JSONB DEFAULT '[]',
  source TEXT,
  accepted_count INT,
  submitted_count INT,
  csp_weight NUMERIC(5,2) DEFAULT 0,
  fetch_status VARCHAR(64) DEFAULT 'unknown',
  last_fetched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6.7 submissions

```sql
CREATE TABLE submissions (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES analyzed_subjects(id),
  problem_id BIGINT REFERENCES problems(id),
  luogu_record_id VARCHAR(128),
  fallback_record_key VARCHAR(255),
  problem_pid VARCHAR(64),
  problem_title TEXT,
  result VARCHAR(64),
  normalized_result VARCHAR(32),
  score INT,
  language VARCHAR(64),
  submit_time TIMESTAMP,
  source VARCHAR(64) DEFAULT 'luogu',
  raw_snapshot_id BIGINT REFERENCES raw_snapshots(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(subject_id, luogu_record_id)
);
```

### fallback_record_key 生成规则

如果没有 luogu_record_id：

```ts
fallbackRecordKey = hash(
  subjectId + problemPid + normalizedResult + score + submitTime + language
);
```

---

## 6.8 problem_attempt_stats

每个 UID 在每道题上的尝试统计。

```sql
CREATE TABLE problem_attempt_stats (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES analyzed_subjects(id),
  problem_id BIGINT REFERENCES problems(id),
  problem_pid VARCHAR(64) NOT NULL,
  total_attempts INT DEFAULT 0,
  ac_attempts INT DEFAULT 0,
  wrong_attempts INT DEFAULT 0,
  first_submit_time TIMESTAMP,
  first_ac_time TIMESTAMP,
  last_submit_time TIMESTAMP,
  is_ac BOOLEAN DEFAULT FALSE,
  best_score INT,
  main_error_type VARCHAR(64),
  avg_score NUMERIC(6,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(subject_id, problem_pid)
);
```

---

## 6.9 manual_reviews

```sql
CREATE TABLE manual_reviews (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES analyzed_subjects(id),
  problem_id BIGINT REFERENCES problems(id),
  problem_pid VARCHAR(64) NOT NULL,
  result VARCHAR(64),
  time_spent_minutes INT,
  solution_usage VARCHAR(64) DEFAULT 'unknown',
  error_types JSONB DEFAULT '[]',
  self_note TEXT,
  reviewed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6.10 knowledge_nodes

```sql
CREATE TABLE knowledge_nodes (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  parent_code VARCHAR(255),
  level INT DEFAULT 1,
  csp_stage VARCHAR(64),
  csp_importance INT DEFAULT 3,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### csp_importance

```text
5 = CSP-S 核心必会
4 = 提高组重要
3 = 常见
2 = 辅助
1 = 进阶拓展
```

---

## 6.11 problem_knowledge_maps

```sql
CREATE TABLE problem_knowledge_maps (
  id BIGSERIAL PRIMARY KEY,
  problem_id BIGINT NOT NULL REFERENCES problems(id),
  knowledge_code VARCHAR(255) NOT NULL,
  weight NUMERIC(5,2) DEFAULT 1,
  source VARCHAR(64) DEFAULT 'tag_rule',
  confidence NUMERIC(5,2) DEFAULT 0.8,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(problem_id, knowledge_code)
);
```

---

## 6.12 subject_knowledge_stats

每个 UID 的知识点能力统计。

```sql
CREATE TABLE subject_knowledge_stats (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES analyzed_subjects(id),
  knowledge_code VARCHAR(255) NOT NULL,
  solved_problem_count INT DEFAULT 0,
  attempted_problem_count INT DEFAULT 0,
  ac_submission_count INT DEFAULT 0,
  total_submission_count INT DEFAULT 0,
  ac_rate NUMERIC(6,4),
  avg_attempts_to_ac NUMERIC(6,2),
  max_difficulty INT,
  avg_difficulty NUMERIC(6,2),
  recent_30d_attempts INT DEFAULT 0,
  score INT DEFAULT 0,
  weakness_level VARCHAR(64),
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(subject_id, knowledge_code)
);
```

---

## 6.13 data_quality_reports

```sql
CREATE TABLE data_quality_reports (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES analyzed_subjects(id),
  sync_job_id BIGINT REFERENCES sync_jobs(id),
  overall_score INT,
  record_depth_score INT,
  problem_detail_score INT,
  tag_coverage_score INT,
  freshness_score INT,
  manual_review_score INT,
  confidence_level VARCHAR(64),
  issue_json JSONB DEFAULT '[]',
  summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6.14 feature_snapshots

保存分析特征，保证报告可复现。

```sql
CREATE TABLE feature_snapshots (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES analyzed_subjects(id),
  sync_job_id BIGINT REFERENCES sync_jobs(id),
  feature_json JSONB NOT NULL,
  feature_version VARCHAR(64) DEFAULT 'feature-v1.0.0',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6.15 baseline_analysis_reports

```sql
CREATE TABLE baseline_analysis_reports (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES analyzed_subjects(id),
  sync_job_id BIGINT REFERENCES sync_jobs(id),
  feature_snapshot_id BIGINT REFERENCES feature_snapshots(id),
  data_quality_report_id BIGINT REFERENCES data_quality_reports(id),
  target VARCHAR(64) DEFAULT 'CSP-S_FIRST_PRIZE',
  total_score INT,
  level VARCHAR(64),
  analysis_confidence NUMERIC(5,2),
  ability_json JSONB,
  gap_json JSONB,
  weakness_json JSONB,
  recommendation_json JSONB,
  report_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 7. 同步任务状态机

## 7.1 sync_jobs.status

```text
PENDING
FETCHING_PROFILE
FETCHING_RECORDS
FETCHING_PROBLEMS
PARSING
NORMALIZING
MAPPING_KNOWLEDGE
QUALITY_CHECKING
FEATURE_EXTRACTING
ANALYZING
DONE
PARTIAL_DONE
FAILED
```

---

## 7.2 状态判断

### DONE

```text
1. 用户信息获取成功
2. 至少获取到 1 页提交记录
3. 至少解析到 1 条提交记录
4. 大部分题目信息获取成功
5. 成功生成特征快照
6. 成功生成初始分析
```

### PARTIAL_DONE

```text
1. 用户信息成功
2. 提交记录部分成功
3. 题目信息部分失败
4. 数据足够做初步分析
```

### FAILED

```text
1. 用户信息完全失败
2. 提交记录完全失败
3. 没有任何可分析数据
```

---

## 7.3 失败处理

每个失败必须记录：

```json
{
  "step": "FETCH_PROBLEM_DETAIL",
  "pid": "P3371",
  "url": "https://www.luogu.com.cn/problem/P3371?_contentOnly=1",
  "message": "timeout",
  "retryCount": 3,
  "time": "2026-06-22T20:00:00+08:00"
}
```

---

# 8. 数据质量评分

## 8.1 为什么需要数据质量评分

如果只同步到 30 条提交记录，就不能生成高可信报告。

系统必须告诉用户：

```text
当前分析可信度：高 / 中 / 低
```

---

## 8.2 数据质量总分

```text
DataQualityScore =
提交记录深度分 * 30%
+ 题目信息完整分 * 25%
+ 标签覆盖分 * 20%
+ 数据新鲜度分 * 15%
+ 手动复盘补充分 * 10%
```

---

## 8.3 提交记录深度分

```ts
function calcRecordDepthScore(totalSubmissions: number): number {
  if (totalSubmissions >= 1000) return 100;
  if (totalSubmissions >= 500) return 85;
  if (totalSubmissions >= 200) return 70;
  if (totalSubmissions >= 100) return 55;
  if (totalSubmissions >= 50) return 40;
  return 20;
}
```

---

## 8.4 题目信息完整分

```ts
function calcProblemDetailScore(totalProblems: number, fetchedProblems: number): number {
  if (totalProblems === 0) return 0;
  return Math.round((fetchedProblems / totalProblems) * 100);
}
```

---

## 8.5 标签覆盖分

```ts
function calcTagCoverageScore(problemsWithTags: number, totalProblems: number): number {
  if (totalProblems === 0) return 0;
  return Math.round((problemsWithTags / totalProblems) * 100);
}
```

---

## 8.6 数据新鲜度分

```ts
function calcFreshnessScore(lastSubmitTime: Date | null): number {
  if (!lastSubmitTime) return 0;

  const days = daysBetween(lastSubmitTime, new Date());

  if (days <= 7) return 100;
  if (days <= 14) return 85;
  if (days <= 30) return 70;
  if (days <= 60) return 50;
  if (days <= 90) return 35;
  return 20;
}
```

---

## 8.7 手动复盘补充分

```ts
function calcManualReviewScore(manualReviewCount: number): number {
  if (manualReviewCount >= 50) return 100;
  if (manualReviewCount >= 30) return 80;
  if (manualReviewCount >= 15) return 60;
  if (manualReviewCount >= 5) return 40;
  return 10;
}
```

---

## 8.8 confidence_level

```text
HIGH:
overall_score >= 80

MEDIUM:
overall_score >= 60

LOW:
overall_score < 60
```

---

# 9. 特征提取设计

## 9.1 FeatureSnapshot 结构

```ts
interface FeatureSnapshot {
  subjectId: number;
  target: "CSP-S_FIRST_PRIZE";

  dataSummary: DataSummary;
  activityFeatures: ActivityFeatures;
  difficultyFeatures: DifficultyFeatures;
  resultFeatures: ResultFeatures;
  attemptFeatures: AttemptFeatures;
  knowledgeFeatures: KnowledgeFeatures;
  cspReadinessFeatures: CspReadinessFeatures;
}
```

---

## 9.2 dataSummary

```ts
interface DataSummary {
  totalSubmissions: number;
  totalAttemptedProblems: number;
  totalSolvedProblems: number;
  totalProblemsWithDetail: number;
  firstSubmitTime?: string;
  lastSubmitTime?: string;
  dataQualityScore: number;
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
}
```

---

## 9.3 activityFeatures

训练连续性。

```ts
interface ActivityFeatures {
  activeDaysLast7: number;
  activeDaysLast30: number;
  activeDaysLast90: number;
  submissionsLast7: number;
  submissionsLast30: number;
  submissionsLast90: number;
  longestActiveStreak: number;
  currentActiveStreak: number;
}
```

---

## 9.4 difficultyFeatures

难度分布。

```ts
interface DifficultyFeatures {
  attemptedByDifficulty: Record<string, number>;
  solvedByDifficulty: Record<string, number>;
  acRateByDifficulty: Record<string, number>;
  maxSolvedDifficulty: number;
  avgSolvedDifficulty: number;
  top20SolvedDifficultyAvg: number;
}
```

### 洛谷难度映射建议

```text
0: 暂无评定
1: 入门
2: 普及-
3: 普及/提高-
4: 普及+/提高
5: 提高+/省选-
6: 省选/NOI-
7: NOI/NOI+/CTSC
```

---

## 9.5 resultFeatures

提交结果分布。

```ts
interface ResultFeatures {
  acCount: number;
  waCount: number;
  tleCount: number;
  mleCount: number;
  reCount: number;
  ceCount: number;
  pcCount: number;
  unknownCount: number;
  acRate: number;
  wrongRate: number;
  tleRate: number;
  reRate: number;
  ceRate: number;
}
```

---

## 9.6 attemptFeatures

每题尝试次数。

```ts
interface AttemptFeatures {
  avgAttemptsPerProblem: number;
  avgAttemptsToAc: number;
  oneShotAcCount: number;
  oneShotAcRate: number;
  hardStuckProblemCount: number;
  hardStuckProblems: string[];
}
```

hardStuck 定义：

```text
同一题提交次数 >= 5 且未 AC
或
同一题提交次数 >= 8 后才 AC
```

---

## 9.7 knowledgeFeatures

知识点覆盖。

```ts
interface KnowledgeFeatures {
  knowledgeStats: Array<{
    code: string;
    name: string;
    attemptedProblemCount: number;
    solvedProblemCount: number;
    acRate: number;
    maxDifficulty: number;
    avgDifficulty: number;
    score: number;
    weaknessLevel: "none" | "mild" | "medium" | "severe";
  }>;
}
```

---

## 9.8 cspReadinessFeatures

CSP-S 提高组一等能力结构。

```ts
interface CspReadinessFeatures {
  t1StabilityScore: number;
  t2SolvingScore: number;
  t3PartialScore: number;
  t4StrategyScore: number;
  implementationScore: number;
  timeManagementScore: number;
}
```

---

# 10. CSP-S 一等奖能力分析口径

## 10.1 总体能力分

```text
TotalScore =
知识点覆盖分 * 20%
+ 难度上限分 * 20%
+ 提交稳定性分 * 15%
+ 实现能力分 * 15%
+ 训练连续性分 * 10%
+ CSP-S 题型准备度 * 20%
```

---

## 10.2 知识点覆盖分

CSP-S 核心知识点：

```text
基础实现
二分
贪心
前缀和/差分
搜索
背包 DP
线性 DP
区间 DP
树形 DP
图论 DFS/BFS
最短路
最小生成树
拓扑排序
并查集
树状数组
线段树
数论基础
组合数学基础
```

计算：

```ts
knowledgeCoverageScore =
coveredCoreKnowledgeCount / totalCoreKnowledgeCount * 100
```

covered 定义：

```text
该知识点至少 AC 3 道题
或
至少 AC 1 道难度 >= 4 的题
```

---

## 10.3 难度上限分

```ts
function calcDifficultyCeilingScore(features: DifficultyFeatures): number {
  const top = features.top20SolvedDifficultyAvg;

  if (top >= 5.5) return 95;
  if (top >= 5.0) return 85;
  if (top >= 4.5) return 75;
  if (top >= 4.0) return 65;
  if (top >= 3.5) return 55;
  if (top >= 3.0) return 45;
  return 30;
}
```

解释：

```text
CSP-S 一等奖不能只停留在黄题/绿题。
需要具备稳定做绿题、尝试蓝题、部分突破紫题的能力。
```

---

## 10.4 提交稳定性分

```ts
function calcSubmissionStabilityScore(result: ResultFeatures): number {
  if (result.acRate >= 0.55) return 90;
  if (result.acRate >= 0.45) return 80;
  if (result.acRate >= 0.35) return 65;
  if (result.acRate >= 0.25) return 50;
  return 35;
}
```

注意：

```text
公开提交记录 AC 率不能直接代表能力。
因为有人会本地调好再提交，也有人会频繁提交调试。
所以这个分数只能作为参考。
```

---

## 10.5 实现能力分

综合：

```text
1. RE 比例
2. CE 比例
3. 平均提交次数
4. 一次 AC 率
```

```ts
function calcImplementationScore(result: ResultFeatures, attempt: AttemptFeatures): number {
  let score = 100;

  score -= result.reRate * 100 * 0.8;
  score -= result.ceRate * 100 * 0.6;

  if (attempt.avgAttemptsToAc > 5) score -= 25;
  else if (attempt.avgAttemptsToAc > 3) score -= 15;
  else if (attempt.avgAttemptsToAc > 2) score -= 8;

  if (attempt.oneShotAcRate > 0.4) score += 5;

  return clamp(Math.round(score), 0, 100);
}
```

---

## 10.6 训练连续性分

```ts
function calcTrainingConsistencyScore(activity: ActivityFeatures): number {
  const d30 = activity.activeDaysLast30;

  if (d30 >= 24) return 100;
  if (d30 >= 18) return 85;
  if (d30 >= 12) return 70;
  if (d30 >= 6) return 50;
  return 30;
}
```

---

## 10.7 CSP-S 题型准备度

```text
T1 稳定性：
黄题、绿题基础题 AC 稳定性。

T2 解题能力：
绿题、蓝题中档题覆盖。

T3 部分分能力：
蓝题、紫题尝试记录，综合题训练记录。

T4 策略能力：
高难题尝试、部分分、模拟赛记录。
```

### 近似计算

```ts
cspReadinessScore =
t1StabilityScore * 0.35
+ t2SolvingScore * 0.30
+ t3PartialScore * 0.25
+ t4StrategyScore * 0.10
```

### T1 稳定性

```text
看难度 3-4 题目的 AC 数、AC 率、一次 AC 率。
```

### T2 解题能力

```text
看难度 4-5 题目的 AC 数、知识点覆盖、平均尝试次数。
```

### T3 部分分能力

```text
看难度 5-6 题目的尝试数、部分分记录、是否有 AC。
```

### T4 策略能力

```text
第一版公开数据很难判断。
如果没有模拟赛数据，默认低置信度。
```

---

# 11. 知识点图谱与标签映射

## 11.1 一级知识点

```json
[
  { "code": "basic", "name": "基础能力", "cspImportance": 5 },
  { "code": "greedy", "name": "贪心", "cspImportance": 5 },
  { "code": "binary_search", "name": "二分", "cspImportance": 5 },
  { "code": "data_structure", "name": "数据结构", "cspImportance": 5 },
  { "code": "dp", "name": "动态规划", "cspImportance": 5 },
  { "code": "graph", "name": "图论", "cspImportance": 5 },
  { "code": "math", "name": "数学", "cspImportance": 4 },
  { "code": "search", "name": "搜索", "cspImportance": 4 },
  { "code": "string", "name": "字符串", "cspImportance": 3 }
]
```

---

## 11.2 二级知识点

```json
[
  { "parent": "basic", "code": "implementation", "name": "模拟与实现", "cspImportance": 5 },
  { "parent": "basic", "code": "prefix_sum", "name": "前缀和", "cspImportance": 5 },
  { "parent": "basic", "code": "difference", "name": "差分", "cspImportance": 4 },

  { "parent": "data_structure", "code": "stack_queue", "name": "栈与队列", "cspImportance": 4 },
  { "parent": "data_structure", "code": "monotonic_stack_queue", "name": "单调栈/单调队列", "cspImportance": 4 },
  { "parent": "data_structure", "code": "heap", "name": "堆/优先队列", "cspImportance": 4 },
  { "parent": "data_structure", "code": "dsu", "name": "并查集", "cspImportance": 5 },
  { "parent": "data_structure", "code": "fenwick", "name": "树状数组", "cspImportance": 4 },
  { "parent": "data_structure", "code": "segment_tree", "name": "线段树", "cspImportance": 5 },
  { "parent": "data_structure", "code": "lca", "name": "LCA", "cspImportance": 4 },

  { "parent": "dp", "code": "linear_dp", "name": "线性 DP", "cspImportance": 5 },
  { "parent": "dp", "code": "knapsack_dp", "name": "背包 DP", "cspImportance": 5 },
  { "parent": "dp", "code": "interval_dp", "name": "区间 DP", "cspImportance": 5 },
  { "parent": "dp", "code": "tree_dp", "name": "树形 DP", "cspImportance": 5 },
  { "parent": "dp", "code": "state_compression_dp", "name": "状压 DP", "cspImportance": 4 },
  { "parent": "dp", "code": "dp_optimization", "name": "DP 优化", "cspImportance": 4 },

  { "parent": "graph", "code": "bfs_dfs_graph", "name": "图上 DFS/BFS", "cspImportance": 5 },
  { "parent": "graph", "code": "shortest_path", "name": "最短路", "cspImportance": 5 },
  { "parent": "graph", "code": "mst", "name": "最小生成树", "cspImportance": 4 },
  { "parent": "graph", "code": "toposort", "name": "拓扑排序", "cspImportance": 4 },
  { "parent": "graph", "code": "scc", "name": "强连通分量", "cspImportance": 3 },
  { "parent": "graph", "code": "tarjan", "name": "Tarjan", "cspImportance": 3 },

  { "parent": "math", "code": "number_theory", "name": "数论", "cspImportance": 4 },
  { "parent": "math", "code": "combinatorics", "name": "组合数学", "cspImportance": 4 },

  { "parent": "search", "code": "dfs_bfs", "name": "DFS/BFS", "cspImportance": 5 },
  { "parent": "search", "code": "pruning", "name": "剪枝", "cspImportance": 4 },
  { "parent": "search", "code": "memorized_search", "name": "记忆化搜索", "cspImportance": 4 },

  { "parent": "string", "code": "kmp", "name": "KMP", "cspImportance": 3 },
  { "parent": "string", "code": "trie", "name": "Trie", "cspImportance": 3 },
  { "parent": "string", "code": "hash", "name": "字符串 Hash", "cspImportance": 3 }
]
```

---

## 11.3 标签映射规则

```ts
export const LUOGU_TAG_TO_KNOWLEDGE: Record<string, string[]> = {
  "模拟": ["implementation"],
  "贪心": ["greedy"],
  "二分": ["binary_search"],
  "前缀和": ["prefix_sum"],
  "差分": ["difference"],

  "动态规划": ["dp"],
  "dp": ["dp"],
  "背包": ["knapsack_dp"],
  "区间 dp": ["interval_dp"],
  "树形 dp": ["tree_dp"],
  "状压 dp": ["state_compression_dp"],
  "数位 dp": ["dp"],
  "单调队列优化": ["dp_optimization", "monotonic_stack_queue"],

  "图论": ["graph"],
  "最短路": ["shortest_path"],
  "dijkstra": ["shortest_path"],
  "spfa": ["shortest_path"],
  "floyd": ["shortest_path"],
  "最小生成树": ["mst"],
  "拓扑排序": ["toposort"],
  "强连通分量": ["scc"],
  "tarjan": ["tarjan"],

  "数据结构": ["data_structure"],
  "并查集": ["dsu"],
  "树状数组": ["fenwick"],
  "线段树": ["segment_tree"],
  "堆": ["heap"],
  "优先队列": ["heap"],
  "lca": ["lca"],

  "搜索": ["search"],
  "dfs": ["dfs_bfs"],
  "bfs": ["dfs_bfs"],
  "剪枝": ["pruning"],
  "记忆化搜索": ["memorized_search"],

  "数学": ["math"],
  "数论": ["number_theory"],
  "组合数学": ["combinatorics"],

  "字符串": ["string"],
  "kmp": ["kmp"],
  "trie": ["trie"],
  "hash": ["hash"]
};
```

---

# 12. 弱项识别规则

## 12.1 知识点弱项

```ts
function getKnowledgeWeakness(stat: KnowledgeStat): WeaknessLevel {
  if (stat.solvedProblemCount === 0) return "severe";
  if (stat.score < 40) return "severe";
  if (stat.score < 60) return "medium";
  if (stat.score < 75) return "mild";
  return "none";
}
```

---

## 12.2 DP 弱项判断

```text
如果以下任意成立，判定 DP 弱：

1. dp 总分 < 65
2. 背包 DP AC 题数 < 3
3. 区间 DP AC 题数 < 2
4. 树形 DP AC 题数 < 2
5. DP 难度上限 < 4
```

---

## 12.3 图论弱项判断

```text
如果以下任意成立，判定图论弱：

1. graph 总分 < 65
2. 最短路 AC 题数 < 3
3. 拓扑排序没有覆盖
4. 最小生成树没有覆盖
5. 图论难度上限 < 4
```

---

## 12.4 数据结构弱项判断

```text
如果以下任意成立，判定数据结构弱：

1. data_structure 总分 < 65
2. 并查集未覆盖
3. 树状数组未覆盖
4. 线段树未覆盖
5. 相关题平均提交次数过高
```

---

## 12.5 复杂度弱项判断

```text
如果 TLE 比例 >= 20%，判定复杂度控制弱。
如果 TLE 集中在图论/DP/数据结构，输出对应模块原因。
```

---

## 12.6 实现弱项判断

```text
如果 RE + CE 比例 >= 10%，判定实现稳定性不足。
如果平均提交次数 > 4，判定调试能力不足。
```

---

# 13. 初始分析报告结构

BaselineAnalysisReport 必须包含：

```json
{
  "subjectId": 1,
  "target": "CSP-S_FIRST_PRIZE",
  "dataQuality": {
    "score": 78,
    "confidenceLevel": "MEDIUM",
    "issues": []
  },
  "totalScore": 72,
  "level": "B",
  "abilityScores": {
    "knowledgeCoverage": 68,
    "difficultyCeiling": 70,
    "submissionStability": 62,
    "implementation": 75,
    "trainingConsistency": 60,
    "cspReadiness": 70
  },
  "cspReadiness": {
    "t1Stability": 82,
    "t2Solving": 68,
    "t3Partial": 45,
    "t4Strategy": 25
  },
  "weaknesses": [
    {
      "module": "graph",
      "name": "图论综合能力不足",
      "severity": "medium",
      "evidence": [
        "最短路覆盖不足",
        "拓扑排序未覆盖",
        "图论难度上限偏低"
      ],
      "impact": "影响 CSP-S T2/T3 解题能力",
      "trainingDirection": "先补最短路、拓扑、MST，再做图论综合题"
    }
  ],
  "recommendations": {
    "shouldGenerate30DayPlan": true,
    "firstStageFocus": ["graph", "dp", "implementation"],
    "warning": "当前分析主要基于公开提交记录，独立完成能力需要通过手动复盘补充判断。"
  }
}
```

---

# 14. 大模型使用边界

## 14.1 大模型不能做的事

```text
1. 不能负责原始评分
2. 不能凭空判断能力
3. 不能编造提交数据
4. 不能编造题目记录
5. 不能输出完整题解
6. 不能输出完整代码
```

---

## 14.2 大模型能做的事

```text
1. 把结构化分析结果转成自然语言
2. 帮助解释短板
3. 生成训练建议表述
4. 生成复盘反馈
5. 生成每日总结
```

---

## 14.3 初始分析 Prompt

```text
你是专业 CSP-S 竞赛训练教练。

系统已经完成结构化数据分析，请你只基于输入数据生成训练诊断说明。

禁止：
1. 不要编造数据
2. 不要承诺一定拿一等奖
3. 不要输出完整题解
4. 不要输出代码
5. 不要建议作弊

输入：
数据质量：
{{dataQuality}}

能力分：
{{abilityScores}}

CSP-S 准备度：
{{cspReadiness}}

知识点统计：
{{knowledgeStats}}

弱项列表：
{{weaknesses}}

请输出：

# CSP-S 初始诊断

## 1. 当前水平判断

## 2. 距离提高组一等奖的主要差距

## 3. 最优先补强的 3 个模块

## 4. 第一阶段训练建议

## 5. 数据可信度说明
```

---

# 15. API 设计：数据优先版

## 15.1 创建分析对象

```http
POST /api/subjects
```

### Request

```json
{
  "luoguUid": "123456",
  "displayName": "孩子",
  "subjectType": "SELF_CHILD",
  "target": "CSP-S_FIRST_PRIZE"
}
```

### Response

```json
{
  "subjectId": 1,
  "luoguUid": "123456",
  "subjectType": "SELF_CHILD"
}
```

---

## 15.2 启动同步任务

```http
POST /api/sync/start
```

### Request

```json
{
  "subjectId": 1,
  "maxRecordPages": 20,
  "syncType": "baseline"
}
```

### Response

```json
{
  "syncJobId": 1001,
  "status": "PENDING"
}
```

---

## 15.3 查询同步状态

```http
GET /api/sync/:syncJobId
```

### Response

```json
{
  "syncJobId": 1001,
  "status": "FETCHING_RECORDS",
  "progress": {
    "recordPagesFetched": 8,
    "submissionsUpserted": 136,
    "problemsFetched": 40
  },
  "errors": []
}
```

---

## 15.4 查询数据质量报告

```http
GET /api/data-quality/:subjectId
```

### Response

```json
{
  "overallScore": 78,
  "confidenceLevel": "MEDIUM",
  "recordDepthScore": 70,
  "problemDetailScore": 85,
  "tagCoverageScore": 80,
  "freshnessScore": 70,
  "manualReviewScore": 10,
  "issues": [
    "手动复盘数据较少，无法准确判断独立完成能力。"
  ]
}
```

---

## 15.5 生成初始分析

```http
POST /api/analysis/baseline
```

### Request

```json
{
  "subjectId": 1,
  "syncJobId": 1001,
  "target": "CSP-S_FIRST_PRIZE"
}
```

### Response

```json
{
  "analysisReportId": 2001,
  "totalScore": 72,
  "level": "B",
  "analysisConfidence": 0.72
}
```

---

## 15.6 查询初始分析

```http
GET /api/analysis/baseline/:analysisReportId
```

---

## 15.7 手动导入数据

```http
POST /api/import/submissions
```

---

## 15.8 提交手动复盘

```http
POST /api/manual-reviews
```

---

# 16. 最小页面设计

页面只需要能用，不需要美观。

## 16.1 /analyze

功能：

```text
1. 输入洛谷 UID
2. 选择 subjectType
3. 点击创建分析对象
4. 点击开始同步
```

---

## 16.2 /sync/:syncJobId

功能：

```text
1. 显示同步状态
2. 显示抓取页数
3. 显示提交记录数
4. 显示题目信息获取数
5. 显示错误列表
```

---

## 16.3 /data-quality/:subjectId

功能：

```text
1. 显示数据质量总分
2. 显示分析可信度
3. 显示缺失问题
4. 提示是否需要手动导入/复盘
```

---

## 16.4 /baseline/:analysisReportId

功能：

```text
1. 显示总分
2. 显示 A/B/C/D 档
3. 显示知识点弱项
4. 显示 CSP-S 一等奖差距
5. 显示是否适合生成 30 天计划
```

---

# 17. Codex 开发优先级

## 17.1 第 1 优先级：数据库和数据模型

必须先完成：

```text
1. analyzed_subjects
2. sync_jobs
3. sync_job_steps
4. raw_snapshots
5. luogu_profiles
6. problems
7. submissions
8. problem_attempt_stats
9. knowledge_nodes
10. problem_knowledge_maps
11. subject_knowledge_stats
12. data_quality_reports
13. feature_snapshots
14. baseline_analysis_reports
```

---

## 17.2 第 2 优先级：洛谷数据同步

实现：

```text
1. LuoguClient
2. LuoguParser
3. LuoguNormalizer
4. SyncJobService
5. RawSnapshotService
```

验收：

```text
输入任意公开 UID，能生成 sync_job，并保存 raw_snapshots 和 submissions。
```

---

## 17.3 第 3 优先级：数据质量报告

实现：

```text
1. DataQualityService
2. data_quality_reports 写入
3. /api/data-quality/:subjectId
```

验收：

```text
能判断当前数据是否足够生成可信分析。
```

---

## 17.4 第 4 优先级：特征提取

实现：

```text
1. FeatureExtractorService
2. feature_snapshots 写入
3. difficultyFeatures
4. resultFeatures
5. attemptFeatures
6. knowledgeFeatures
7. cspReadinessFeatures
```

---

## 17.5 第 5 优先级：初始能力分析

实现：

```text
1. BaselineAnalysisService
2. WeaknessDetectionService
3. CspReadinessService
4. baseline_analysis_reports 写入
```

---

## 17.6 第 6 优先级：最低限度页面

实现：

```text
1. /analyze
2. /sync/:syncJobId
3. /data-quality/:subjectId
4. /baseline/:analysisReportId
```

---

# 18. 验收标准

## 18.1 任意 UID 分析验收

```text
1. 输入任意公开洛谷 UID
2. 系统不要求密码
3. 系统不要求 Cookie
4. 系统能创建 analyzed_subject
5. 系统能创建 sync_job
6. 系统能同步公开提交记录
7. 系统能保存原始响应
8. 系统能解析题目 ID
9. 系统能获取题目信息
10. 系统能生成数据质量报告
11. 系统能生成初始能力分析
```

---

## 18.2 数据准确性验收

```text
1. 同一提交记录不会重复入库
2. 同一题目不会重复入库
3. 同一 UID 可以多次同步
4. 增量同步不会清空历史数据
5. 解析失败不会导致整个任务崩溃
6. 题目获取失败不影响已有数据分析
7. 分析报告绑定 feature_snapshot
```

---

## 18.3 分析合理性验收

```text
1. 数据少时，confidence 必须低
2. 没有手动复盘时，不能断言独立完成能力
3. 没有模拟赛数据时，不能断言 T4 策略能力强
4. 知识点未覆盖时，必须能识别为短板
5. TLE 高时，必须提示复杂度问题
6. RE/CE 高时，必须提示实现稳定性问题
7. 蓝题/紫题少时，必须提示 CSP-S 一等上限不足
```

---

## 18.4 安全验收

```text
1. 不保存密码
2. 不保存 Cookie
3. 不自动提交代码
4. 不生成完整题解
5. 不生成完整代码
6. 有请求限流
7. 有失败重试
8. 有手动导入兜底
```

---

# 19. 第一阶段最终交付物

第一阶段完成后，系统必须具备：

```text
1. 输入任意公开洛谷 UID
2. 采集公开数据
3. 保存原始数据
4. 标准化提交记录
5. 获取题目信息
6. 映射知识点
7. 生成数据质量报告
8. 提取分析特征
9. 生成 CSP-S 一等奖差距分析
10. 输出训练方向
```

这才是后续 30 天训练计划的基础。

---

# 20. 第二阶段再做训练计划

只有当第一阶段稳定后，再做：

```text
1. 30 天训练计划
2. 每日任务
3. 做题复盘
4. 明日调整
5. 阶段复盘
6. 最终评估
```

训练计划必须基于：

```text
baseline_analysis_reports
feature_snapshots
subject_knowledge_stats
manual_reviews
```

不能只靠大模型直接生成。

---

# 21. Codex 实现提示

给 Codex 的开发指令：

```text
优先实现数据层，不要先做 UI 美化。

请按以下顺序开发：

1. 建表
2. Seed knowledge_nodes
3. 实现 LuoguClient
4. 实现 raw_snapshots
5. 实现 sync_jobs
6. 实现 submissions 入库
7. 实现 problems 入库
8. 实现 tag -> knowledge 映射
9. 实现 data_quality_reports
10. 实现 feature_snapshots
11. 实现 baseline_analysis_reports
12. 最后做最简单页面
```

不要优先做：

```text
1. 花哨 UI
2. 登录系统
3. 支付
4. 家长端
5. 机构端
6. 社区功能
```

---

# 22. 关键判断

这个系统能不能有效，取决于第一步：

```text
数据是否收集完整
数据是否清洗准确
分析口径是否稳定
弱项识别是否靠谱
```

不是取决于页面好不好看。

所以 v1.2 的核心验收标准只有一句：

```text
输入任意公开洛谷 UID，系统能生成一份可信的 CSP-S 一等奖差距分析报告。
```

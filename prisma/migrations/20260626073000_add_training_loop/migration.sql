-- Target-score training loop MVP.
-- Adds goal roadmap, daily 3-problem plans, per-task feedback, mastery updates, and weekly score reports.

CREATE TABLE "training_goals" (
  "id" BIGSERIAL NOT NULL,
  "subjectId" BIGINT NOT NULL,
  "currentScore" INTEGER NOT NULL,
  "targetScore" INTEGER NOT NULL,
  "examDate" TIMESTAMP(3),
  "weeklyHours" INTEGER NOT NULL DEFAULT 14,
  "dailyProblemNum" INTEGER NOT NULL DEFAULT 3,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "training_goals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "training_stages" (
  "id" BIGSERIAL NOT NULL,
  "goalId" BIGINT NOT NULL,
  "stageIndex" INTEGER NOT NULL,
  "fromScore" INTEGER NOT NULL,
  "toScore" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "focusJson" JSONB NOT NULL DEFAULT '{}',
  "exitCriteriaJson" JSONB NOT NULL DEFAULT '{}',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "training_stages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "daily_training_plans" (
  "id" BIGSERIAL NOT NULL,
  "goalId" BIGINT NOT NULL,
  "subjectId" BIGINT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "stageScore" INTEGER NOT NULL,
  "focus" TEXT NOT NULL,
  "reasonJson" JSONB NOT NULL DEFAULT '{}',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "daily_training_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "daily_training_tasks" (
  "id" BIGSERIAL NOT NULL,
  "dailyPlanId" BIGINT NOT NULL,
  "subjectId" BIGINT NOT NULL,
  "problemId" BIGINT,
  "problemPid" TEXT NOT NULL,
  "problemTitle" TEXT,
  "taskOrder" INTEGER NOT NULL,
  "taskType" TEXT NOT NULL,
  "targetModule" TEXT NOT NULL,
  "targetScoreRole" TEXT NOT NULL,
  "difficultyLevel" INTEGER,
  "estimatedMinutes" INTEGER NOT NULL,
  "explanationJson" JSONB NOT NULL DEFAULT '{}',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "daily_training_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "training_task_attempts" (
  "id" BIGSERIAL NOT NULL,
  "taskId" BIGINT NOT NULL,
  "subjectId" BIGINT NOT NULL,
  "result" TEXT NOT NULL,
  "score" INTEGER,
  "timeMinutes" INTEGER NOT NULL,
  "submissionCount" INTEGER NOT NULL DEFAULT 1,
  "hintLevelUsed" INTEGER NOT NULL DEFAULT 0,
  "hasSeenSolution" BOOLEAN NOT NULL DEFAULT false,
  "errorTypes" JSONB NOT NULL DEFAULT '[]',
  "selfNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "training_task_attempts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "training_mastery" (
  "id" BIGSERIAL NOT NULL,
  "subjectId" BIGINT NOT NULL,
  "knowledgeCode" TEXT NOT NULL,
  "masteryScore" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
  "independentAcCount" INTEGER NOT NULL DEFAULT 0,
  "hintAcCount" INTEGER NOT NULL DEFAULT 0,
  "partialCount" INTEGER NOT NULL DEFAULT 0,
  "failedCount" INTEGER NOT NULL DEFAULT 0,
  "avgTimeMinutes" INTEGER,
  "lastPracticedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "training_mastery_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "weekly_training_reports" (
  "id" BIGSERIAL NOT NULL,
  "goalId" BIGINT NOT NULL,
  "subjectId" BIGINT NOT NULL,
  "weekStart" TIMESTAMP(3) NOT NULL,
  "weekEnd" TIMESTAMP(3) NOT NULL,
  "scoreBefore" INTEGER NOT NULL,
  "scoreAfter" INTEGER NOT NULL,
  "scoreDelta" INTEGER NOT NULL,
  "masteryJson" JSONB NOT NULL DEFAULT '{}',
  "weaknessJson" JSONB NOT NULL DEFAULT '{}',
  "curveJson" JSONB NOT NULL DEFAULT '{}',
  "nextPlanJson" JSONB NOT NULL DEFAULT '{}',
  "reportText" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "weekly_training_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "training_goals_subjectId_idx" ON "training_goals"("subjectId");
CREATE UNIQUE INDEX "training_stages_goalId_stageIndex_key" ON "training_stages"("goalId", "stageIndex");
CREATE INDEX "training_stages_goalId_idx" ON "training_stages"("goalId");
CREATE UNIQUE INDEX "daily_training_plans_goalId_date_key" ON "daily_training_plans"("goalId", "date");
CREATE INDEX "daily_training_plans_subjectId_idx" ON "daily_training_plans"("subjectId");
CREATE UNIQUE INDEX "daily_training_tasks_dailyPlanId_taskOrder_key" ON "daily_training_tasks"("dailyPlanId", "taskOrder");
CREATE INDEX "daily_training_tasks_subjectId_idx" ON "daily_training_tasks"("subjectId");
CREATE INDEX "daily_training_tasks_problemPid_idx" ON "daily_training_tasks"("problemPid");
CREATE INDEX "training_task_attempts_taskId_idx" ON "training_task_attempts"("taskId");
CREATE INDEX "training_task_attempts_subjectId_idx" ON "training_task_attempts"("subjectId");
CREATE UNIQUE INDEX "training_mastery_subjectId_knowledgeCode_key" ON "training_mastery"("subjectId", "knowledgeCode");
CREATE INDEX "training_mastery_subjectId_idx" ON "training_mastery"("subjectId");
CREATE UNIQUE INDEX "weekly_training_reports_goalId_weekStart_key" ON "weekly_training_reports"("goalId", "weekStart");
CREATE INDEX "weekly_training_reports_subjectId_idx" ON "weekly_training_reports"("subjectId");

ALTER TABLE "training_goals" ADD CONSTRAINT "training_goals_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "analyzed_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "training_stages" ADD CONSTRAINT "training_stages_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "training_goals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "daily_training_plans" ADD CONSTRAINT "daily_training_plans_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "training_goals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "daily_training_plans" ADD CONSTRAINT "daily_training_plans_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "analyzed_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "daily_training_tasks" ADD CONSTRAINT "daily_training_tasks_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "daily_training_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "daily_training_tasks" ADD CONSTRAINT "daily_training_tasks_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "analyzed_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "daily_training_tasks" ADD CONSTRAINT "daily_training_tasks_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "training_task_attempts" ADD CONSTRAINT "training_task_attempts_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "daily_training_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "training_task_attempts" ADD CONSTRAINT "training_task_attempts_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "analyzed_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "training_mastery" ADD CONSTRAINT "training_mastery_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "analyzed_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "weekly_training_reports" ADD CONSTRAINT "weekly_training_reports_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "training_goals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "weekly_training_reports" ADD CONSTRAINT "weekly_training_reports_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "analyzed_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

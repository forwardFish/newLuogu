# AI 教练系统 5 次修正记录

## REV-1：把 weakness 从报告结论改成可验证假设

触发原因：第一轮训练显示多个 top weaknesses 在 SELECT/MUTATE 中复发，说明需要显式记录 hit/miss。

修改内容：

- 新增 `weakness_hypotheses.json`，保存 confidence、hitCount、missCount、lastValidatedAt。
- 每个 weakness 自动绑定 SELECT/MUTATE/GENERATE 三类验证任务。
- 训练任务的目的从刷题改为验证某个训练阶段是否复发。

预期效果：系统能判断诊断是否命中，而不是只输出静态报告。

## REV-2：把训练记录拆成 7 个可观察阶段

触发原因：第二轮模拟赛总分 241，但部分分和区间 DP 仍在迁移题中复发。

修改内容：

- 新增 simulated_training_attempts 的 reading/modeling/partialScorePlanning/algorithmDesign/implementation/debugging/review 七阶段记录。
- 把“做错了”细化成具体阶段失败，支持后续精确修正。
- 下一轮任务混合提高 MUTATE 和 GENERATE 比例，减少只做熟悉原题。

预期效果：系统能区分不会算法、不会建模、不会拆分、会想但写不稳、调试太慢。

## REV-3：用模拟赛验证是否接近目标，并回写下一轮决策

触发原因：第三轮模拟赛一等奖接近度 0.67，仍有 math_model_error_5, partial_score_partial_score_missed_19, interval_dp_state_error_4 阻塞。

修改内容：

- 新增 mock_exam_validation.json，记录 T1/T2/T3/T4 和 total。
- 用模拟赛结果调整 taskMix：接近目标时提高模拟赛比例，否则继续补主弱点。
- 报告明确区分“接近目标”和“稳定达标”，避免训练任务完成后误判为一等奖稳了。

预期效果：系统能用考试表现校验训练是否有效，而不是只看任务完成数量。

## REV-4：增加精度校准：区分未测试、命中、未命中

触发原因：第 4 轮模拟赛总分 288，一等奖接近度 0.77，需要避免把模拟改善误判成真实达标。

修改内容：

- 未被本轮任务覆盖的 weakness 标记为 NOT_TESTED，不再自动降权。
- 模拟赛分数曲线改成按进度增长，避免轮数增加导致分数虚高。
- 增加精度边界说明：真实证据和模拟推断必须分开看。

预期效果：降低系统自我修正中的误伤，避免没有测试过的弱点被错误降权。

## REV-5：增加真实落地校验：把模拟结果转成真实训练要求

触发原因：第 5 轮模拟赛总分 312，一等奖接近度 0.87，需要避免把模拟改善误判成真实达标。

修改内容：

- 输出 5 轮精度报告，明确哪些结论仍需要真实训练日志验证。
- 最终结论限定为接近目标区间，不宣称稳定一等奖。
- 下一步强制要求真实模拟赛和真实 daily feedback 替换模拟数据。

预期效果：让系统从可复现实验进入真实训练闭环，减少模拟乐观偏差。

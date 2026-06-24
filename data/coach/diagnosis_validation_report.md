# 诊断验证报告

生成时间：2026-06-24T16:14:00.817Z

本报告回答：系统预测的 weakness 是否在训练中真实复发。

| weaknessId | 测试题数 | 命中 | 未命中 | 命中率 | 观察到的失败阶段 | 决策 |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| partial_score_partial_score_missed_19 | 11 | 7 | 4 | 0.64 | partialScorePlanning, algorithmDesign | 诊断部分命中：继续观察，任务从同类题切换到变式题。 |
| math_model_error_5 | 8 | 5 | 3 | 0.63 | partialScorePlanning, algorithmDesign | 诊断部分命中：继续观察，任务从同类题切换到变式题。 |
| math_partial_score_missed_18 | 8 | 2 | 6 | 0.25 | partialScorePlanning, algorithmDesign | 诊断未命中：降低优先级或重新分类，避免浪费训练天数。 |
| interval_dp_state_error_4 | 3 | 0 | 3 | 0 | - | 诊断未命中：降低优先级或重新分类，避免浪费训练天数。 |
| dp_state_error_15 | 0 | 0 | 0 | 0 | - | 尚未测试：不能判断诊断是否命中。 |
| greedy_partial_score_missed_1 | 0 | 0 | 0 | 0 | - | 尚未测试：不能判断诊断是否命中。 |
| partial_score_model_error_20 | 0 | 0 | 0 | 0 | - | 尚未测试：不能判断诊断是否命中。 |
| graph_model_error_37 | 0 | 0 | 0 | 0 | - | 尚未测试：不能判断诊断是否命中。 |
| math_model_error_40 | 0 | 0 | 0 | 0 | - | 尚未测试：不能判断诊断是否命中。 |
| implementation_implementation_risk_38 | 0 | 0 | 0 | 0 | - | 尚未测试：不能判断诊断是否命中。 |

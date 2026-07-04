import AppShell from "@/components/AppShell";
import { readLocalJson } from "@/src/server/local-loop/local-loop-files";
import SettingsMockCalibrationClient from "./SettingsMockCalibrationClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const tuning = await readLocalJson("data/local-loop/tuning_report.json", null);
  const mockExamResult = await readLocalJson("data/local-loop/mock_exam_result.json", null);
  const calibration = await readLocalJson("data/local-loop/mock_calibration.json", null);
  const calibratedStudent = await readLocalJson("data/local-loop/calibrated_student_analysis_report.json", null);
  const calibrationStatus = mockExamResult ? statusOf(calibration) : "NO_MOCK_EXAM_RESULT";
  const calibratedStatus = calibrationStatus === "OK" ? pathStatusOf(calibratedStudent, "calibration.status") : "SKIPPED";

  return (
    <AppShell activeHref="/settings">
      <div className="content-page">
        <h1 style={{ fontSize: 40, margin: 0, fontWeight: 950 }}>设置</h1>
        <p style={{ color: "#53608d", fontSize: 17, marginTop: 10 }}>
          账号、训练偏好、模拟赛校准和家长报告设置。
        </p>
        <div className="detail-grid" style={{ gridTemplateColumns: "1fr 360px", marginTop: 24 }}>
          <SettingsMockCalibrationClient />
          <div className="card" style={{ padding: 24 }}>
            <h2 className="section-title">当前闭环状态</h2>
            <p style={{ lineHeight: 2, color: "#36426d" }}>
              tuning：{statusOf(tuning)}
              <br />
              mock result：{mockExamResult ? "FOUND" : "MISSING"}
              <br />
              mock calibration：{calibrationStatus}
              <br />
              calibrated report：{calibratedStatus}
              <br />
              提交模拟赛四题分数后，系统会重新校准学生分析并刷新今日训练。
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function statusOf(value: unknown) {
  return value && typeof value === "object" && "status" in value ? String((value as { status?: unknown }).status ?? "UNKNOWN") : "UNKNOWN";
}

function pathStatusOf(value: unknown, key: string) {
  const found = key.split(".").reduce<unknown>((current, part) => {
    return current && typeof current === "object" ? (current as Record<string, unknown>)[part] : undefined;
  }, value);
  return typeof found === "string" ? found : "UNKNOWN";
}

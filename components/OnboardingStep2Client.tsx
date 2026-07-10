"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

type Props = {
  weakness: string;
  taskCount: number;
  dataQuality: string;
};

export default function OnboardingStep2Client({ weakness, taskCount, dataQuality }: Props) {
  const router = useRouter();
  const [years, setYears] = useState("2 年左右");
  const [language, setLanguage] = useState("C++");
  const [cspJTimes, setCspJTimes] = useState("1 次");
  const [cspSTimes, setCspSTimes] = useState("0 次");
  const [learned, setLearned] = useState<string[]>(["基础语法", "搜索", "贪心", "动态规划"]);
  const [note, setNote] = useState("");

  function toggleLearned(value: string) {
    setLearned((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem(
      "newLuogu:onboarding:step2",
      JSON.stringify({ years, language, cspJTimes, cspSTimes, learned, note })
    );
    router.push("/onboarding/step-3");
  }

  return (
    <form className="onboard-card compact card-large" onSubmit={submit}>
      <h1>再补充一下过往训练情况</h1>
      <p className="lead">这些信息能帮助系统更准确判断起点，减少误判。</p>
      <ChoiceGroup title="1. 学编程多久了" options={["半年内", "1 年左右", "2 年左右", "3 年以上"]} value={years} onChange={setYears} columns="four" />
      <ChoiceGroup title="2. 常用语言" options={["C++", "Python", "其他 / 不确定"]} value={language} onChange={setLanguage} columns="three" />
      <div className="form-section">
        <div className="form-title">3. 参加过几次考试</div>
        <ExamTimes label="CSP-J" value={cspJTimes} onChange={setCspJTimes} />
        <ExamTimes label="CSP-S" value={cspSTimes} onChange={setCspSTimes} />
      </div>
      <div className="form-section">
        <div className="form-title">4. 已学过哪些内容</div>
        <div className="choice-grid five">
          {["基础语法", "搜索", "排序 / 二分", "贪心", "动态规划", "图论", "数据结构", "数学", "不确定"].map((item) => (
            <button className={cn("choice", learned.includes(item) && "selected")} key={item} type="button" onClick={() => toggleLearned(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="form-section">
        <div className="form-title">
          5. 补充说明 <span style={{ color: "#687295", fontWeight: 700 }}>（可选）</span>
        </div>
        <textarea className="textarea-box field-control textarea-control" name="note" placeholder="例如：学校上过基础算法课，最近开始做 DP 题" value={note} onChange={(event) => setNote(event.target.value)} />
      </div>
      <div className="onboard-actions">
        <button className="btn-outline" type="button" onClick={() => router.push("/onboarding")}>
          上一步
        </button>
        <button className="btn-primary" type="submit">
          下一步
        </button>
      </div>
      <div className="onboard-foot">无需一次填完，系统会自动保存。</div>
    </form>
  );
}

function ChoiceGroup({
  title,
  options,
  value,
  onChange,
  columns
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  columns: string;
}) {
  return (
    <div className="form-section">
      <div className="form-title">{title}</div>
      <div className={`choice-grid ${columns}`}>
        {options.map((option) => (
          <button className={cn("choice", value === option && "selected")} key={option} type="button" onClick={() => onChange(option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function ExamTimes({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 18, alignItems: "center", marginBottom: 14 }}>
      <b style={{ color: "#4f5a84", fontSize: 18 }}>{label}</b>
      <div className="choice-grid four">
        {["0 次", "1 次", "2 次", "3 次及以上"].map((option) => (
          <button className={cn("choice", value === option && "selected")} key={option} type="button" onClick={() => onChange(option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

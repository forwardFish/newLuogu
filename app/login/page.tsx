import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { ClipboardCheck, LockKeyhole, Phone, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="page-1448 login-page page-bg">
      <div className="login-logo"><Brand variant="owl" size="marketing" name="AI 信奥训练教练" /></div>
      <div className="login-main">
        <div className="login-left">
          <h1>欢迎回来！</h1>
          <p>登录后，AI 教练将为你定制<br/>专属的训练计划</p>
          <Image src="/assets/login-owl.png" alt="AI 教练" width={455} height={370} className="login-owl" priority />
        </div>
        <div className="login-form card-large">
          <div className="login-tabs"><div>手机号登录</div><div>微信登录</div></div>
          <div className="input-row"><Phone size={26} color="#4a34ff"/><span>请输入手机号</span></div>
          <div className="input-row small-gap"><ShieldCheck size={27} color="#4a34ff"/><span>请输入验证码</span><button>获取验证码</button></div>
          <Link href="/onboarding/step-4" className="btn-primary" style={{ width: "100%", height: 84, marginTop: 32, fontSize: 27, borderRadius: 12 }}>登录 / 注册</Link>
          <div className="check-row"><span className="empty-radio"/>我已阅读并同意 <b style={{ color: "#332aff" }}>《用户协议》</b> 和 <b style={{ color: "#332aff" }}>《隐私政策》</b></div>
        </div>
      </div>
      <div className="login-status-card card-large">
        <div style={{ gridColumn: "1 / -1", position: "absolute", left: 40, top: 30, color: "#47527b", fontSize: 18 }}>登录后将根据你的状态进入：</div>
        <div className="status-block" style={{ marginTop: 32 }}>
          <span className="icon-bubble" style={{ width: 72, height: 72 }}><LockKeyhole size={38}/></span>
          <div><h3 style={{ margin: 0, fontSize: 24 }}>未诊断用户</h3><p style={{ margin: "10px 0 0", color: "#5e688e", fontSize: 18, lineHeight: 1.7 }}>将进入引导页，帮你完成<br/>AI 能力诊断</p></div>
        </div>
        <div style={{ color: "#4b35ff", fontSize: 42, fontWeight: 900 }}>→</div>
        <div className="status-block" style={{ marginTop: 32 }}>
          <span className="icon-bubble green" style={{ width: 72, height: 72 }}><ClipboardCheck size={38}/></span>
          <div><h3 style={{ margin: 0, fontSize: 24 }}>已诊断用户</h3><p style={{ margin: "10px 0 0", color: "#5e688e", fontSize: 18, lineHeight: 1.7 }}>将直接进入目标总览，查看<br/>你的训练计划</p></div>
        </div>
        <Image src="/assets/login-card-doc.png" alt="报告" width={280} height={200} className="login-doc" />
      </div>
    </div>
  );
}

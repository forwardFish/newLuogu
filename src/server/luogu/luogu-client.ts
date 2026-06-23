import { env } from "@/src/lib/env";
import { sleep } from "@/src/lib/sleep";
import type { RawHttpResponse } from "./luogu-types";

export class LuoguClient {
  private lastRequestAt = 0;
  private cookieJar = new Map<string, string>();

  async fetchUserProfile(uid: string): Promise<RawHttpResponse> {
    return this.request(`https://www.luogu.com.cn/user/${encodeURIComponent(uid)}?_contentOnly=1`);
  }

  async fetchRecordPage(uid: string, page: number): Promise<RawHttpResponse> {
    const params = new URLSearchParams({ user: uid, page: String(page) });
    return this.request(`https://www.luogu.com.cn/record/list?${params.toString()}`);
  }

  async fetchProblem(pid: string): Promise<RawHttpResponse> {
    return this.request(`https://www.luogu.com.cn/problem/${encodeURIComponent(pid)}?_contentOnly=1`);
  }

  private async request(url: string): Promise<RawHttpResponse> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= env.LUOGU_REQUEST_RETRY_TIMES; attempt += 1) {
      try {
        await this.rateLimit();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), env.LUOGU_REQUEST_TIMEOUT_MS);
        const response = await fetch(url, {
          signal: controller.signal,
          redirect: "manual",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36 AI-OI-Coach-MVP/1.0",
            Referer: "https://www.luogu.com.cn/",
            Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9",
            ...(this.cookieHeader() ? { Cookie: this.cookieHeader() } : {})
          },
          cache: "no-store"
        });
        clearTimeout(timeout);
        this.rememberCookies(response);
        if (isRedirect(response.status)) {
          const location = response.headers.get("location");
          const nextUrl = location ? new URL(location, url).toString() : url;
          if (nextUrl === url && attempt < env.LUOGU_REQUEST_RETRY_TIMES) {
            await sleep(200);
            continue;
          }
          if (nextUrl !== url && attempt < env.LUOGU_REQUEST_RETRY_TIMES) {
            url = nextUrl;
            continue;
          }
        }
        const body = await response.text();
        let json: unknown;
        try {
          json = JSON.parse(body);
        } catch {
          json = undefined;
        }
        return {
          url,
          status: response.status,
          ok: response.ok,
          body,
          json,
          fetchedAt: new Date().toISOString()
        };
      } catch (error) {
        lastError = error;
        if (attempt < env.LUOGU_REQUEST_RETRY_TIMES) {
          await sleep(1000 * (attempt + 1));
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  private async rateLimit() {
    const elapsed = Date.now() - this.lastRequestAt;
    if (elapsed < env.LUOGU_REQUEST_INTERVAL_MS) {
      await sleep(env.LUOGU_REQUEST_INTERVAL_MS - elapsed);
    }
    this.lastRequestAt = Date.now();
  }

  private rememberCookies(response: Response) {
    const getSetCookie = (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
    const cookies = getSetCookie ? getSetCookie.call(response.headers) : splitSetCookie(response.headers.get("set-cookie"));
    for (const cookie of cookies) {
      const [pair] = cookie.split(";");
      const eq = pair.indexOf("=");
      if (eq <= 0) continue;
      this.cookieJar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    }
  }

  private cookieHeader() {
    return Array.from(this.cookieJar.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }
}

function isRedirect(status: number) {
  return [301, 302, 303, 307, 308].includes(status);
}

function splitSetCookie(value: string | null) {
  if (!value) return [];
  return value.split(/,(?=\s*[^;,\s]+=)/g);
}

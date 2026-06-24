#include <bits/stdc++.h>
using namespace std;

struct Order {
    // buy=true -> BUY, buy=false -> SELL
    bool buy;
    int idx;       // stock index
    int qty;       // shares
};

static inline bool is_space_or_comma(char c) {
    return c == ' ' || c == ',' || c == '\t' || c == '\r' || c == '\n';
}

// 解析价格字符串（两位小数）为“分”（cents），严格避免浮点误差。
// 支持： "10.10" "10" "0.00" 以及停牌/缺失 "NA"
static inline long long parse_price_cents(const string_view &sv, bool &ok) {
    ok = true;
    if (sv.size() == 0) { ok = false; return 0; }
    if (sv.size() == 2 && (sv[0] == 'N' || sv[0] == 'n') && (sv[1] == 'A' || sv[1] == 'a')) {
        ok = false; return 0;
    }
    // 允许 "NAxxx" 之类的异常也视为不合法
    if ((sv[0] < '0' || sv[0] > '9') && sv[0] != '.') { ok = false; return 0; }

    long long int_part = 0;
    long long frac_part = 0;
    int frac_len = 0;
    bool seen_dot = false;

    for (char c : sv) {
        if (c == '.') { seen_dot = true; continue; }
        if (c < '0' || c > '9') { ok = false; return 0; }
        int d = c - '0';
        if (!seen_dot) {
            int_part = int_part * 10 + d;
        } else {
            if (frac_len < 2) {
                frac_part = frac_part * 10 + d;
                frac_len++;
            } else {
                // 多余小数位忽略（题面保证两位，这里容错）
            }
        }
    }
    if (!seen_dot) frac_part = 0, frac_len = 0;
    if (frac_len == 0) frac_part *= 100;
    else if (frac_len == 1) frac_part *= 10;
    else if (frac_len == 2) frac_part *= 1;

    return int_part * 100 + frac_part;
}

// 从一行行情中提取：code, open(分), close(分), volume(股)
// 兼容逗号或空格分隔；字段顺序固定。
// ["date","code","open","high","low","close","volume",...]
static inline bool parse_market_line(const string &line,
                                    string &code,
                                    long long &open_cents,
                                    long long &close_cents,
                                    long long &volume_shares) {
    // tokenize into up to 12 fields using string_view slices
    // 不做额外拷贝，靠下标切片
    array<string_view, 12> f{};
    int cnt = 0;
    size_t n = line.size();
    size_t i = 0;

    while (i < n && is_space_or_comma(line[i])) i++;
    while (i < n && cnt < 12) {
        size_t j = i;
        while (j < n && !is_space_or_comma(line[j])) j++;
        f[cnt++] = string_view(line.data() + i, j - i);
        i = j;
        while (i < n && is_space_or_comma(line[i])) i++;
    }
    if (cnt < 7) return false;

    code.assign(f[1].data(), f[1].size());

    bool ok_open = true, ok_close = true;
    open_cents = parse_price_cents(f[2], ok_open);
    close_cents = parse_price_cents(f[5], ok_close);

    // volume 是整数（股）
    volume_shares = 0;
    {
        const string_view &sv = f[6];
        long long v = 0;
        for (char c : sv) {
            if (c < '0' || c > '9') { v = 0; break; }
            v = v * 10 + (c - '0');
        }
        volume_shares = v;
    }

    // 若 open/close 不合法，按停牌处理
    if (!ok_open) open_cents = 0;
    if (!ok_close) close_cents = 0;
    return true;
}

struct Trader {
    int n = 200;
    int D = 0;
    int L = 100;
    int Kmax = 0;

    // 费率参数（double 存储，结算时统一四舍五入到分）
    double alpha = 0.0;      // commission rate
    double com_min_yuan = 0; // min commission in yuan
    double beta = 0.0;       // stamp tax on sell

    // 账户：现金（分）+ 持仓（股）
    long long cash_cents = 0;
    vector<long long> pos_shares;

    // 股票代码与映射
    vector<string> codes;
    unordered_map<string, int> code2idx;

    // 当日行情（分）
    vector<long long> open_cents, close_cents, volume_shares;

    // 历史收盘（分），仅保留最近若干天
    int lookback = 5;
    int hist_keep = 30;
    vector<deque<long long>> close_hist;

    // 上一轮提交的订单（将在“本轮收到行情”时按当日 open 执行）
    vector<Order> pending;

    int day = 0; // 已接收的行情日号：0..D

    long long commission_cents(long long value_cents) const {
        // value_cents 是成交额（分）；佣金= max(com_min, alpha*V)，四舍五入到分
        long double v_yuan = (long double)value_cents / 100.0L;
        long double com = alpha * v_yuan;
        long double com_min = (long double)com_min_yuan;
        long double use = (com < com_min ? com_min : com);
        long long cents = (long long) llround(use * 100.0L);
        return cents;
    }

    long long stamp_cents(long long value_cents) const {
        // 印花税= beta*V，四舍五入到分
        long double v_yuan = (long double)value_cents / 100.0L;
        long double tax = beta * v_yuan;
        long long cents = (long long) llround(tax * 100.0L);
        return cents;
    }

    void apply_pending_at_today_open() {
        if (pending.empty()) return;
        // 收到 day t 行情后（已知 open），模拟 judge 在 day t open 执行 pending
        for (const Order &od : pending) {
            int i = od.idx;
            int q = od.qty;
            long long p = open_cents[i];
            if (p <= 0) {
                // 停牌：直接丢弃
                continue;
            }
            long long value = p * (long long)q; // 分
            long long com = commission_cents(value);

            if (od.buy) {
                long long cost = value + com;
                if (cash_cents >= cost) {
                    cash_cents -= cost;
                    pos_shares[i] += q;
                } else {
                    // 现金不足：拒单
                }
            } else {
                if (pos_shares[i] >= q) {
                    long long tax = stamp_cents(value);
                    long long gain = value - tax - com;
                    cash_cents += gain;
                    pos_shares[i] -= q;
                } else {
                    // 持仓不足：拒单
                }
            }
        }
        pending.clear();
    }

    // 基线策略：5 日动量（close_t / close_{t-5} - 1）
    // - 选动量最高的 topM（且动量>阈值）
    // - 目标持仓数量 maxHold
    // - 先卖出不在目标集合的持仓，再等权买入目标集合
    vector<Order> build_orders() {
        vector<Order> orders;

        // 最后一日：不建议交易（买入会立刻产生成本，卖出也会产生税费/佣金）
        if (day >= D) return orders;

        const int maxHold = 10;
        const double mom_buy_th = 0.02; // 5日动量>2% 才考虑
        const double mom_keep_th = -0.01; // 动量跌破 -1% 或不在榜单就卖

        vector<double> mom(n, -1e100);

        for (int i = 0; i < n; i++) {
            if ((int)close_hist[i].size() >= lookback + 1) {
                long long c0 = close_hist[i].back();
                long long c1 = close_hist[i][(int)close_hist[i].size() - 1 - lookback];
                if (c0 > 0 && c1 > 0) {
                    mom[i] = (double)c0 / (double)c1 - 1.0;
                }
            }
        }

        vector<int> idx(n);
        iota(idx.begin(), idx.end(), 0);
        sort(idx.begin(), idx.end(), [&](int a, int b) {
            return mom[a] > mom[b];
        });

        // 目标池：topM 且 mom>buy阈值，并且当日 close>0（可估值）
        vector<int> target;
        target.reserve(maxHold);
        for (int k = 0; k < n && (int)target.size() < maxHold; k++) {
            int i = idx[k];
            if (mom[i] > mom_buy_th && close_cents[i] > 0) {
                target.push_back(i);
            }
        }

        vector<char> in_target(n, 0);
        for (int i : target) in_target[i] = 1;

        // 1) 先卖：不在 target 或动量过差
        for (int i = 0; i < n; i++) {
            if (pos_shares[i] <= 0) continue;
            bool should_sell = (!in_target[i]) || (mom[i] < mom_keep_th);
            if (!should_sell) continue;

            int qty = (int)(pos_shares[i] / L) * L;
            if (qty <= 0) continue;
            orders.push_back(Order{false, i, qty});
            if ((int)orders.size() >= Kmax) return orders;
        }

        // 2) 再买：等权配置目标池
        if (target.empty()) return orders;

        // 估算可用现金：保留一部分缓冲（避免佣金导致拒单）
        long long cash_avail = (long long) (cash_cents * 0.95);

        // 计算每只目标股票预算
        long long per = cash_avail / (long long)target.size();
        if (per <= 0) return orders;

        for (int i : target) {
            // 用最新 close 作为估价，下一日以 open 成交；这里只是形成订单规模
            long long price = close_cents[i];
            if (price <= 0) continue;

            // 先按预算算可买股数，再对齐手数
            long long raw_shares = (per / price);
            long long qty = (raw_shares / L) * L;
            if (qty <= 0) continue;

            // 限制单票最大仓位：避免过度集中
            long long max_add = 2000; // 2000股上限（可自行调参）
            if (qty > max_add) qty = (max_add / L) * L;

            // 形成买单
            orders.push_back(Order{true, i, (int)qty});
            if ((int)orders.size() >= Kmax) break;
        }

        // 订单过多时可进一步裁剪，这里已按 Kmax 截断
        return orders;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    Trader tr;

    string line;
    if (!std::getline(cin, line)) return 0;

    {
        // INIT n D m L alpha com_min beta K_max
        // 允许多空格
        stringstream ss(line);
        string tag;
        ss >> tag;
        if (tag != "INIT") return 0;

        long long m_yuan = 0;
        ss >> tr.n >> tr.D >> m_yuan >> tr.L >> tr.alpha >> tr.com_min_yuan >> tr.beta >> tr.Kmax;

        tr.cash_cents = m_yuan * 100;
        tr.pos_shares.assign(tr.n, 0);
        tr.codes.assign(tr.n, "");
        tr.open_cents.assign(tr.n, 0);
        tr.close_cents.assign(tr.n, 0);
        tr.volume_shares.assign(tr.n, 0);
        tr.close_hist.assign(tr.n, deque<long long>());
        tr.code2idx.reserve(tr.n * 2);
    }

    // 读取 day0 的 n 行
    for (int i = 0; i < tr.n; i++) {
        if (!getline(cin, line)) return 0;
        string code;
        long long op, cl, vol;
        if (!parse_market_line(line, code, op, cl, vol)) return 0;
        tr.codes[i] = code;
        tr.code2idx[code] = i;
        tr.open_cents[i] = op;
        tr.close_cents[i] = cl;
        tr.volume_shares[i] = vol;
        if (cl > 0) tr.close_hist[i].push_back(cl);
    }
    tr.day = 0;

    // 主循环：每次根据“已收到的最新行情(day=0..D)”下单，等待下一天数据或 FINISH
    while (true) {
        // 构建下一轮要提交的委托（在收到 day t 行情后提交，用于 day t+1 开盘）
        vector<Order> orders = tr.build_orders();

        // 输出委托
        // 注意：Kmax 已在 build_orders 控制，这里再保险截断
        if ((int)orders.size() > tr.Kmax) orders.resize(tr.Kmax);

        for (const auto &od : orders) {
            const string &code = tr.codes[od.idx];
            if (od.buy) {
                cout << "BUY " << code << " " << od.qty << "\n";
            } else {
                cout << "SELL " << code << " " << od.qty << "\n";
            }
        }
        cout << "DONE\n";
        cout.flush();

        // 记录为 pending：将在“下一次收到行情日”的 open 成交
        tr.pending = orders;

        // 读 Judge 返回：要么 FINISH，要么下一交易日的第一行行情
        if (!getline(cin, line)) return 0;

        if (line.size() >= 6 && line.rfind("FINISH", 0) == 0) {
            // 终局结束
            // FINISH <FinalAsset>
            // 可选择输出到 stderr 做调试（线上建议不要输出）
            return 0;
        }
        if (line.size() >= 5 && (line.rfind("ERROR", 0) == 0 || line.rfind("INVALID", 0) == 0)) {
            return 0;
        }

        // 否则：这是 day (tr.day+1) 的第 1 行行情
        tr.day += 1;
        int first_idx = -1;

        // 先清空当日 open/close
        for (int i = 0; i < tr.n; i++) {
            tr.open_cents[i] = 0;
            tr.close_cents[i] = 0;
            tr.volume_shares[i] = 0;
        }

        // 读取第1行并填入
        {
            string code;
            long long op, cl, vol;
            if (!parse_market_line(line, code, op, cl, vol)) return 0;
            auto it = tr.code2idx.find(code);
            if (it == tr.code2idx.end()) return 0;
            first_idx = it->second;
            tr.open_cents[first_idx] = op;
            tr.close_cents[first_idx] = cl;
            tr.volume_shares[first_idx] = vol;
        }

        // 读取剩余 n-1 行
        for (int k = 1; k < tr.n; k++) {
            if (!getline(cin, line)) return 0;
            string code;
            long long op, cl, vol;
            if (!parse_market_line(line, code, op, cl, vol)) return 0;
            auto it = tr.code2idx.find(code);
            if (it == tr.code2idx.end()) return 0;
            int i = it->second;
            tr.open_cents[i] = op;
            tr.close_cents[i] = cl;
            tr.volume_shares[i] = vol;
        }

        // 收到 day=tr.day 的行情后：先按 day 的 open 执行 pending（即上一轮下的单）
        tr.apply_pending_at_today_open();

        // 更新 close 历史
        for (int i = 0; i < tr.n; i++) {
            long long cl = tr.close_cents[i];
            if (cl > 0) {
                tr.close_hist[i].push_back(cl);
                while ((int)tr.close_hist[i].size() > tr.hist_keep) tr.close_hist[i].pop_front();
            } else {
                // 若 close 缺失，可选择不更新；这里不更新以保持历史有效性
            }
        }

        // 如果已经到 day D：下一轮 build_orders 会返回空单，输出 DONE，随后读 FINISH
        // 循环继续即可
    }

    return 0;
}

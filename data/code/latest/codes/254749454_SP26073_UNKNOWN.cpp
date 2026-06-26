#include <cstdio>
#include <cmath>
#include <cstdint>

using ll = long long;
using i128 = __int128_t;

struct Vec {
    ll x, y;
    Vec(ll _x=0, ll _y=0): x(_x), y(_y) {}
    inline Vec operator + (const Vec& b) const { return Vec(x + b.x, y + b.y); }
};

static inline ll isqrt_floor(ll n) {
    long double t = sqrt((long double)n);
    ll r = (ll)t;
    while ((i128)(r + 1) * (r + 1) <= (i128)n) ++r;
    while ((i128)r * r > (i128)n) --r;
    return r;
}
static inline ll icbrt_floor(ll n) {
    long double t = cbrt((long double)n);
    ll r = (ll)t;
    while ((i128)(r + 1) * (r + 1) * (r + 1) <= (i128)n) ++r;
    while ((i128)r * r * r > (i128)n) --r;
    return r;
}

static inline void print_i128(i128 x) {
    if (x == 0) { putchar('0'); return; }
    if (x < 0) { putchar('-'); x = -x; }
    char s[64];
    int n = 0;
    while (x) { s[n++] = char('0' + (int)(x % 10)); x /= 10; }
    while (n--) putchar(s[n]);
}

static ll n_global;

// --- 关键：比较用 i128，防溢出 ---
static inline bool above(ll x, ll y) { // x*y > n ?
    return (i128)x * (i128)y > (i128)n_global;
}

// |f'(x)| <= v.y/v.x  <=> n*v.x <= x^2*v.y
static inline bool judge(ll x, const Vec& v) {
    return (i128)n_global * (i128)v.x <= (i128)x * (i128)x * (i128)v.y;
}

// 斜率数量最坏 ~ n^(1/3) ~ 2.1e6 (n<2^63)，开 6e6 很稳
static const int STK_MAX = 6000000;
static Vec stk[STK_MAX];
static int top;

static inline void push(const Vec& v) {
    stk[++top] = v; // 这里不会越界（STK_MAX 足够大）
}

static i128 S1(ll n) {
    n_global = n;
    top = 0;

    ll srn = isqrt_floor(n);
    ll crn = icbrt_floor(n);

    ll x = n / srn;
    ll y = srn + 1;

    i128 ret = 0;

    // 初始两条向量： (1,0) 斜率 0, (1,1) 斜率 1
    push(Vec(1, 0));
    push(Vec(1, 1));

    Vec L, R, M;

    while (true) {
        // 取栈顶向量 L，沿该方向走到刚好离开 R'
        L = stk[top--];
        while (above(x + L.x, y - L.y)) {
            x += L.x;
            y -= L.y;
            // 横条贡献：x*v + (v+1)*(u-1)/2
            ret += (i128)x * (i128)L.y + (i128)(L.y + 1) * (i128)(L.x - 1) / 2;
        }

        if (y <= crn) break;

        // 调整：找到 L(大) 与 R(小)，使得 P+R 在 R' 内，P+L 在 R' 外
        R = stk[top];
        while (!above(x + R.x, y - R.y)) {
            R = stk[--top]; // 这里依赖正确的 floor(sqrt/cbrt)，否则可能下溢；已修正
            L = R;
        }

        // Stern-Brocot 上二分
        while (true) {
            M = L + R;
            if (above(x + M.x, y - M.y)) {
                push(R = M);
            } else {
                if (judge(x + M.x, R)) break;
                L = M;
            }
        }
    }

    for (ll i = 1; i < y; ++i) ret += n / i;
    return ret * 2 - (i128)srn * (i128)srn;
}

int main() {
    int T;
    if (scanf("%d", &T) != 1) return 0;
    while (T--) {
        ll n;
        scanf("%lld", &n);
        i128 ans = S1(n);
        print_i128(ans);
        putchar('\n');
    }
    return 0;
}

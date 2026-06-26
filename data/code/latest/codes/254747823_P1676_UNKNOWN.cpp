#include <bits/stdc++.h>
using namespace std;

using i64 = long long;
using i128 = __int128_t;

struct FastScanner {
    static const int BUFSIZE = 1 << 20;
    int idx = 0, size = 0;
    char buf[BUFSIZE];

    inline char gc() {
        if (idx >= size) {
            size = (int)fread(buf, 1, BUFSIZE, stdin);
            idx = 0;
            if (size == 0) return 0;
        }
        return buf[idx++];
    }

    template <class T>
    bool readInt(T &out) {
        char c;
        do {
            c = gc();
            if (!c) return false;
        } while (c <= ' ');

        bool neg = false;
        if (c == '-') { neg = true; c = gc(); }

        T val = 0;
        while (c >= '0' && c <= '9') {
            val = val * 10 + (c - '0');
            c = gc();
        }
        out = neg ? -val : val;
        return true;
    }
};

static inline void print_i128(i128 x) {
    if (x == 0) { putchar('0'); return; }
    if (x < 0) { putchar('-'); x = -x; }
    char s[64];
    int n = 0;
    while (x > 0) {
        int d = (int)(x % 10);
        s[n++] = char('0' + d);
        x /= 10;
    }
    while (n--) putchar(s[n]);
}

static inline i64 isqrt_u(i64 n) {
    // floor(sqrt(n)) for n>=0
    long double x = sqrt((long double)n);
    i64 r = (i64)x;
    while ((i128)(r + 1) * (r + 1) <= (i128)n) ++r;
    while ((i128)r * r > (i128)n) --r;
    return r;
}

static inline i64 icbrt_u(i64 n) {
    // floor(cbrt(n)) for n>=0
    long double x = cbrt((long double)n);
    i64 r = (i64)x;
    while ((i128)(r + 1) * (r + 1) * (r + 1) <= (i128)n) ++r;
    while ((i128)r * r * r > (i128)n) --r;
    return r;
}

struct Vec {
    i64 x, y; // vector (x, y)
    Vec(i64 _x=0, i64 _y=0): x(_x), y(_y) {}
};
static inline Vec operator+(const Vec &a, const Vec &b) {
    return Vec(a.x + b.x, a.y + b.y);
}

static const int ST_MAX = 1000005;
static Vec st[ST_MAX];
static int top_ptr;

static i64 N_global;

// R' : x*y > N  (注意要用 128 防溢出)
static inline bool in_Rprime(i64 x, i64 y) {
    return (i128)x * (i128)y > (i128)N_global;
}

// |f'(x)| <= v.y/v.x  等价于  N * v.x <= x^2 * v.y
static inline bool steep_enough(i64 x, const Vec &v) {
    return (i128)N_global * (i128)v.x <= (i128)x * (i128)x * (i128)v.y;
}

static i128 S1(i64 n) {
    N_global = n;
    top_ptr = 0;

    i64 B = isqrt_u(n);
    i64 cr = icbrt_u(n);

    // P0 = ( floor(n/B), B+1 )
    i64 x = n / B;
    i64 y = B + 1;

    i128 area_sum = 0;

    // 栈内存的是向量 (dx, dy)，对应斜率 dy/dx in [0,1]
    st[++top_ptr] = Vec(1, 0);
    st[++top_ptr] = Vec(1, 1);

    Vec L, R, M;

    while (true) {
        // 取出当前最陡（栈顶）的向量 L，不断走，直到跨回 R（即不在 R'）
        L = st[top_ptr--];
        while (in_Rprime(x + L.x, y - L.y)) {
            // 走一步
            x += L.x;
            y -= L.y;

            // 增加横条面积贡献（全用 128，避免乘法溢出）
            // ret += x * L.y + (L.y + 1) * (L.x - 1) / 2
            area_sum += (i128)x * (i128)L.y
                        + (i128)(L.y + 1) * (i128)(L.x - 1) / 2;
        }

        // y 很小后（<= cbrt(n)）直接暴力补完
        if (y <= cr) break;

        // 调整栈：找到 L(大) 和 R(小)，使得
        // P+L 不在 R'（即在 R），P+R 在 R'
        R = st[top_ptr];
        while (!in_Rprime(x + R.x, y - R.y)) {
            R = st[--top_ptr];
            L = R;
        }

        // 在 Stern-Brocot 树上往深处走（类似二分）
        while (true) {
            M = L + R;
            if (in_Rprime(x + M.x, y - M.y)) {
                // 还能在 R' 内：把当前 R 压栈，继续向更小斜率逼近
                st[++top_ptr] = R = M;
            } else {
                // 已经不在 R'：看斜率是否足够小，决定停或继续
                if (steep_enough(x + M.x, R)) break;
                L = M;
            }
        }
    }

    // 补：i=1..y-1 的直接加 floor(n/i)
    for (i64 i = 1; i < y; ++i) area_sum += (n / i);

    // S(n) = 2*sum_{i=1..floor(sqrt n)} floor(n/i) - floor(sqrt n)^2
    // 这里 area_sum 就是 sum_{i=1..floor(sqrt n)} floor(n/i)
    i128 ans = area_sum * 2 - (i128)B * (i128)B;
    return ans;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    FastScanner fs;
    int T;
    if (!fs.readInt(T)) return 0;
    while (T--) {
        i64 n;
        fs.readInt(n);
        i128 ans = S1(n);
        print_i128(ans);
        putchar('\n');
    }
    return 0;
}

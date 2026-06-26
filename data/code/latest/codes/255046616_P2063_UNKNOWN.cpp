#include <bits/stdc++.h>
using namespace std;

using u64 = unsigned long long;
using u128 = __uint128_t;
using i128 = __int128_t;

static inline u64 mul_mod(u64 a, u64 b, u64 mod) {
    return (u128)a * b % mod;
}
static inline u64 pow_mod(u64 a, u64 e, u64 mod) {
    u64 r = 1 % mod;
    while (e) {
        if (e & 1) r = mul_mod(r, a, mod);
        a = mul_mod(a, a, mod);
        e >>= 1;
    }
    return r;
}
static inline u64 gcd_u64(u64 a, u64 b) {
    while (b) { u64 t = a % b; a = b; b = t; }
    return a;
}

// 64-bit deterministic Miller-Rabin
static bool is_prime(u64 n) {
    if (n < 2) return false;
    static u64 small[] = {2ULL,3ULL,5ULL,7ULL,11ULL,13ULL,17ULL,19ULL,23ULL,0ULL};
    for (int i = 0; small[i]; ++i) {
        if (n % small[i] == 0) return n == small[i];
    }
    u64 d = n - 1, s = 0;
    while ((d & 1) == 0) { d >>= 1; ++s; }

    auto witness = [&](u64 a) -> bool {
        if (a % n == 0) return false;
        u64 x = pow_mod(a, d, n);
        if (x == 1 || x == n - 1) return false;
        for (u64 r = 1; r < s; ++r) {
            x = mul_mod(x, x, n);
            if (x == n - 1) return false;
        }
        return true;
    };

    static u64 bases[] = {
        2ULL, 325ULL, 9375ULL, 28178ULL, 450775ULL, 9780504ULL, 1795265022ULL, 0ULL
    };
    for (int i = 0; bases[i]; ++i) {
        if (witness(bases[i])) return false;
    }
    return true;
}

static mt19937_64 rng((u64)chrono::high_resolution_clock::now().time_since_epoch().count());

static u64 pollard_rho(u64 n) {
    if ((n & 1ULL) == 0) return 2ULL;
    if (n % 3ULL == 0) return 3ULL;

    u64 c = uniform_int_distribution<u64>(1, n - 1)(rng);
    u64 x = uniform_int_distribution<u64>(0, n - 1)(rng);
    u64 y = x, d = 1;

    auto f = [&](u64 v) -> u64 {
        return (mul_mod(v, v, n) + c) % n;
    };

    while (d == 1) {
        x = f(x);
        y = f(f(y));
        u64 diff = (x > y) ? (x - y) : (y - x);
        d = gcd_u64(diff, n);
    }
    if (d == n) return pollard_rho(n);
    return d;
}

static void factor_rec(u64 n, map<u64,int> &fac) {
    if (n == 1) return;
    if (is_prime(n)) { fac[n]++; return; }
    u64 d = pollard_rho(n);
    factor_rec(d, fac);
    factor_rec(n / d, fac);
}

static u64 isqrt_u64(u64 x) {
    long double r = sqrt((long double)x);
    u64 y = (u64)r;
    while ((u128)(y + 1) * (y + 1) <= x) ++y;
    while ((u128)y * y > x) --y;
    return y;
}

struct G { long long a, b; }; // a + i b

static inline G g_mul(const G &x, const G &y) {
    i128 ra = (i128)x.a * y.a - (i128)x.b * y.b;
    i128 rb = (i128)x.a * y.b + (i128)x.b * y.a;
    return G{(long long)ra, (long long)rb};
}

static G g_pow(G base, int e) {
    G r{1, 0};
    while (e > 0) {
        if (e & 1) r = g_mul(r, base);
        base = g_mul(base, base);
        e >>= 1;
    }
    return r;
}

static u64 pow_u64(u64 a, int e) {
    u128 r = 1, b = a;
    while (e > 0) {
        if (e & 1) r *= b;
        b *= b;
        e >>= 1;
    }
    return (u64)r;
}

// find r^2 ≡ -1 (mod p), p prime, p ≡ 1 (mod 4)
static u64 sqrt_minus_one_mod_prime(u64 p) {
    u64 a = 2;
    while (true) {
        u64 ls = pow_mod(a, (p - 1) / 2, p);
        if (ls == p - 1) break;
        ++a;
    }
    return pow_mod(a, (p - 1) / 4, p);
}

// Cornacchia: returns (x,y) with x^2 + y^2 = p, p prime ≡ 1 (mod 4) or p=2
static pair<u64,u64> sum_two_squares_prime(u64 p) {
    if (p == 2) return {1,1};
    u64 r = sqrt_minus_one_mod_prime(p);
    if (r > p - r) r = p - r;

    u64 a = p, b = r;
    while ((u128)b * b > p) {
        u64 t = a % b;
        a = b;
        b = t;
    }
    u64 x = b;
    u64 y2 = p - x * x;
    u64 y = isqrt_u64(y2);
    return {x, y};
}

static void uniq_vec(vector<G> &v) {
    sort(v.begin(), v.end(), [](const G& x, const G& y){
        if (x.a != y.a) return x.a < y.a;
        return x.b < y.b;
    });
    v.erase(unique(v.begin(), v.end(), [](const G& x, const G& y){
        return x.a == y.a && x.b == y.b;
    }), v.end());
}

static void solve_one(u64 n) {
    map<u64,int> fac;
    factor_rec(n, fac);

    // existence check: primes 3 mod 4 must have even exponent
    for (auto it = fac.begin(); it != fac.end(); ++it) {
        u64 p = it->first; int e = it->second;
        if ((p % 4ULL) == 3ULL && (e & 1)) {
            cout << 0 << "\n";
            return;
        }
    }

    // scale = product p^{e/2} for p ≡ 3 (mod 4)
    u64 scale = 1;
    for (auto it = fac.begin(); it != fac.end(); ++it) {
        u64 p = it->first; int e = it->second;
        if ((p % 4ULL) == 3ULL) {
            scale = (u64)((u128)scale * (u128)pow_u64(p, e / 2));
        }
    }

    vector<G> cur;
    cur.push_back(G{1,0});

    // handle 2^e via (1+i)^e
    auto it2 = fac.find(2ULL);
    if (it2 != fac.end()) {
        int e2 = it2->second;
        if (e2 > 0) {
            G g2 = g_pow(G{1,1}, e2);
            vector<G> nxt;
            nxt.reserve(cur.size());
            for (size_t i = 0; i < cur.size(); ++i) nxt.push_back(g_mul(cur[i], g2));
            cur.swap(nxt);
            uniq_vec(cur);
        }
    }

    // handle primes p ≡ 1 (mod 4)
    for (auto it = fac.begin(); it != fac.end(); ++it) {
        u64 p = it->first; int e = it->second;
        if (p == 2ULL) continue;
        if ((p % 4ULL) != 1ULL) continue;

        auto ab = sum_two_squares_prime(p);
        u64 a = ab.first, b = ab.second;

        vector<G> pos(e + 1), neg(e + 1);
        pos[0] = G{1,0};
        neg[0] = G{1,0};
        G gp{(long long)a, (long long)b};
        G gn{(long long)a, -(long long)b};
        for (int i = 1; i <= e; ++i) {
            pos[i] = g_mul(pos[i-1], gp);
            neg[i] = g_mul(neg[i-1], gn);
        }

        vector<G> opt;
        opt.reserve(e + 1);
        for (int k = 0; k <= e; ++k) {
            opt.push_back(g_mul(pos[k], neg[e - k]));
        }

        vector<G> nxt;
        nxt.reserve(cur.size() * opt.size());
        for (size_t i = 0; i < cur.size(); ++i) {
            for (size_t j = 0; j < opt.size(); ++j) {
                nxt.push_back(g_mul(cur[i], opt[j]));
            }
        }
        cur.swap(nxt);
        uniq_vec(cur);
    }

    // ordered nonnegative solutions
    set<pair<u64,u64>> ans;
    for (size_t i = 0; i < cur.size(); ++i) {
        u64 x = (u64)llabs(cur[i].a);
        u64 y = (u64)llabs(cur[i].b);
        x = (u64)((u128)x * scale);
        y = (u64)((u128)y * scale);
        ans.insert({x, y});
        ans.insert({y, x});
    }

    cout << ans.size() << "\n";
    for (auto it = ans.begin(); it != ans.end(); ++it) {
        cout << it->first << " " << it->second << "\n";
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int T;
    cin >> T;
    for (int tc = 1; tc <= T; ++tc) {
        u64 n;
        cin >> n;
        solve_one(n);
        if (tc != T) cout << "\n";
    }
    return 0;
}

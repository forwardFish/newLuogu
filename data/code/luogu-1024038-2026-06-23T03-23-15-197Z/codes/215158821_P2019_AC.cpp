#include <bits/stdc++.h>
using namespace std;
using ull = unsigned long long;
using ll = long long;
const ll MOD = 1000000007;

// 计算 a 和 b 的最大公约数（欧几里得算法）
ull gcd_ull(ull a, ull b) {
    if (b == 0) return a;
    return gcd_ull(b, a % b);
}

// 模乘: 计算 (a * b) mod m，使用 __uint128_t 避免溢出
ull modmul(ull a, ull b, ull m) {
    __uint128_t res = ( __uint128_t ) a * b;
    return (ull)(res % m);
}
// 快速幂: 计算 (base^exp) mod mod，使用 128 位中间变量
ull modpow(ull base, ull exp, ull mod) {
    __uint128_t result = 1;
    __uint128_t b = base % mod;
    while (exp > 0) {
        if (exp & 1) {
            result = (result * b) % mod;
        }
        b = (b * b) % mod;
        exp >>= 1;
    }
    return (ull)result;
}

// Miller-Rabin 素性测试（适用于 64 位整数）
bool isPrime(ull n) {
    if (n < 2) return false;
    // 先除以一些小素数
    static const ull testPrimes[] = {2ULL,3ULL,5ULL,7ULL,11ULL,13ULL,17ULL,19ULL,23ULL,0};
    for (int i = 0; testPrimes[i] != 0; ++i) {
        if (n % testPrimes[i] == 0)
            return n == testPrimes[i];
    }
    // 将 n-1 分解为 d*2^s 的形式
    ull d = n - 1;
    int s = 0;
    while ((d & 1) == 0) {
        d >>= 1;
        s++;
    }
    // 确定性基数集，对于 64 位整数有效
    static const ull bases[] = {2ULL, 325ULL, 9375ULL, 28178ULL, 
                                450775ULL, 9780504ULL, 1795265022ULL, 0};
    for (int i = 0; bases[i] != 0; ++i) {
        ull a = bases[i] % n;
        if (a == 0) continue;
        ull x = modpow(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int r = 1; r < s; ++r) {
            x = modmul(x, x, n);
            if (x == n - 1) {
                composite = false;
                break;
            }
        }
        if (composite) return false;
    }
    return true;
}

// Pollard-Rho 算法，寻找 n 的一个非平凡因子
ull pollardRho(ull n) {
    if (n % 2 == 0) return 2;
    static mt19937_64 rng((unsigned)chrono::steady_clock::now().time_since_epoch().count());
    uniform_int_distribution<ull> dist(2, n - 2);
    while (true) {
        ull x = dist(rng), y = x;
        ull c = dist(rng);
        if (c >= n) c %= n;
        if (c == 0) c = 1;
        // 伪随机映射函数 f(v) = (v*v + c) mod n
        auto f = [&](ull v) { return (modmul(v, v, n) + c) % n; };
        ull d = 1;
        while (d == 1) {
            x = f(x);
            y = f(f(y));
            ull diff = (x > y ? x - y : y - x);
            d = gcd_ull(diff, n);
            if (d == n) break;  // 失败，重新选择随机参数
        }
        if (d > 1 && d < n) {
            return d; // 找到一个非平凡因子
        }
        // 如果 d==n，算法失败，重试
    }
}

// 递归分解质因数，将结果存入 factors 映射（质因数 -> 指数）
void factorize(ull n, map<ull,int> &factors) {
    if (n == 1) return;
    if (isPrime(n)) {
        factors[n]++;
    } else {
        ull d = pollardRho(n);
        factorize(d, factors);
        factorize(n / d, factors);
    }
}

// 计算 σ(n) = n 的正因子和（结果对 MOD 取模）
ll calcSigma(const map<ull,int> &factors) {
    ll result = 1;
    for (auto &p : factors) {
        ull prime = p.first;
        int exp = p.second;
        // 计算 (prime^(exp+1) - 1) / (prime - 1) mod MOD
        ll prime_mod = prime % MOD;
        ll numerator = (modpow(prime_mod, exp + 1, MOD) + MOD - 1) % MOD;
        ll inv_denom = 1;
        if (prime_mod != 1) {
            ll denom = (prime_mod + MOD - 1) % MOD;  // prime-1 mod MOD
            // Fermat 小定理求逆
            inv_denom = modpow(denom, MOD - 2, MOD);
        }
        ll term = (numerator * inv_denom) % MOD;
        result = (result * term) % MOD;
    }
    return result;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int T;
    cin >> T;
    while (T--) {
        ull n;
        cin >> n;

        // 1. 分解质因数
        map<ull,int> factors;
        factorize(n, factors);

        // 2. 计算 σ(n)
        ll sigma_n = calcSigma(factors);

        // 3. 计算 σ(n/4)，若 n 可被 4 整除，则将质因数中 2 的指数减 2
        ll sigma_n4 = 0;
        auto it = factors.find(2);
        if (it != factors.end() && it->second >= 2) {
            map<ull,int> factors_n4 = factors;
            factors_n4[2] -= 2;
            if (factors_n4[2] == 0) {
                factors_n4.erase(2);
            }
            sigma_n4 = calcSigma(factors_n4);
        }

        // 4. 应用 Jacobi 四平方和定理并取模
        ll ans = ((8LL * sigma_n % MOD) - (32LL * sigma_n4 % MOD) + MOD) % MOD;
        cout << ans << "\n";
    }
    return 0;
}

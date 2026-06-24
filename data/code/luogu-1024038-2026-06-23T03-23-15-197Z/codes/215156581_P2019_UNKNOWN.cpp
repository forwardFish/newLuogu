#include <bits/stdc++.h>
using namespace std;
using int64 = long long;
const int64 MOD = 1000000007;

// 计算 a^b mod m
int64 modexp(int64 a, int64 b, int64 m) {
    int64 res = 1 % m;
    a %= m;
    while (b > 0) {
        if (b & 1) res = (__int128)res * a % m;
        a = (__int128)a * a % m;
        b >>= 1;
    }
    return res;
}

// Miller-Rabin 素性测试，确定 n 是否为质数
bool isPrime(int64 n) {
    if (n < 2) return false;
    for (int64 p : {2,3,5,7,11,13,17,19,23,29,31,37}) {
        if (n%p == 0) return n == p;
    }
    int64 d = n - 1, s = 0;
    while ((d & 1) == 0) {
        d >>= 1; s++;
    }
    // 选取基数测试
    for (int64 a : {2, 325, 9375, 28178, 450775, 9780504, 1795265022}) {
        if (a % n == 0) continue;
        int64 x = modexp(a, d, n);
        if (x == 1 || x == n-1) continue;
        bool composite = true;
        for (int i = 1; i < s; i++) {
            x = (__int128)x * x % n;
            if (x == n-1) {
                composite = false;
                break;
            }
        }
        if (composite) return false;
    }
    return true;
}

// Pollard's Rho 随机函数 f(x) = x^2 + c mod n
int64 f_rho(int64 x, int64 c, int64 mod) {
    return ( (__int128)x * x + c ) % mod;
}

// Pollard's Rho 寻找 n 的非平凡因子
int64 pollards_rho(int64 n) {
    if (n % 2 == 0) return 2;
    std::mt19937_64 rnd((unsigned)chrono::high_resolution_clock::now().time_since_epoch().count());
    while (true) {
        int64 x = std::uniform_int_distribution<int64>(2, n-2)(rnd);
        int64 y = x;
        int64 c = std::uniform_int_distribution<int64>(1, n-1)(rnd);
        int64 d = 1;
        while (d == 1) {
            x = f_rho(x, c, n);
            y = f_rho(f_rho(y, c, n), c, n);
            d = std::gcd(abs(x - y), n);
            if (d == n) break;
        }
        if (d > 1 && d < n) return d;
    }
}

// 对 n 进行分解，将所有质因子及其幂存入 map 中
void factor(int64 n, map<int64,int>& mp) {
    if (n == 1) return;
    if (isPrime(n)) {
        mp[n]++;
    } else {
        int64 d = pollards_rho(n);
        factor(d, mp);
        factor(n / d, mp);
    }
}

int main(){
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    int T;
    cin >> T;
    while (T--) {
        int64 n;
        cin >> n;

        // 对 n 及 n/4(若可除) 进行分解并计算 σ
        map<int64,int> fac;
        factor(n, fac);

        // 计算 σ(n) 模 1e9+7
        int64 sigma_n = 1;
        for (auto &kv : fac) {
            int64 p = kv.first;
            int e = kv.second;
            // 计算 (p^(e+1)-1)/(p-1) mod MOD
            int64 num = modexp(p % MOD, e+1, MOD) - 1;
            if (num < 0) num += MOD;
            int64 denom = (p - 1) % MOD;
            if (denom < 0) denom += MOD;
            // denom 与 MOD 互素，因为 MOD 是质数且 p != 1
            int64 inv = modexp(denom, MOD-2, MOD);
            int64 term = num * inv % MOD;
            sigma_n = sigma_n * term % MOD;
        }

        // 计算 σ(n/4) 模 MOD，如果 4|n
        int64 sigma_n4 = 0;
        if (n % 4 == 0) {
            // 调整 n 中 2 的幂次数
            map<int64,int> fac_n4 = fac;
            fac_n4[2] -= 2;
            if (fac_n4[2] == 0) fac_n4.erase(2);

            sigma_n4 = 1;
            for (auto &kv : fac_n4) {
                int64 p = kv.first;
                int e = kv.second;
                int64 num = modexp(p % MOD, e+1, MOD) - 1;
                if (num < 0) num += MOD;
                int64 denom = (p - 1) % MOD;
                if (denom < 0) denom += MOD;
                int64 inv = modexp(denom, MOD-2, MOD);
                int64 term = num * inv % MOD;
                sigma_n4 = sigma_n4 * term % MOD;
            }
        }

        // 根据 Jacobi 四平方定理公式计算 r4(n)
        int64 ans;
        if (n % 4 == 0) {
            ans = (sigma_n - 4 * sigma_n4 % MOD) % MOD;
            if (ans < 0) ans += MOD;
            ans = ans * 8 % MOD;
        } else {
            ans = sigma_n * 8 % MOD;
        }
        cout << ans << "\n";
    }
    return 0;
}

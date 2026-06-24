#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll MOD = 1000000007;

// 快速幂计算 a^e mod MOD
ll modexp(ll a, ll e) {
    ll res = 1 % MOD;
    a %= MOD;
    while (e > 0) {
        if (e & 1) res = (__int128)res * a % MOD;
        a = (__int128)a * a % MOD;
        e >>= 1;
    }
    return res;
}

// 预处理质数表（埃拉托斯特尼筛法），得到 upTo 以内的所有质数
vector<int> primes;
void sieve(int upTo) {
    vector<bool> isPrime(upTo+1, true);
    isPrime[0] = isPrime[1] = false;
    for (int i = 2; i * i <= upTo; i++) {
        if (isPrime[i]) {
            for (int j = i * i; j <= upTo; j += i) {
                isPrime[j] = false;
            }
        }
    }
    for (int i = 2; i <= upTo; i++) {
        if (isPrime[i]) primes.push_back(i);
    }
}

// 将 n 分解质因数，结果保存在 factors: (质数, 指数) 数组中
void factor(ll n, vector<pair<ll,int>>& factors) {
    for (int p: primes) {
        if ((ll)p * p > n) break;
        if (n % p == 0) {
            int cnt = 0;
            while (n % p == 0) {
                n /= p;
                cnt++;
            }
            factors.emplace_back(p, cnt);
        }
    }
    if (n > 1) {
        // n 本身是质数
        factors.emplace_back(n, 1);
    }
}

// 递归生成所有约数及其欧拉函数值 phi(d)
// idx: 当前质因数索引; curDiv: 已生成的约数值; curPhi: 已生成部分的 phi 值
void genDivisors(int idx, ll curDiv, ll curPhi,
                 const vector<pair<ll,int>>& factors,
                 vector<pair<ll,ll>>& divPhi) {
    if (idx == factors.size()) {
        // 保存一个约数 d = curDiv，以及它的欧拉函数值 curPhi
        divPhi.emplace_back(curDiv, curPhi);
        return;
    }
    ll p = factors[idx].first;
    int e = factors[idx].second;
    // 不取当前质因数 p（指数为 0）的情况
    genDivisors(idx+1, curDiv, curPhi, factors, divPhi);

    // 依次取指数 1 到 e 的情况
    ll newDiv = curDiv;
    ll newPhi = curPhi;
    for (int k = 1; k <= e; k++) {
        newDiv *= p;
        if (k == 1) {
            // phi(p) = p - 1
            newPhi = curPhi * (p - 1);
        } else {
            // phi(p^k) = p^(k-1) * (p - 1)，在上一步基础上乘以 p
            newPhi *= p;
        }
        genDivisors(idx+1, newDiv, newPhi, factors, divPhi);
    }
}

// 计算环状图 n 个顶点，使用 n 种颜色染色时不计旋转对称的染色方案数
ll solveOne(ll n) {
    if (n == 1) {
        // n=1 时只有一个顶点，一个颜色方案
        return 1;
    }
    // 分解质因数
    vector<pair<ll,int>> factors;
    factor(n, factors);

    // 枚举所有约数 d 及其 φ(d)
    vector<pair<ll,ll>> divPhi;
    genDivisors(0, 1, 1, factors, divPhi);

    // 根据 Burnside 引理（Pólya 定理）：答案 = (1/n) * sum_{d|n} φ(d) * n^{n/d}
    ll sum = 0;
    for (auto &dp : divPhi) {
        ll d = dp.first;
        ll phi = dp.second;
        // 计算 n^{n/d} mod MOD
        ll term = modexp(n % MOD, n / d);
        // 累加 φ(d) * n^{n/d}
        sum = (sum + (phi % MOD) * term) % MOD;
    }
    // 乘以 n 的模逆，完成除以 n 的操作
    ll invN = modexp(n % MOD, MOD - 2);
    ll ans = sum * invN % MOD;
    return ans;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    // 预处理：生成足够大的质数表以便后续因数分解
    sieve(40000);

    int t;
    if (!(cin >> t)) return 0;
    while (t--) {
        ll n;
        cin >> n;
        ll ans = solveOne(n);
        cout << ans << "\n";
    }
    return 0;
}

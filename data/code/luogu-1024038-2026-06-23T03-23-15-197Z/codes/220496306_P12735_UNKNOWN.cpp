#include <bits/stdc++.h>
using namespace std;
static const int MOD = 998244353;
static const int MAXN = 1000000 + 5;

long long fac[MAXN], ifac[MAXN];

// 快速幂
long long modpow(long long a, long long e=MOD-2){
    long long r=1;
    while(e){
        if(e&1) r=r*a%MOD;
        a=a*a%MOD;
        e>>=1;
    }
    return r;
}

// 预处理阶乘及逆阶乘
void init_factorials(int n=MAXN-1){
    fac[0]=1;
    for(int i=1;i<=n;i++) fac[i]=fac[i-1]*i%MOD;
    ifac[n]=modpow(fac[n]);
    for(int i=n;i>=1;i--) ifac[i-1]=ifac[i]*i%MOD;
}

// 组合数 C(n,k)
long long C(int n, int k){
    if(n<0||k<0||k>n) return 0;
    return fac[n]*ifac[k]%MOD*ifac[n-k]%MOD;
}

int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, a, b;
    cin >> n >> a >> b;

    init_factorials(n);

    // 中间求和
    long long s = 0;
    for(int m = a; m <= n - b; m++){
        // 从 [1..m] 里选一个 a-环： C(m-1, a-1)*(a-1)!
        // 从 [m+1..n] 里选一个 b-环： C(n-m, b)*(b-1)!
        long long t = C(m-1, a-1) * C(n-m, b) % MOD;
        s = (s + t) % MOD;
    }

    // 再乘上三个阶乘
    long long ans = s;
    ans = ans * fac[a-1] % MOD;
    ans = ans * fac[b-1] % MOD;
    ans = ans * fac[n-a-b] % MOD;

    cout << ans << "\n";
    return 0;
}

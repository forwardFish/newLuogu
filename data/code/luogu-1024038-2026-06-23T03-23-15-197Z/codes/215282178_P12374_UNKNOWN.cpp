#include <bits/stdc++.h>
using namespace std;

static const int MOD = 998244353;
static const int INV2 = 499122177; // (MOD+1)/2

int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    vector<long long> a(n);
    for(int i = 0; i < n; i++){
        cin >> a[i];
    }
    // 预先化简 a[i] mod MOD（因为 a[i] <= 1e9 < 2*MOD）
    vector<int> a_mod(n);
    for(int i = 0; i < n; i++){
        long long v = a[i];
        a_mod[i] = (v >= MOD ? int(v - MOD) : int(v));
    }

    long long answer = 0;
    // 枚举子数组起点 l
    for(int l = 0; l < n; l++){
        long long P = 1; // ∏ d_i mod MOD
        long long F = 0; // 当前 f(l, r) 的值

        // 依次扩展终点 r
        for(int r = l; r < n; r++){
            int k = r - l + 1;              // 子数组长度
            long long ai = a[r];
            // 原始 d = a[r] - k + 1
            long long d_all = ai - k + 1;
            if(d_all <= 0) break;          // 一旦 d<=0，后续都无效

            // d mod MOD（因为 d_all<2*MOD，可用减法替代取模）
            int d_mod = (d_all >= MOD ? int(d_all - MOD) : int(d_all));

            // 计算 S = sum_{x=k..a[r]} x = ((a + k) * (a - k + 1) / 2) mod MOD
            int am = a_mod[r];
            int km = k;
            // t1 = (a_mod + k) % MOD
            int t1 = am + km;
            if(t1 >= MOD) t1 -= MOD;
            // t2 = (a_mod - k + 1) mod MOD
            int t2 = am - km + 1;
            if(t2 < 0) t2 += MOD;
            int S_mod = int((long long)t1 * t2 % MOD * INV2 % MOD);

            // 递推更新 F 和 P
            //   F_new = d_mod * F + S

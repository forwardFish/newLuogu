#include <iostream>
using namespace std;
typedef unsigned long long ull;
const long long MOD = 1000000000LL;    // 最终取模数 10^9
const long long BIG_MOD = 256LL * MOD; // 中间模数 256*10^9

// 快速幂函数：计算 base^exp mod mod_val
long long modExp(long long base, ull exp, long long mod_val) {
    __int128 result = 1;
    __int128 b = base % mod_val;
    while (exp > 0) {
        if (exp & 1ULL) {
            result = (result * b) % mod_val;
        }
        b = (b * b) % mod_val;
        exp >>= 1;
    }
    return (long long)result;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    while (true) {
        ull n;
        cin >> n;
        if (!cin || n == 0) break; // 0 结束输入

        // 计算 2^n mod (256*10^9) 和 3^n mod (256*10^9)
        long long pow2 = modExp(2, n, BIG_MOD);
        long long pow3 = modExp(3, n, BIG_MOD);

        // 构造 4^n, 8^n, 12^n
        __int128 pow4 = (__int128)pow2 * pow2 % BIG_MOD; // 4^n
        __int128 pow8 = pow4 * pow2 % BIG_MOD;           // 8^n = 4^n * 2^n
        __int128 pow12 = pow3 * pow4 % BIG_MOD;          // 12^n = 3^n * 4^n

        // 根据 n 的奇偶计算公式：12^n - 4*8^n + (7 or 5)*4^n
        __int128 num = pow12;
        num -= (__int128)4 * pow8; // -4*8^n
        if ((n & 1ULL) == 0) {
            // n 偶数: (-4)^n = +4^n, 系数+7
            num += (__int128)7 * pow4;
        } else {
            // n 奇数: (-4)^n = -4^n, 系数+5
            num += (__int128)5 * pow4;
        }
        // 对结果取模并移至非负
        long long num_mod = (long long)(num % BIG_MOD);
        if (num_mod < 0) num_mod += BIG_MOD;

        // 除以256得到最终计数，然后对10^9取模
        long long result = (num_mod / 256) % MOD;
        cout << result << '\n';
    }
    return 0;
}

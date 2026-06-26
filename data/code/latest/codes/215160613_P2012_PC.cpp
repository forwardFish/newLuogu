#include <iostream>
using namespace std;

/*
 本代码用于计算满足特定基因序列约束条件的序列数。
 问题描述：给定基因序列长度 n，序列字符集包括普通基因 {A, C, G, T} (4 种)和特殊基因 {乾、兑、离、震、巽、坎、艮、坤} (8 种)。
 其中，阳性字符 (乾、坎、艮、震) 在序列中出现次数必须为奇数；阴性字符 (坤、兑、离、巽) 在序列中出现次数必须为偶数。
 普通字符次数无限制。问满足上述条件的长度为 n 的序列数量，对 10^9 取模。

 分析：
 令总字符数为12(4普通 + 8特殊)。对每个特殊字符计数的奇偶性有要求，可以使用包含-排除或离散傅里叶技巧计算符合要求的序列数。
 经过推导可得，符合条件的序列数为：
   K(n) = (1/256) * (12^n - 4 * 8^n + 6 * 4^n + (-4)^n)
 公式中 256 = 2^8 是因为共有8个特殊字符，每个奇偶约束贡献因子1/2^8。

 我们需要对 10^9 (不是素数) 取模，注意 12^n 等数值很大，n 最大可达 2^63。
 为了高效计算，使用快速幂，并考虑模运算细节：
 由于除以256，直接做模运算会产生除法逆元问题。我们采用如下策略：
   1. 定义大模数 M = 256 * 10^9 (方便保留被256整除的信息)。
   2. 分别计算 base^n mod M。
   3. 计算公式分子 mod M，然后除以256后再取 10^9 模即可。
 
 进一步优化：由于需要计算 12^n,8^n,4^n,(-4)^n，注意到
   12^n = (3 * 4)^n = 3^n * 4^n,
   8^n = 2^(3n) = (2^n)^3,
   4^n = 2^(2n) = (2^n)^2,
   (-4)^n = ±4^n (符号取决于 n 的奇偶).
 我们先计算 2^n mod M 和 3^n mod M，用它们来构造 4^n, 8^n, 12^n, (-4)^n。
 这样只需进行两次快速幂运算 (2^n, 3^n)，减少计算量。

 算法步骤：
 - 读入 n (直到读到 0 结束)。
 - 对每个 n：
    * 计算 pow2 = 2^n mod M, pow3 = 3^n mod M (使用快速幂)。
    * 由此计算 pow4 = pow2 * pow2 mod M (即 4^n), pow8 = pow4 * pow2 mod M (即 8^n), pow12 = pow3 * pow4 mod M (即 12^n)。
    * 根据 n 的奇偶计算公式：num = 12^n - 4*8^n + (7 or 5)*4^n (对 M 取模)。
      如果 n 为偶数，(-4)^n = +4^n，则系数为 +7；如果 n 为奇数，(-4)^n = -4^n，则系数为 +5。
    * 确保 num 在 [0, M) 范围内，再除以256得到 K = num/256。
    * 输出 K mod (10^9)。
 - 使用快速幂时采用 128 位中间运算以防止溢出。

 时间复杂度：每个 n 执行两次 O(log n) 的快速幂，总体约 O(T * log n)，T<=2e5，应能在时间限制内完成。
*/

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

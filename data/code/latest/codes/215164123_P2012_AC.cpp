#include <bits/stdc++.h>
using namespace std;

/*
    题目分析：
    给定 n，要求 K(n) = (1/256)*(12^n - 4*8^n + 6*4^n + (-4)^n) mod 1e9。
    n 最大 <2^63，多组询问最多 2e5 组。
    直接 fast mod pow 需要注意除以256及模数组合问题，因为 1e9=10^9=2^9*5^9，256=2^8。
    发现公式数值(12^n - 4*8^n + 6*4^n + (-4)^n)总是 256 的倍数，所以结果是整数。
    
    计算思路：
    - 将问题拆分模 2^17 和模 5^9 进行计算，然后用中国剩余定理合并：
      1. 因为 n>=9 时，12^n,8^n,4^n,(-4)^n 在 mod 2^17 (131072) 下均为0（因为底数均含2的高次幂），所以公式在 mod 2^17 下结果为0。故 X mod 2^17=0。
         将 X = 12^n - 4*8^n + 6*4^n + (-4)^n。
         可知 n>=9 时 X ≡ 0 (mod 2^17)，进一步 Y = X/256 mod 2^9 也为0。
      2. 在 mod 5^9 下 (1953125)，使用快速幂计算 12^n,8^n,4^n,(-4)^n mod 5^9，然后计算 X5 = (12^n - 4*8^n + 6*4^n + (-4)^n) mod 5^9。
         由于 256 与 5^9 互质，求逆，Y5 = X5 * inv(256) mod 5^9。
      3. 由中国剩余定理合并 Y = Y mod 2^9 (2^9=512, 由上步结果为0) 和 Y mod 5^9 (Y5)。
         即求 Y 满足 Y ≡ 0 (mod 512) 且 Y ≡ Y5 (mod 1953125)。
         设 Y = Y5 + k*1953125，代入模 512 得 k * (1953125 mod 512) ≡ -Y5 (mod 512)。
         计算 1953125 mod 512 = 357，逆元 357^{-1} mod 512 = 109（可预先计算）。
         得 k = (-Y5 * 109) mod 512。令 diff = (512 - Y5 mod 512) mod 512，则 k = diff * 109 mod 512。
         最终 Y = Y5 + k*1953125，答案为 Y mod 1e9。
    - 特殊情况：n<9 时，直接用公式计算（因数值较小直接整除256得到精确整数），并取 mod 1e9。
    - 因为查询多且 n 可达 2^63，快速幂取模用于 5^9，以 n mod phi(5^9)=1562500 降低次数，phi(5^9)=5^9-5^8=1562500。
    - 预计算 256 在 5^9 上的逆元为 inv256_mod5 = 1121521；同时计算 1953125 mod 512 = 357 及其逆元 109。
*/

// 模数常量
static const int MOD2 = 131072;     // 2^17
static const int MOD5 = 1953125;    // 5^9
static const int INV256_MOD5 = 1121521; // 256 取 5^9 模的逆元（precomputed）
static const int INV357_MOD512 = 109;   // 357 的模 512 (2^9) 逆元

// 快速幂：计算 (base^exp) mod mod (使用 128 位乘法防溢出)
long long mod_pow(long long base, long long exp, int mod) {
    long long result = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1LL) result = (__int128)result * base % mod;
        base = (__int128)base * base % mod;
        exp >>= 1LL;
    }
    return result;
}

// 预计算 n<9 时的 K(n) 精确值 mod 1e9（直接通过公式算，数值较小）
long long Ksmall[9] = {
    0,       // 0 不使用
    0,       // n=1
    0,       // n=2
    0,       // n=3
    24,      // n=4
    480,     // n=5
    7680,    // n=6
    107520,  // n=7
    1419264  // n=8
};

// 快速输入输出设置
static const int IN_BUF = 1<<20;
static char inbuf[IN_BUF];
static int inpos = 0, inlen = 0;
inline char readChar() {
    if (inpos == inlen) {
        inpos = 0;
        inlen = fread(inbuf, 1, IN_BUF, stdin);
        if (inlen == 0) return EOF;
    }
    return inbuf[inpos++];
}
inline bool readULL(unsigned long long &x) {
    char c; x = 0;
    do {
        c = readChar();
        if (c == EOF) return false;
    } while (c < '0' || c > '9');
    for (; c >= '0' && c <= '9'; c = readChar()) {
        x = x * 10 + (c - '0');
    }
    return true;
}

static const int OUT_BUF = 1<<20;
static char outbuf[OUT_BUF];
static int outpos = 0;
inline void flushOut() {
    fwrite(outbuf, 1, outpos, stdout);
    outpos = 0;
}
inline void writeULL(unsigned long long x) {
    if (x == 0) {
        outbuf[outpos++] = '0';
    } else {
        char s[32];
        int n = 0;
        while (x > 0) {
            s[n++] = char('0' + (x % 10));
            x /= 10;
        }
        while (n--) outbuf[outpos++] = s[n];
    }
    outbuf[outpos++] = '\n';
    if (outpos > OUT_BUF - 50) flushOut();
}

int main() {
    unsigned long long n;
    while (readULL(n)) {
        if (n == 0) break; // 输入0结束
        long long ans = 0;
        if (n < 9) {
            // n<9 直接输出预计算结果
            ans = Ksmall[n] % 1000000000;
        } else {
            // n>=9，使用模5^9和模2^9的方法
            long long exp = n % 1562500;        // 5^9 的 phi 值
            if (exp == 0) exp = 1562500;
            long long p12 = mod_pow(12, exp, MOD5);
            long long p8  = mod_pow(8,  exp, MOD5);
            long long p4  = mod_pow(4,  exp, MOD5);
            long long pm4 = (n & 1ULL) ? (MOD5 - p4) : p4; // (-4)^n mod 5^9
            long long X5 = (p12 - 4LL*p8 + 6LL*p4 + pm4) % MOD5;
            if (X5 < 0) X5 += MOD5;
            long long Y5 = (X5 * INV256_MOD5) % MOD5; // 除以256
            // 合并 CRT：Y ≡ 0 (mod 512), Y ≡ Y5 (mod 1953125)
            int Y5_mod512 = int(Y5 & 511);
            int diff = (512 - Y5_mod512) & 511;  // -Y5 (mod 512)
            int k = (diff * INV357_MOD512) & 511;
            long long Y = Y5 + (long long)k * MOD5;
            ans = Y % 1000000000;
        }
        writeULL((unsigned long long)ans);
    }
    flushOut();
    return 0;
}

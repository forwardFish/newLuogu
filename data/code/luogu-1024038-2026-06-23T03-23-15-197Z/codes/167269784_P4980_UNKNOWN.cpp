#include<bits/stdc++.h>
const int MOD = 1000000007;
long long modPow(long long x, long long y, long long mod) {
    long long result = 1;
    while (y > 0) {
        if (y & 1) result = result * x % mod;
        x = x * x % mod;
        y >>= 1;
    }
    return result;
}
int gcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}
long long polyaCounting(int n, int colors) {
    long long sum = 0;
    for (int k = 0; k < n; ++k) {
        int gcd_nk = gcd(n, k);
        sum = (sum + modPow(colors, gcd_nk, MOD)) % MOD;
    }
    long long n_inv = modPow(n, MOD - 2, MOD);
    return sum * n_inv % MOD;
}
int main() {
    int t;
    std::cin >> t;
    std::vector<int> results;
    while (t--) {
        int n;
        std::cin >> n;
        results.push_back(polyaCounting(n, n));
    }
    for (int result : results) {
        std::cout << result << std::endl;
    }

    return 0;
}

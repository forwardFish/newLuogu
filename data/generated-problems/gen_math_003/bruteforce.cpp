#include <iostream>
using namespace std;

const int MOD = 1000000007;

long long mod_pow(long long a, long long b) {
    long long res = 1;
    while (b) {
        if (b & 1) res = res * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return res;
}

int main() {
    long long n, c, k;
    cin >> n >> c >> k;
    if (n == 1) {
        cout << 1 % MOD << endl;
        return 0;
    }
    if (n == 2) {
        cout << 2 % MOD << endl;
        return 0;
    }
    long long a1 = 1, a2 = 2;
    long long a_n;
    for (long long i = 3; i <= n; ++i) {
        long long term = mod_pow(i, k);
        a_n = (a2 + c * a1 % MOD + term) % MOD;
        a1 = a2;
        a2 = a_n;
    }
    cout << a_n << endl;
    return 0;
}
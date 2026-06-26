#include <iostream>
#include <vector>
#include <cmath>
using namespace std;
const int MOD = 1000000007;
long long mod_pow(long long base, long long exp, long long mod) {
    long long result = 1;
    while (exp > 0) {
        if (exp % 2 == 1) {
            result = (result * base) % mod;
        }
        base = (base * base) % mod;
        exp /= 2;
    }
    return result;
}
int gcd(int a, int b) {
    return b == 0 ? a : gcd(b, a % b);
}
long long count_colorings(int n) {
    long long result = 0;
    for (int r = 0; r < n; ++r) {
        int g = gcd(n, r);
        result = (result + mod_pow(n, g, MOD)) % MOD;
    }
    return (result * mod_pow(n, MOD - 2, MOD)) % MOD;
}

int main() {
    int t;
    cin >> t;
    vector<int> results(t);
    for (int i = 0; i < t; ++i) {
        int n;
        cin >> n;
        results[i] = count_colorings(n);
    }
    for (int i = 0; i < t; ++i) {
        cout << results[i] << endl;
    }
    return 0;
}

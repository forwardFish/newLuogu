#include <iostream>
#include <map>
using namespace std;
const int MOD = 1e9 + 7;
map<int, int> prime_factorization(int n) {
    map<int, int> factors;
    for (int i = 2; i * i <= n; ++i) {
        while (n % i == 0) {
            factors[i]++;
            n /= i;
        }
    }
    if (n > 1) {
        factors[n]++;
    }
    return factors;
}
int count_divisors(const map<int, int>& factors) {
    long long result = 1;
    for (auto& p : factors) {
        result = (result * (p.second + 1)) % MOD;
    }
    return static_cast<int>(result);
}

int main() {
    int n;
    cin >> n;

    map<int, int> total_factors;

    for (int i = 0; i < n; ++i) {
        int a;
        cin >> a;
        map<int, int> factors = prime_factorization(a);
        for (auto& p : factors) {
            total_factors[p.first] += p.second;
        }
    }

    int result = count_divisors(total_factors);
    cout << result << endl;

    return 0;
}

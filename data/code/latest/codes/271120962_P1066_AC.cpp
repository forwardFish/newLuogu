
#include <iostream>
#include <vector>
#include <algorithm>
#include <iomanip>

using namespace std;

// BigInt structure to handle large numbers up to 200 digits
struct BigInt {
    vector<int> digits;
    static const int BASE = 1000000000;

    BigInt(int v = 0) {
        if (v == 0) digits.push_back(0);
        while (v > 0) {
            digits.push_back(v % BASE);
            v /= BASE;
        }
    }

    void trim() {
        while (digits.size() > 1 && digits.back() == 0) {
            digits.pop_back();
        }
    }

    BigInt operator+(const BigInt& other) const {
        BigInt res;
        res.digits.clear();
        int carry = 0;
        size_t n = max(digits.size(), other.digits.size());
        res.digits.reserve(n + 1);
        for (size_t i = 0; i < n || carry; ++i) {
            int sum = carry + (i < digits.size() ? digits[i] : 0) + (i < other.digits.size() ? other.digits[i] : 0);
            res.digits.push_back(sum % BASE);
            carry = sum / BASE;
        }
        if (res.digits.empty()) res.digits.push_back(0);
        return res;
    }

    BigInt operator-(const BigInt& other) const {
        BigInt res;
        res.digits.clear();
        res.digits.reserve(digits.size());
        int borrow = 0;
        for (size_t i = 0; i < digits.size(); ++i) {
            int sub = digits[i] - borrow - (i < other.digits.size() ? other.digits[i] : 0);
            if (sub < 0) {
                sub += BASE;
                borrow = 1;
            } else {
                borrow = 0;
            }
            res.digits.push_back(sub);
        }
        res.trim();
        if (res.digits.empty()) res.digits.push_back(0);
        return res;
    }

    void print() const {
        if (digits.empty()) {
            cout << 0;
            return;
        }
        cout << digits.back();
        for (int i = (int)digits.size() - 2; i >= 0; --i) {
            cout << setfill('0') << setw(9) << digits[i];
        }
        cout << endl;
    }
};

// Pascal's triangle for combinations
BigInt C[520][520];

void precomputeCombinations(int n_max) {
    for (int i = 0; i <= n_max; ++i) {
        C[i][0] = BigInt(1);
        for (int j = 1; j <= i; ++j) {
            if (j == i) {
                C[i][j] = BigInt(1);
            } else {
                C[i][j] = C[i-1][j-1] + C[i-1][j];
            }
        }
    }
}

int main() {
    // Optimize I/O operations
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int k, w;
    if (!(cin >> k >> w)) return 0;

    // Maximum value for a digit in base 2^k
    int M = (1 << k) - 1;
    
    // Maximum number of digits n such that (n-1)*k < w
    // This ensures the first digit has at least 1 bit
    int max_n = (w - 1) / k + 1;
    
    // We cannot have more digits than available distinct values (1 to M)
    if (max_n > M) max_n = M;

    // Need at least 2 digits
    if (max_n < 2) {
        cout << 0 << endl;
        return 0;
    }

    // Precompute combinations up to M
    precomputeCombinations(M);

    BigInt total(0);

    // Iterate over possible number of digits n
    for (int n = 2; n <= max_n; ++n) {
        // Calculate available bits for the first digit
        int bits_first = w - (n - 1) * k;
        
        int limit_val;
        if (bits_first >= k) {
            // First digit can be any value from 1 to M
            limit_val = M;
        } else {
            // First digit is limited by available bits
            limit_val = (1 << bits_first) - 1;
        }
        
        // We need to choose n distinct digits from {1, ..., M}
        // such that the smallest digit (first digit) is <= limit_val.
        // Total ways to choose n digits from M is C(M, n).
        // Invalid ways (all digits > limit_val) is C(M - limit_val, n).
        
        BigInt term1 = C[M][n];
        BigInt term2(0);
        int rem_M = M - limit_val;
        
        // Only subtract if we have enough elements to choose n from the remaining
        if (rem_M >= n) {
            term2 = C[rem_M][n];
        }
        
        BigInt term = term1 - term2;
        total = total + term;
    }

    total.print();

    return 0;
}

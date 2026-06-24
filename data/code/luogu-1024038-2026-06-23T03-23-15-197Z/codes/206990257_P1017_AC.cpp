#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n, R;
    cin >> n >> R;
    int original_n = n;
    vector<int> digits;

    if (n == 0) {
        digits.push_back(0);
    } else {
        int abs_base = abs(R);
        while (n != 0) {
            int q = n / R;
            int remainder = n - q * R;
            if (remainder < 0) {
                remainder += abs_base;
                q += 1;
            }
            digits.push_back(remainder);
            n = q;
        }
    }

    reverse(digits.begin(), digits.end());
    string result;
    for (int d : digits) {
        if (d < 10) {
            result += (char)('0' + d);
        } else {
            result += (char)('A' + d - 10);
        }
    }

    cout << original_n << "=" << (result.empty() ? "0" : result) << "(base" << R << ")" << endl;
    return 0;
}
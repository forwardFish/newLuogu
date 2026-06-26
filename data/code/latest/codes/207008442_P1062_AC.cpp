#include <iostream>
using namespace std;

int main() {
    int k, N;
    cin >> k >> N;
    long long result = 0;
    long long power = 1; // 当前k的幂次，初始为k^0=1
    while (N > 0) {
        if (N % 2 == 1) {
            result += power;
        }
        N /= 2;
        power *= k;
    }
    cout << result << endl;
    return 0;
}
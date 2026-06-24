#include <bits/stdc++.h>
using namespace std;

int main() {
    long long l = 1, r = 1000000000000000000LL;

    while (l <= r) {
        long long mid = l + (r - l) / 2;

        cout << mid << endl;  // endl 会自动刷新缓冲区

        int res;
        cin >> res;

        if (res == 0) {
            return 0;  // 猜对后立即结束
        } else if (res == -1) {
            l = mid + 1;  // mid 小于答案
        } else if (res == 1) {
            r = mid - 1;  // mid 大于答案
        }
    }

    return 0;
}
#include <cstdio>
#include <vector>
using namespace std;

const int MAXN = 1e5 + 5;
const int MAXA = 5e5 + 5;

int n, m;
vector<int> a(MAXN);

inline int read() {
    int x = 0, f = 1; char ch = getchar();
    while (ch < '0' || ch > '9') { if (ch == '-') f = -1; ch = getchar(); }
    while (ch >= '0' && ch <= '9') { x = x * 10 + ch - '0'; ch = getchar(); }
    return x * f;
}

inline void write(long long x) {
    if (x < 0) { putchar('-'); x = -x; }
    if (x > 9) write(x / 10);
    putchar(x % 10 + '0');
}

int main() {
    n = read(); m = read();
    for (int i = 1; i <= n; ++i) {
        a[i] = read();
    }

    while (m--) {
        int op = read(), l = read(), r = read();
        if (op == 1) {
            int x = read();
            for (int i = l; i <= r; ++i) {
                if (a[i] % x == 0) {
                    a[i] /= x;
                }
            }
        } else if (op == 2) {
            long long sum = 0;
            for (int i = l; i <= r; ++i) {
                sum += a[i];
            }
            write(sum); putchar('\n');
        }
    }

    return 0;
}

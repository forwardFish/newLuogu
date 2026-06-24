#include <cstdio>
#include <vector>
using namespace std;

const int MAXN = 1e5 + 5;
const int MAXA = 5e5 + 5;

int n, m;
vector<int> a(MAXN);
vector<long long> bit(MAXN);

void add(int x, int v) {
    for (; x <= n; x += x & -x) {
        bit[x] += v;
    }
}

long long sum(int x) {
    long long s = 0;
    for (; x > 0; x -= x & -x) {
        s += bit[x];
    }
    return s;
}

long long query(int l, int r) {
    return sum(r) - sum(l - 1);
}

void update(int l, int r, int x) {
    for (int i = l; i <= r; ++i) {
        if (a[i] % x == 0) {
            int old = a[i];
            a[i] /= x;
            add(i, a[i] - old);
        }
    }
}

int main() {
    scanf("%d %d", &n, &m);
    for (int i = 1; i <= n; ++i) {
        scanf("%d", &a[i]);
        add(i, a[i]);
    }

    while (m--) {
        int op, l, r, x;
        scanf("%d %d %d", &op, &l, &r);
        if (op == 1) {
            scanf("%d", &x);
            update(l, r, x);
        } else if (op == 2) {
            printf("%lld\n", query(l, r));
        }
    }

    return 0;
}

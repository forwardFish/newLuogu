#include <iostream>
#include <vector>
using namespace std;

const int MAXN = 1e9 + 5;
const int MAXA = 5e9 + 5;

int n, m;
int a[MAXN];
long long sum[MAXN * 4];

void build(int node, int start, int end) {
    if (start == end) {
        sum[node] = a[start];
    } else {
        int mid = (start + end) / 2;
        build(node * 2, start, mid);
        build(node * 2 + 1, mid + 1, end);
        sum[node] = sum[node * 2] + sum[node * 2 + 1];
    }
}

void update(int node, int start, int end, int idx, int val) {
    if (start == end) {
        sum[node] = val;
    } else {
        int mid = (start + end) / 2;
        if (idx <= mid) {
            update(node * 2, start, mid, idx, val);
        } else {
            update(node * 2 + 1, mid + 1, end, idx, val);
        }
        sum[node] = sum[node * 2] + sum[node * 2 + 1];
    }
}

long long query(int node, int start, int end, int l, int r) {
    if (r < start || end < l) {
        return 0;
    }
    if (l <= start && end <= r) {
        return sum[node];
    }
    int mid = (start + end) / 2;
    long long p1 = query(node * 2, start, mid, l, r);
    long long p2 = query(node * 2 + 1, mid + 1, end, l, r);
    return p1 + p2;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);

    cin >> n >> m;
    for (int i = 1; i <= n; ++i) {
        cin >> a[i];
    }

    build(1, 1, n);

    while (m--) {
        int op, l, r, x;
        cin >> op >> l >> r;
        if (op == 1) {
            cin >> x;
            for (int i = l; i <= r; ++i) {
                if (a[i] % x == 0) {
                    a[i] /= x;
                    update(1, 1, n, i, a[i]);
                }
            }
        } else if (op == 2) {
            cout << query(1, 1, n, l, r) << '\n';
        }
    }

    return 0;
}

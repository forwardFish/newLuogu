#include <iostream>
#include <vector>
using namespace std;

const int MAXN = 1e5 + 5;
const int MAXA = 5e5 + 5;

int n, m;
vector<int> a(MAXN);

struct Node {
    int l, r;
    long long sum;
} tree[MAXN * 4];

void build(int node, int l, int r) {
    tree[node].l = l;
    tree[node].r = r;
    if (l == r) {
        tree[node].sum = a[l];
        return;
    }
    int mid = (l + r) / 2;
    build(node * 2, l, mid);
    build(node * 2 + 1, mid + 1, r);
    tree[node].sum = tree[node * 2].sum + tree[node * 2 + 1].sum;
}

long long query(int node, int l, int r) {
    if (tree[node].l >= l && tree[node].r <= r) {
        return tree[node].sum;
    }
    int mid = (tree[node].l + tree[node].r) / 2;
    long long sum = 0;
    if (l <= mid) sum += query(node * 2, l, r);
    if (r > mid) sum += query(node * 2 + 1, l, r);
    return sum;
}

void update(int node, int l, int r, int x) {
    if (tree[node].l == tree[node].r) {
        if (tree[node].sum % x == 0) {
            tree[node].sum /= x;
        }
        return;
    }
    int mid = (tree[node].l + tree[node].r) / 2;
    if (l <= mid) update(node * 2, l, r, x);
    if (r > mid) update(node * 2 + 1, l, r, x);
    tree[node].sum = tree[node * 2].sum + tree[node * 2 + 1].sum;
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
            update(1, l, r, x);
        } else if (op == 2) {
            cout << query(1, l, r) << '\n';
        }
    }

    return 0;
}

#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
#include <cmath>
using namespace std;

struct Chord {
    int sum, start, l, r, t;
    bool operator<(const Chord &other) const {
        return sum < other.sum;
    }
    Chord(int s, int st, int ll, int rr, int tt) : sum(s), start(st), l(ll), r(rr), t(tt) {}
};

vector<vector<int>> st;
vector<int> prefix;

void buildST(int n) {
    int k = log2(n) + 1;
    st.resize(n + 1, vector<int>(k));
    for (int i = 0; i <= n; ++i) {
        st[i][0] = i;
    }
    for (int j = 1; (1 << j) <= n; ++j) {
        for (int i = 0; i + (1 << j) - 1 <= n; ++i) {
            if (prefix[st[i][j - 1]] > prefix[st[i + (1 << (j - 1))][j - 1]]) {
                st[i][j] = st[i][j - 1];
            } else {
                st[i][j] = st[i + (1 << (j - 1))][j - 1];
            }
        }
    }
}

int queryST(int l, int r) {
    int k = log2(r - l + 1);
    if (prefix[st[l][k]] > prefix[st[r - (1 << k) + 1][k]]) {
        return st[l][k];
    } else {
        return st[r - (1 << k) + 1][k];
    }
}

int main() {
    int n, k, L, R;
    cin >> n >> k >> L >> R;
    vector<int> A(n + 1);
    prefix.resize(n + 1);
    for (int i = 1; i <= n; ++i) {
        cin >> A[i];
        prefix[i] = prefix[i - 1] + A[i];
    }

    buildST(n);

    priority_queue<Chord> pq;
    for (int i = 1; i <= n; ++i) {
        if (i + L - 1 <= n) {
            int l = i + L - 1;
            int r = min(n, i + R - 1);
            int t = queryST(l, r);
            int sum = prefix[t] - prefix[i - 1];
            pq.push(Chord(sum, i, l, r, t));
        }
    }

    long long ans = 0;
    for (int i = 0; i < k; ++i) {
        Chord top = pq.top();
        pq.pop();
        ans += top.sum;
        if (top.l < top.t) {
            int t = queryST(top.l, top.t - 1);
            int sum = prefix[t] - prefix[top.start - 1];
            pq.push(Chord(sum, top.start, top.l, top.t - 1, t));
        }
        if (top.t < top.r) {
            int t = queryST(top.t + 1, top.r);
            int sum = prefix[t] - prefix[top.start - 1];
            pq.push(Chord(sum, top.start, top.t + 1, top.r, t));
        }
    }

    cout << ans << endl;
    return 0;
}

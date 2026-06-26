#include <iostream>
#include <vector>

using namespace std;

vector<int> simulate(int n, int x, long long k) {
    vector<int> players(n);
    for (int i = 0; i < n; ++i) {
        players[i] = i + 1;
    }
    int dir = x; // 0: left, 1: right
    long long period = 2 * n;
    k %= period;
    int mid = (n - 1) / 2;
    for (long long step = 0; step < k; ++step) {
        int m = (players.size() - 1) / 2;
        int val = players[m];
        players.erase(players.begin() + m);
        if (dir == 0) {
            players.insert(players.begin(), val);
        } else {
            players.push_back(val);
        }
        dir = 1 - dir;
    }
    return players;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int T;
    cin >> T;
    while (T--) {
        int n, x;
        long long k;
        cin >> n >> x >> k;
        vector<int> res = simulate(n, x, k);
        for (int num : res) {
            cout << num << ' ';
        }
        cout << '\n';
    }
    return 0;
}
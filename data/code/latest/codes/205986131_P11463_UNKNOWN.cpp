#include <iostream>
#include <vector>

using namespace std;

vector<int> simulate(int n, int x, long long k) {
    vector<int> players(n);
    for (int i = 0; i < n; ++i) players[i] = i + 1;
    
    int dir = x; // 0: left, 1: right
    k %= 2 * n; // 利用周期性，减少模拟次数
    
    int mid = (n - 1) / 2;
    for (int step = 0; step < k; ++step) {
        // 每次操作只需处理中间元素，其余元素无需实际移动
        mid = (players.size() - 1) / 2;
        int val = players[mid];
        players.erase(players.begin() + mid);
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
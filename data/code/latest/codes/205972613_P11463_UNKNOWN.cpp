#include <iostream>
#include <vector>
#include <map>

using namespace std;

vector<int> simulate(int n, int x, long long k) {
    vector<int> players(n);
    for (int i = 0; i < n; ++i) {
        players[i] = i + 1;
    }

    int mid = n / 2;
    int dir = x; // 0: left, 1: right

    map<vector<int>, long long> stateMap;
    long long step = 0;

    while (step < k) {
        if (stateMap.find(players) != stateMap.end()) {
            long long cycle = step - stateMap[players];
            long long remaining = k - step;
            step += (remaining / cycle) * cycle;
            if (step >= k) break;
        }
        stateMap[players] = step;

        int player = players[mid];
        if (dir == 0) {
            players.erase(players.begin() + mid);
            players.insert(players.begin(), player);
        } else {
            players.erase(players.begin() + mid);
            players.push_back(player);
        }

        dir = 1 - dir;
        step++;
    }

    return players;
}

int main() {
    int T;
    cin >> T;
    while (T--) {
        int n, x;
        long long k;
        cin >> n >> x >> k;
        vector<int> result = simulate(n, x, k);
        for (int i = 0; i < n; ++i) {
            cout << result[i] << " ";
        }
        cout << endl;
    }
    return 0;
}
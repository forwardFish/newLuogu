#include <iostream>
#include <vector>
#include <queue>

using namespace std;

int main() {
    int N, A, B;
    cin >> N >> A >> B;
    
    vector<int> K(N+1);
    for (int i = 1; i <= N; ++i) {
        cin >> K[i];
    }
    
    vector<bool> visited(N+1, false);
    queue<pair<int, int>> q;
    q.push({A, 0});
    visited[A] = true;
    
    while (!q.empty()) {
        int current = q.front().first;
        int steps = q.front().second;
        q.pop();
        
        if (current == B) {
            cout << steps << endl;
            return 0;
        }
        
        int up = current + K[current];
        if (up <= N && !visited[up]) {
            q.push({up, steps + 1});
            visited[up] = true;
        }
        
        int down = current - K[current];
        if (down >= 1 && !visited[down]) {
            q.push({down, steps + 1});
            visited[down] = true;
        }
    }
    
    cout << -1 << endl;
    return 0;
}

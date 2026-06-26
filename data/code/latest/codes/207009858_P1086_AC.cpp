#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

struct Point {
    int x, y, p;
};

int main() {
    int M, N, K;
    cin >> M >> N >> K;
    vector<Point> points;
    
    for (int i = 0; i < M; ++i) {
        for (int j = 0; j < N; ++j) {
            int p;
            cin >> p;
            if (p > 0) {
                points.push_back({i + 1, j + 1, p});
            }
        }
    }
    
    sort(points.begin(), points.end(), [](const Point& a, const Point& b) {
        return a.p > b.p;
    });
    
    int t = points.size();
    if (t == 0) {
        cout << 0 << endl;
        return 0;
    }
    
    vector<int> pre_sum(t + 1, 0);
    for (int i = 2; i <= t; ++i) {
        int dx = abs(points[i - 2].x - points[i - 1].x);
        int dy = abs(points[i - 2].y - points[i - 1].y);
        pre_sum[i] = pre_sum[i - 1] + dx + dy;
    }
    
    int max_p = 0;
    for (int m = t; m >= 1; --m) {
        int x1 = points[0].x;
        int xm = points[m - 1].x;
        int total_time = pre_sum[m] + x1 + xm + m;
        if (total_time <= K) {
            int sum = 0;
            for (int i = 0; i < m; ++i) {
                sum += points[i].p;
            }
            if (sum > max_p) {
                max_p = sum;
            }
        }
    }
    
    cout << max_p << endl;
    
    return 0;
}
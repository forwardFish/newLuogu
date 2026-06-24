#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int N, M, K;
    ll A, B, C, T;
    cin >> N >> M >> K;
    cin >> A >> B >> C;
    cin >> T;

    vector<int> S(M);
    for (int i = 0; i < M; ++i) {
        cin >> S[i];
    }

    // 计算每个区间的覆盖范围
    vector<pair<ll, ll>> intervals;
    for (int i = 0; i < M - 1; ++i) {
        ll start = S[i];
        ll end = S[i + 1];
        ll time = (start - 1) * B; // 从1号站点到start的时间
        if (time > T) break;

        ll remaining_time = T - time;
        ll max_reach = start + remaining_time / C;
        max_reach = min(max_reach, end - 1);

        if (max_reach >= start) {
            intervals.emplace_back(start, max_reach);
        }
    }

    // 使用优先队列选择最佳的停靠站点
    priority_queue<pair<ll, ll>> pq;
    for (auto& interval : intervals) {
        ll start = interval.first;
        ll end = interval.second;
        ll count = end - start + 1;
        pq.push({count, start});
    }

    // 选择K - M个额外的停靠站点
    int additional_stops = K - M;
    ll total = 0;
    while (!pq.empty() && additional_stops > 0) {
        auto top = pq.top();
        pq.pop();
        ll count = top.first;
        ll start = top.second;
        ll end = start + count - 1;

        // 选择中间的站点作为停靠站点
        ll mid = (start + end) / 2;
        total += count;
        additional_stops--;

        // 将剩余的区间重新加入优先队列
        if (mid > start) {
            pq.push({mid - start, start});
        }
        if (end > mid) {
            pq.push({end - mid, mid + 1});
        }
    }

    // 计算总覆盖站点数
    ll result = 0;
    for (auto& interval : intervals) {
        ll start = interval.first;
        ll end = interval.second;
        result += end - start + 1;
    }

    cout << result << "\n";

    return 0;
}
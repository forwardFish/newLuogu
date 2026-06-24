#include <iostream>
#include <vector>
#include <random>
#include <set>
#include <algorithm>
#include <numeric>
using namespace std;

int main(int argc, char* argv[]) {
    if (argc < 4) {
        cerr << "Usage: generator subtask N M [seed]" << endl;
        return 1;
    }
    int subtask = atoi(argv[1]);
    int N = atoi(argv[2]);
    int M = atoi(argv[3]);
    unsigned int seed = (argc >= 5) ? atoi(argv[4]) : random_device{}();
    mt19937 rng(seed);

    if (subtask == 1) {
        if (N > 10) N = 10;
        if (M > 45) M = 45;
    } else if (subtask == 2) {
        if (N > 1000) N = 1000;
        if (M > 5000) M = 5000;
    } else {
        if (N > 100000) N = 100000;
        if (M > 200000) M = 200000;
    }

    if (N == 1) {
        cout << "1 0\n";
        uniform_int_distribution<int> col_dis(0, 1);
        cout << col_dis(rng) << endl;
        return 0;
    }

    if (M < 1) M = 1;
    long long maxEdges = (long long)N * (N - 1) / 2;
    if (M > maxEdges) M = maxEdges;

    vector<int> order(N + 1);
    iota(order.begin(), order.end(), 0);
    if (subtask != 2) {
        vector<int> rest(N - 2);
        iota(rest.begin(), rest.end(), 2);
        shuffle(rest.begin(), rest.end(), rng);
        int p = 0;
        for (int i = 2; i <= N - 1; ++i) order[i] = rest[p++];
    }

    set<long long> edges;
    edges.insert(((long long)order[1] << 32) | order[N]);

    uniform_int_distribution<int> idx_dis(1, N);
    while ((int)edges.size() < M) {
        int i = idx_dis(rng);
        int j = idx_dis(rng);
        if (i == j) continue;
        if (i > j) swap(i, j);
        int u = order[i];
        int v = order[j];
        edges.insert(((long long)u << 32) | v);
    }

    cout << N << " " << M << "\n";
    uniform_int_distribution<int> col_dis(0, 1);
    for (int i = 1; i <= N; ++i) {
        cout << col_dis(rng) << (i == N ? '\n' : ' ');
    }
    for (auto&& key : edges) {
        int u = key >> 32;
        int v = key & ((1LL << 32) - 1);
        cout << u << " " << v << "\n";
    }
    return 0;
}
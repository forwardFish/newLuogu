#include <bits/stdc++.h>
using namespace std;

int main(int argc, char* argv[]) {
    int N = 5000, M = 500;
    unsigned seed = chrono::steady_clock::now().time_since_epoch().count();
    string type = "random";
    if (argc >= 3) {
        N = atoi(argv[1]);
        M = atoi(argv[2]);
    }
    if (argc >= 4) {
        seed = atoi(argv[3]);
    }
    if (argc >= 5) {
        type = argv[4];
    }
    mt19937 rng(seed);
    uniform_int_distribution<int> val_dist(1, 1000000000);
    if (type == "small") val_dist = uniform_int_distribution<int>(1, 1000);
    vector<int> A(N);
    if (type == "random") {
        for (int i=0; i<N; ++i) A[i] = val_dist(rng);
    } else if (type == "inc") {
        for (int i=0; i<N; ++i) A[i] = val_dist(rng) + (i > 0 ? A[i-1] : 0);
    } else if (type == "dec") {
        for (int i=0; i<N; ++i) A[i] = val_dist(rng) + (i > 0 ? A[i-1] + 1 : 0);
        reverse(A.begin(), A.end());
    } else if (type == "equal") {
        int v = val_dist(rng);
        fill(A.begin(), A.end(), v);
    } else {
        for (int i=0; i<N; ++i) A[i] = val_dist(rng);
    }
    if (M > N) M = N;
    cout << N << ' ' << M << '\n';
    for (int i=0; i<N; ++i) {
        cout << A[i] << (i==N-1 ? '\n' : ' ');
    }
    return 0;
}
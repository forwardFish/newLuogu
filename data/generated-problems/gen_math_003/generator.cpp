#include <iostream>
#include <random>
#include <cassert>
using namespace std;

int main(int argc, char* argv[]) {
    if (argc < 3) {
        cerr << "Usage: " << argv[0] << " subtask seed\n";
        return 1;
    }
    int subtask = stoi(argv[1]);
    int seed = stoi(argv[2]);
    mt19937_64 rng(seed);
    long long n, c, k;
    c = uniform_int_distribution<long long>(0, 1000000000)(rng);
    if (subtask == 1) {
        n = uniform_int_distribution<long long>(1, 1000)(rng);
        k = 0;
    } else if (subtask == 2) {
        n = uniform_int_distribution<long long>(1, 1000000000)(rng);
        k = uniform_int_distribution<int>(0, 2)(rng);
    } else if (subtask == 3) {
        n = uniform_int_distribution<long long>(1, 1000000000000000000LL)(rng);
        k = uniform_int_distribution<int>(0, 10)(rng);
    } else {
        cerr << "Invalid subtask\n";
        return 1;
    }
    cout << n << " " << c << " " << k << endl;
    return 0;
}
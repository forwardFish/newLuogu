#include<bits/stdc++.h>
using namespace std;
int main() {
    long long n, a, b, c;
    cin >> n >> a >> b >> c;
    long long remainder = n % 4;
    long long cost_1 = min(a, min(b * 2, c * 3));
    long long cost_2 = min(b, min(a * 2, c));
    long long cost_3 = min(c, min(a * 3, b * 2));
    long long min_cost = min(cost_1, min(cost_2 + cost_1, min(cost_3 + cost_2 * 2, cost_3 * 3 + cost_2)));
    cout << min_cost << endl;
    return 0;
}

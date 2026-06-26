#include <iostream>
#include <vector>
#include <iomanip>
using namespace std;
bool canCut(const vector<double>& lengths, int k, double length)
{
    int count = 0;
    for (double l : lengths)
	{
        count += static_cast<int>(l / length);
    }
    return count >= k;
}
double findMaxLength(const vector<double>& lengths, int k)
{
    double left = 0.0;
    double right = 100000.0;
    double mid;
    for (int i = 0; i < 100; ++i) {
        mid = (left + right) / 2.0;
        if (canCut(lengths, k, mid)) {
            left = mid;
        } else {
            right = mid;
        }
    }

    return left;
}
int main() {
    int n, k;
    cin >> n >> k;
    vector<double> lengths(n);
    for (int i = 0; i < n; ++i) {
        cin >> lengths[i];
    }

    double result = findMaxLength(lengths, k);
    cout << fixed << setprecision(4) << result << endl;

    return 0;
}

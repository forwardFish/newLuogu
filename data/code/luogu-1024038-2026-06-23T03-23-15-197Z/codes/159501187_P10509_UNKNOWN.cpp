#include <iostream>
using namespace std;
int main() {
    const int n = 2023;
    long long total_cells = static_cast<long long>(n) * n;
    long long max_parking_slots = total_cells / 2;
    cout << max_parking_slots << std::endl;
    return 0;
}

#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <climits>
#include <limits>
using namespace std;

const double INF = numeric_limits<double>::infinity();

struct Price {
    int price;
    int sales;
    Price(int p, int s) : price(p), sales(s) {}
};

int expected_price;
int cost, sales_at_cost;
vector<Price> known_prices;
int d;

void read_input() {
    cin >> expected_price;
    cin >> cost >> sales_at_cost;
    known_prices.push_back(Price(cost, sales_at_cost));
    int p, s;
    while (cin >> p >> s && !(p == -1 && s == -1)) {
        known_prices.push_back(Price(p, s));
    }
    sort(known_prices.begin(), known_prices.end(), [](const Price& a, const Price& b) {
        return a.price < b.price;
    });
    cin >> d;
}

vector<int> generate_all_p() {
    vector<int> all_p;
    int max_known = known_prices.back().price;
    for (int p = cost; p <= max_known; ++p) {
        all_p.push_back(p);
    }
    int last_p = max_known;
    int last_s = known_prices.back().sales;
    int current_p = last_p + 1;
    while (true) {
        int s = last_s - d * (current_p - last_p);
        if (s <= 0) break;
        all_p.push_back(current_p);
        current_p++;
    }
    sort(all_p.begin(), all_p.end());
    all_p.erase(unique(all_p.begin(), all_p.end()), all_p.end());
    return all_p;
}

int get_sales(int p) {
    if (p < cost) return 0;
    for (const Price& ps : known_prices) {
        if (ps.price == p) return ps.sales;
    }
    if (p > known_prices.back().price) {
        int delta = p - known_prices.back().price;
        int s = known_prices.back().sales - d * delta;
        return max(s, 0);
    }
    for (size_t i = 1; i < known_prices.size(); ++i) {
        int p_prev = known_prices[i-1].price;
        int p_curr = known_prices[i].price;
        if (p_prev < p && p < p_curr) {
            int delta_p = p - p_prev;
            int total_p = p_curr - p_prev;
            int delta_s = known_prices[i].sales - known_prices[i-1].sales;
            return known_prices[i-1].sales + (delta_s * delta_p) / total_p;
        }
    }
    return 0;
}

int main() {
    read_input();
    vector<int> all_p = generate_all_p();
    auto it = find(all_p.begin(), all_p.end(), expected_price);
    if (it == all_p.end()) {
        cout << "NO SOLUTION" << endl;
        return 0;
    }
    int p0 = expected_price;
    int s0 = get_sales(p0);
    if (s0 == 0) {
        cout << "NO SOLUTION" << endl;
        return 0;
    }
    vector<double> lower_bounds, upper_bounds;
    for (int p : all_p) {
        if (p == p0) continue;
        int s_p = get_sales(p);
        if (s_p == 0) continue;
        if (s_p == s0) {
            if (p > p0) {
                cout << "NO SOLUTION" << endl;
                return 0;
            }
            continue;
        }
        long long A = (long long)(p0 - cost) * s0 - (long long)(p - cost) * s_p;
        int B = s_p - s0;
        if (B == 0) continue;
        double critical = (double)A / B;
        if (B > 0) {
            upper_bounds.push_back(critical);
        } else {
            lower_bounds.push_back(critical);
        }
    }
    double max_lower = -INF;
    if (!lower_bounds.empty()) {
        max_lower = *max_element(lower_bounds.begin(), lower_bounds.end());
    }
    double min_upper = INF;
    if (!upper_bounds.empty()) {
        min_upper = *min_element(upper_bounds.begin(), upper_bounds.end());
    }
    double start_x = lower_bounds.empty() ? -INF : ceil(max_lower);
    double end_x = upper_bounds.empty() ? INF : floor(min_upper);
    if (start_x > end_x) {
        cout << "NO SOLUTION" << endl;
        return 0;
    }
    int x = 0;
    if (start_x <= 0 && 0 <= end_x) {
        x = 0;
    } else {
        if (start_x > 0) {
            x = ceil(start_x);
        } else {
            x = floor(end_x);
        }
    }
    bool valid = true;
    int profit0 = (p0 - cost + x) * s0;
    for (int p : all_p) {
        if (p == p0) continue;
        int s_p = get_sales(p);
        if (s_p == 0) continue;
        int profit_p = (p - cost + x) * s_p;
        if (profit_p > profit0) {
            valid = false;
            break;
        }
    }
    if (valid) {
        cout << x << endl;
    } else {
        cout << "NO SOLUTION" << endl;
    }
    return 0;
}
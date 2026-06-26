#include <iostream>
#include <vector>
#include <set>
#include <algorithm>
#include <map>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m, q;
    cin >> n >> m >> q;

    vector<pair<int, int>> pens(n);
    vector<multiset<int>> color_pens(m);
    vector<int> color_max(m, -1);
    vector<int> color_second_max(m, -1);
    multiset<int> max_values;
    multiset<int> all_p;

    for (int i = 0; i < n; ++i) {
        int c, p;
        cin >> c >> p;
        --c;
        pens[i] = {c, p};
        color_pens[c].insert(p);
        all_p.insert(p);
    }

    for (int c = 0; c < m; ++c) {
        if (!color_pens[c].empty()) {
            color_max[c] = *color_pens[c].rbegin();
            if (color_pens[c].size() >= 2) {
                color_second_max[c] = *next(color_pens[c].rbegin());
            }
            max_values.insert(color_max[c]);
        }
    }

    auto update_max_values = [&](int c, int old_max, int new_max) {
        if (old_max != -1) {
            max_values.erase(max_values.find(old_max));
        }
        if (new_max != -1) {
            max_values.insert(new_max);
        }
    };

    auto update_all_p = [&](int old_p, int new_p) {
        all_p.erase(all_p.find(old_p));
        all_p.insert(new_p);
    };

    auto get_min_max = [&]() {
        return max_values.empty() ? 0 : *max_values.begin();
    };

    for (int step = 0; step <= q; ++step) {
        int sum_max = 0;
        for (int c = 0; c < m; ++c) {
            sum_max += color_max[c];
        }

        int min_max = get_min_max();
        int max_p = all_p.empty() ? 0 : *all_p.rbegin();

        vector<int> candidates;
        for (int i = 0; i < n; ++i) {
            if (pens[i].second == max_p) {
                candidates.push_back(i);
            }
        }

        int max_delta = 0;
        for (int i : candidates) {
            int c_i = pens[i].first;
            int p_i = pens[i].second;
            int current_max_c_i = color_max[c_i];
            int loss = (p_i == current_max_c_i) ? (color_second_max[c_i] - current_max_c_i) : 0;
            int gain = max(p_i - min_max, 0);
            int delta = gain + loss;
            if (delta > max_delta) {
                max_delta = delta;
            }
        }

        int total = sum_max + max(max_delta, 0);
        cout << total << '\n';

        if (step < q) {
            int op, idx, val;
            cin >> op >> idx >> val;
            --idx;
            if (op == 1) {
                int old_c = pens[idx].first;
                int new_c = val - 1;
                int p = pens[idx].second;

                color_pens[old_c].erase(color_pens[old_c].find(p));
                int old_max_old_c = color_max[old_c];
                int new_max_old_c = color_pens[old_c].empty() ? -1 : *color_pens[old_c].rbegin();
                int new_second_old_c = color_pens[old_c].size() >= 2 ? *next(color_pens[old_c].rbegin()) : -1;

                if (new_max_old_c != old_max_old_c) {
                    update_max_values(old_c, old_max_old_c, new_max_old_c);
                    color_max[old_c] = new_max_old_c;
                }
                color_second_max[old_c] = new_second_old_c;

                color_pens[new_c].insert(p);
                int old_max_new_c = color_max[new_c];
                int new_max_new_c = *color_pens[new_c].rbegin();
                int new_second_new_c = color_pens[new_c].size() >= 2 ? *next(color_pens[new_c].rbegin()) : -1;

                if (new_max_new_c != old_max_new_c) {
                    update_max_values(new_c, old_max_new_c, new_max_new_c);
                    color_max[new_c] = new_max_new_c;
                }
                color_second_max[new_c] = new_second_new_c;

                pens[idx].first = new_c;
            } else {
                int c = pens[idx].first;
                int old_p = pens[idx].second;
                int new_p = val;

                color_pens[c].erase(color_pens[c].find(old_p));
                int old_max_c = color_max[c];
                int new_max_c = color_pens[c].empty() ? -1 : *color_pens[c].rbegin();
                int new_second_c = color_pens[c].size() >= 2 ? *next(color_pens[c].rbegin()) : -1;

                if (new_max_c != old_max_c) {
                    update_max_values(c, old_max_c, new_max_c);
                    color_max[c] = new_max_c;
                }
                color_second_max[c] = new_second_c;

                color_pens[c].insert(new_p);
                int new_max_c_new = *color_pens[c].rbegin();
                int new_second_c_new = color_pens[c].size() >= 2 ? *next(color_pens[c].rbegin()) : -1;

                if (new_max_c_new != new_max_c) {
                    update_max_values(c, new_max_c, new_max_c_new);
                    color_max[c] = new_max_c_new;
                }
                color_second_max[c] = new_second_c_new;

                update_all_p(old_p, new_p);
                pens[idx].second = new_p;
            }
        }
    }

    return 0;
}
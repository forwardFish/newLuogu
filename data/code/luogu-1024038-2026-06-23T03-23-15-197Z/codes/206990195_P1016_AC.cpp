#include <iostream>
#include <vector>
#include <algorithm>
#include <iomanip>
#include <cmath>

using namespace std;

struct Station {
    double distance;
    double price;
    Station(double d, double p) : distance(d), price(p) {}
};

bool compare(const Station &a, const Station &b) {
    return a.distance < b.distance;
}

int main() {
    double D1, C, D2, P;
    int N;
    cin >> D1 >> C >> D2 >> P >> N;
    
    vector<Station> stations;
    stations.emplace_back(0.0, P); // 起点
    
    for (int i = 0; i < N; ++i) {
        double Di, Pi;
        cin >> Di >> Pi;
        if (Di < D1) { // 只添加在终点之前的加油站
            stations.emplace_back(Di, Pi);
        }
    }
    
    // 按距离排序
    sort(stations.begin(), stations.end(), compare);
    
    // 添加终点
    stations.emplace_back(D1, 0.0);
    
    // 检查相邻加油站之间的距离是否可行
    bool possible = true;
    for (int i = 0; i < stations.size() - 1; ++i) {
        double dist = stations[i+1].distance - stations[i].distance;
        if (dist > C * D2 + 1e-8) { // 考虑浮点精度
            possible = false;
            break;
        }
    }
    if (!possible) {
        cout << "No Solution" << endl;
        return 0;
    }
    
    int current = 0; // 当前所在的加油站索引
    double current_gas = 0.0;
    double total_cost = 0.0;
    const double eps = 1e-8;
    
    while (current < stations.size() - 1) {
        Station curr_station = stations[current];
        double max_reach = curr_station.distance + C * D2;
        
        // 寻找所有可达的加油站中的第一个更便宜的，或者最便宜的
        bool found_cheaper = false;
        int best_cheap = -1;
        // 检查后续加油站是否有价格比当前低的，取最近的
        for (int i = current + 1; i < stations.size(); ++i) {
            if (stations[i].distance > max_reach + eps)
                break;
            if (stations[i].price < curr_station.price - eps) {
                best_cheap = i;
                found_cheaper = true;
                break; // 找到第一个更便宜的就停止
            }
        }
        
        if (found_cheaper) {
            int next_station = best_cheap;
            double distance_needed = stations[next_station].distance - curr_station.distance;
            double gas_needed = distance_needed / D2;
            // 当前油量是否足够？
            if (current_gas < gas_needed) {
                double add = gas_needed - current_gas;
                total_cost += add * curr_station.price;
                current_gas = gas_needed;
            }
            current_gas -= gas_needed;
            current = next_station;
        } else {
            // 没有更便宜的，找可达范围内的最便宜的价格，并且最远
            double min_price = 1e9;
            for (int i = current + 1; i < stations.size(); ++i) {
                if (stations[i].distance > max_reach + eps)
                    break;
                if (stations[i].price < min_price)
                    min_price = stations[i].price;
            }
            if (min_price == 1e9) { // 没有可达的站？理论上不可能，因为已经检查过相邻距离
                cout << "No Solution" << endl;
                return 0;
            }
            // 找到最远的价格等于min_price的站
            int farthest = current + 1;
            for (int i = current + 1; i < stations.size(); ++i) {
                if (stations[i].distance > max_reach + eps)
                    break;
                if (abs(stations[i].price - min_price) < eps) {
                    farthest = i;
                }
            }
            int next_station = farthest;
            double distance_needed = stations[next_station].distance - curr_station.distance;
            double gas_needed = distance_needed / D2;
            
            if (next_station == stations.size() - 1) {
                // 终点，加到刚好够
                if (current_gas < gas_needed) {
                    double add = gas_needed - current_gas;
                    total_cost += add * curr_station.price;
                    current_gas = gas_needed;
                }
                current_gas -= gas_needed;
                current = next_station;
            } else {
                // 加满油
                double add_gas = C - current_gas;
                total_cost += add_gas * curr_station.price;
                current_gas = C;
                current_gas -= gas_needed;
                current = next_station;
            }
        }
    }
    
    // 处理输出，四舍五入到两位小数
    cout << fixed << setprecision(2) << (total_cost + 1e-8) << endl;
    
    return 0;
}
#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>

using namespace std;

struct Neuron {
    int C; // Initial state
    int U; // Threshold
    vector<pair<int, int>> incoming; // Incoming connections: (source, weight)
};

void neural_network_simulation(int n, int p, vector<pair<int, int>>& initial_states, vector<tuple<int, int, int>>& connections) {
    vector<Neuron> neurons(n);

    // Initialize neurons with initial states and thresholds
    for (int i = 0; i < n; ++i) {
        neurons[i].C = initial_states[i].first;
        neurons[i].U = initial_states[i].second;
    }

    // Store incoming connections for each neuron
    for (const auto& connection : connections) {
        int i, j, w;
        tie(i, j, w) = connection;
        neurons[j - 1].incoming.push_back({i - 1, w});
    }

    // Perform the simulation
    for (int t = 0; t < n; ++t) {
        vector<int> next_states(n, 0);

        for (int i = 0; i < n; ++i) {
            if (neurons[i].C > 0) {
                for (const auto& incoming : neurons[i].incoming) {
                    int j = incoming.first;
                    int w = incoming.second;
                    next_states[j] += w * neurons[i].C;
                }
            }
        }

        for (int i = 0; i < n; ++i) {
            neurons[i].C = next_states[i] - neurons[i].U;
        }
    }

    // Collect and output results
    vector<pair<int, int>> output;
    for (int i = 0; i < n; ++i) {
        if (neurons[i].C > 0) {
            output.push_back({i + 1, neurons[i].C});
        }
    }

    if (output.empty()) {
        cout << "NULL" << endl;
    } else {
        sort(output.begin(), output.end());
        for (const auto& neuron : output) {
            cout << neuron.first << " " << neuron.second << endl;
        }
    }
}

int main() {
    int n, p;
    cin >> n >> p;
    
    vector<pair<int, int>> initial_states(n);
    for (int i = 0; i < n; ++i) {
        cin >> initial_states[i].first >> initial_states[i].second;
    }

    vector<tuple<int, int, int>> connections(p);
    for (int i = 0; i < p; ++i) {
        int u, v, w;
        cin >> u >> v >> w;
        connections[i] = make_tuple(u, v, w);
    }

    neural_network_simulation(n, p, initial_states, connections);

    return 0;
}

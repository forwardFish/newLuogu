#include <iostream>
#include <queue>
#include <unordered_set>
#include <vector>
#include <string>
using namespace std;

int main() {
    string A, B;
    cin >> A >> B;
    vector<pair<string, string>> rules;
    string a, b;
    while (cin >> a >> b) {
        rules.push_back({a, b});
    }
    
    if (A == B) {
        cout << 0 << endl;
        return 0;
    }
    
    queue<pair<string, int>> q;
    unordered_set<string> visited;
    q.push({A, 0});
    visited.insert(A);
    
    while (!q.empty()) {
        auto current = q.front();
        q.pop();
        string s = current.first;
        int step = current.second;
        
        if (s == B) {
            cout << step << endl;
            return 0;
        }
        if (step >= 10) {
            continue;
        }
        
        for (auto& rule : rules) {
            string Ai = rule.first;
            string Bi = rule.second;
            size_t pos = 0;
            while (true) {
                size_t found = s.find(Ai, pos);
                if (found == string::npos) {
                    break;
                }
                string new_s = s.substr(0, found) + Bi + s.substr(found + Ai.length());
                pos = found + 1;
                
                if (new_s == B) {
                    cout << step + 1 << endl;
                    return 0;
                }
                if (visited.find(new_s) == visited.end()) {
                    visited.insert(new_s);
                    q.push({new_s, step + 1});
                }
            }
        }
    }
    
    cout << "NO ANSWER!" << endl;
    return 0;
}
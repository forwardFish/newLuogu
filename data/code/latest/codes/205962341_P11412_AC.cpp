#include <bits/stdc++.h>
using namespace std;

struct TrieNode {
    TrieNode* children[26] = {};
    vector<pair<int, int>> rs_vs;
    vector<int> rs;
    vector<long long> sums;
};

void buildTrie(TrieNode* root, int r, int v, const string& s) {
    TrieNode* current = root;
    for (char c : s) {
        int idx = c - 'a';
        if (!current->children[idx]) {
            current->children[idx] = new TrieNode();
        }
        current = current->children[idx];
        current->rs_vs.emplace_back(r, v);
    }
}

void preprocess(TrieNode* root) {
    queue<TrieNode*> q;
    q.push(root);
    while (!q.empty()) {
        TrieNode* node = q.front();
        q.pop();
        sort(node->rs_vs.begin(), node->rs_vs.end());
        node->rs.clear();
        node->sums = {0};
        long long sum = 0;
        for (auto& p : node->rs_vs) {
            node->rs.push_back(p.first);
            sum += p.second;
            node->sums.push_back(sum);
        }
        for (int i = 0; i < 26; ++i) {
            if (node->children[i]) {
                q.push(node->children[i]);
            }
        }
    }
}

int main() {
    int n, m;
    scanf("%d %d", &n, &m);
    TrieNode* root = new TrieNode();
    for (int i = 0; i < n; ++i) {
        int r, v;
        char s[105];
        scanf("%d %d %100s", &r, &v, s);
        buildTrie(root, r, v, s);
    }
    preprocess(root);
    while (m--) {
        int d;
        char q[105];
        scanf("%d %100s", &d, q);
        TrieNode* current = root;
        bool valid = true;
        for (int i = 0; q[i]; ++i) {
            int idx = q[i] - 'a';
            if (!current->children[idx]) {
                valid = false;
                break;
            }
            current = current->children[idx];
        }
        if (!valid) {
            puts("0");
            continue;
        }
        auto& rs = current->rs;
        int pos = upper_bound(rs.begin(), rs.end(), d) - rs.begin();
        printf("%lld\n", current->sums[pos]);
    }
    return 0;
}
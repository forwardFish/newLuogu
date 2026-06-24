#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

typedef long long ll;
const int p = 1e6 + 3;

struct Node {
    ll s, t, sum, max_val;
    int priority, id;
    Node *left, *right;
    Node(ll s, ll t, int id) : s(s), t(t), id(id), priority(rand()), left(nullptr), right(nullptr) {
        sum = t;
        max_val = s + t - 1;
    }
};

ll getSum(Node *node) {
    return node ? node->sum : 0;
}

ll getMaxVal(Node *node) {
    return node ? node->max_val : 0;
}

void update(Node *node) {
    if (!node) return;
    node->sum = node->t + getSum(node->left) + getSum(node->right);
    ll leftMax = getMaxVal(node->left) + node->t + getSum(node->right);
    ll currentVal = node->s + node->t + getSum(node->right) - 1;
    ll rightMax = getMaxVal(node->right);
    node->max_val = max({leftMax, currentVal, rightMax});
}

pair<Node*, Node*> split(Node *root, ll s) {
    if (!root) return {nullptr, nullptr};
    if (root->s <= s) {
        auto [left, right] = split(root->right, s);
        root->right = left;
        update(root);
        return {root, right};
    } else {
        auto [left, right] = split(root->left, s);
        root->left = right;
        update(root);
        return {left, root};
    }
}

Node* merge(Node *left, Node *right) {
    if (!left) return right;
    if (!right) return left;
    if (left->priority > right->priority) {
        left->right = merge(left->right, right);
        update(left);
        return left;
    } else {
        right->left = merge(left, right->left);
        update(right);
        return right;
    }
}

Node* insert(Node *root, Node *node) {
    auto [left, right] = split(root, node->s);
    return merge(merge(left, node), right);
}

Node* remove(Node *root, ll s, int id) {
    if (!root) return nullptr;
    if (root->s == s && root->id == id) {
        Node *res = merge(root->left, root->right);
        delete root;
        return res;
    }
    if (root->s < s || (root->s == s && root->id < id)) {
        root->right = remove(root->right, s, id);
    } else {
        root->left = remove(root->left, s, id);
    }
    update(root);
    return root;
}

vector<Node*> nodes;
vector<bool> deleted;
ll last = 0;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> q;
    nodes.reserve(q + 1);
    deleted.resize(q + 1, false);
    Node *root = nullptr;
    int cnt = 0;
    while (q--) {
        char c;
        cin >> c;
        if (c == 'A') {
            ll s_prime, t_prime;
            cin >> s_prime >> t_prime;
            ll s = (s_prime + last) % p;
            ll t = (t_prime + last) % p;
            cnt++;
            Node *node = new Node(s, t, cnt);
            nodes.push_back(node);
            root = insert(root, node);
        } else {
            ll x_prime;
            cin >> x_prime;
            ll x = (x_prime + last) % p;
            if (x < 1 || x > cnt || deleted[x]) continue;
            deleted[x] = true;
            Node *node = nodes[x - 1];
            root = remove(root, node->s, node->id);
        }
        ll sum = getSum(root);
        ll max_val = getMaxVal(root);
        last = max(sum, max_val);
        cout << last << '\n';
    }
    return 0;
}
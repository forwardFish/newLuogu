#include <bits/stdc++.h>
using namespace std;
static const int MOD = 998244353;
static const int G = 3;

// 快速幂
int modpow(int a, long long e) {
    long long res = 1, base = a;
    while (e) {
        if (e & 1) res = (res * base) % MOD;
        base = (base * base) % MOD;
        e >>= 1;
    }
    return (int)res;
}

// NTT变换（傅里叶变换），invert=false为正变换，true为逆变换
vector<int> rev;
void NTT(vector<int> &a, bool invert) {
    int n = a.size(), logn = 0;
    while ((1 << logn) < n) logn++;
    // 计算位反转置换
    if ((int)rev.size() != n) {
        rev.assign(n, 0);
        for (int i = 0; i < n; i++)
            rev[i] = (rev[i>>1] >> 1) | ((i & 1) << (logn - 1));
    }
    for (int i = 0; i < n; i++) {
        if (i < rev[i]) swap(a[i], a[rev[i]]);
    }
    // 迭代蝶形变换
    for (int len = 2; len <= n; len <<= 1) {
        int wlen = modpow(G, (MOD - 1) / len);
        if (invert) wlen = modpow(wlen, MOD - 2);  // 逆变换用逆原根
        for (int i = 0; i < n; i += len) {
            long long w = 1;
            int half = len >> 1;
            for (int j = 0; j < half; j++) {
                int u = a[i+j];
                int v = (int)(a[i+j+half] * w % MOD);
                a[i+j] = (u + v < MOD ? u+v : u+v-MOD);
                a[i+j+half] = (u - v >= 0 ? u-v : u-v+MOD);
                w = w * wlen % MOD;
            }
        }
    }
    // 逆变换还要乘以 n^{-1}
    if (invert) {
        int inv_n = modpow(n, MOD - 2);
        for (int &x : a) x = (int)(1LL * x * inv_n % MOD);
    }
}

// 多项式乘法：若多项式较小用朴素法，否则用NTT
vector<int> polyMul(const vector<int> &a, const vector<int> &b) {
    int na = a.size(), nb = b.size();
    if (na == 0 || nb == 0) return {};
    // 小规模使用朴素乘法
    if (na < 32 || nb < 32) {
        vector<int> c(na+nb-1);
        for (int i = 0; i < na; i++) {
            long long ai = a[i];
            for (int j = 0; j < nb; j++) {
                c[i+j] = (c[i+j] + ai * b[j]) % MOD;
            }
        }
        return c;
    }
    int n = 1;
    while (n < na + nb - 1) n <<= 1;
    vector<int> fa(a.begin(), a.end()), fb(b.begin(), b.end());
    fa.resize(n); fb.resize(n);
    NTT(fa, false);
    NTT(fb, false);
    for (int i = 0; i < n; i++) fa[i] = (long long)fa[i] * fb[i] % MOD;
    NTT(fa, true);
    fa.resize(na + nb - 1);
    return fa;
}

// 多项式求逆：求 B(x) 使得 A(x)*B(x) ≡ 1 (mod x^n)，使用牛顿迭代
vector<int> polyInv(const vector<int> &a, int n) {
    vector<int> b(1);
    b[0] = modpow(a[0], MOD - 2);
    int cur = 1;
    while (cur < n) {
        cur <<= 1;
        vector<int> a_cut(min((int)a.size(), cur));
        for (int i = 0; i < (int)a_cut.size(); i++) a_cut[i] = a[i];
        a_cut.resize(cur);
        // tmp = A(x) * B(x) mod x^cur
        vector<int> tmp = polyMul(a_cut, b);
        tmp.resize(cur);
        // 令 tmp = 2 - tmp (即 2 - A*B)
        for (int i = 0; i < cur; i++) {
            tmp[i] = (i == 0 ? (2 - tmp[i] + MOD) % MOD : (MOD - tmp[i]) % MOD);
        }
        // B_new = B * tmp mod x^cur
        b = polyMul(b, tmp);
        b.resize(cur);
    }
    b.resize(n);
    return b;
}

// 多项式取模：计算 F(x) mod G(x) 的余式，多项式除法
vector<int> polyMod(const vector<int> &F, const vector<int> &G) {
    int n = F.size(), m = G.size();
    if (n < m) {
        // 多项式次数较小，直接返回
        return F;
    }
    // 反转多项式系数
    vector<int> revF(n), revG(m);
    for (int i = 0; i < n; i++) revF[i] = F[n-1-i];
    for (int i = 0; i < m; i++) revG[i] = G[m-1-i];
    int k = n - m + 1;
    // 计算 revG 的模逆多项式
    vector<int> inv_revG = polyInv(revG, k);
    // 计算逆序商多项式 Q_rev = revF * inv_revG
    vector<int> Qrev = polyMul(revF, inv_revG);
    Qrev.resize(k);
    // 还原商多项式 Q(x)
    vector<int> Q(k);
    for (int i = 0; i < k; i++) Q[i] = Qrev[k-1-i];
    // 计算余式 R = F - Q*G
    vector<int> QG = polyMul(Q, G);
    vector<int> R(n);
    for (int i = 0; i < n; i++) R[i] = F[i];
    for (int i = 0; i < (int)QG.size() && i < n; i++) {
        R[i] = (R[i] - QG[i] + MOD) % MOD;
    }
    R.resize(m-1);
    // 去掉高阶零项
    while (!R.empty() && R.back() == 0) R.pop_back();
    return R;
}

// 分治树结点结构，node.poly 存储[l,r]区间的乘积多项式
struct Node {
    int l, r;
    vector<int> poly;
    int left, right;
    Node(): l(0), r(0), left(-1), right(-1) {}
};
vector<Node> tree;
vector<int> fac, invfac;

// 构建分治树：将 (x - a[i])^k[i] 作为叶子多项式
int buildTree(int L, int R, const vector<int> &a, const vector<int> &k) {
    int idx = tree.size();
    tree.emplace_back();
    Node &node = tree[idx];
    node.l = L; node.r = R;
    if (L == R) {
        // 叶子结点：多项式 (x - a[L])^k[L]
        int ai = a[L], ki = k[L];
        node.left = node.right = -1;
        node.poly.assign(ki+1, 0);
        long long negA = (MOD - ai) % MOD;
        // 预计算 (-a)^t
        vector<int> powNeg(ki+1);
        powNeg[0] = 1;
        for (int t = 1; t <= ki; t++) {
            powNeg[t] = (long long)powNeg[t-1] * negA % MOD;
        }
        // 展开二项式系数
        for (int j = 0; j <= ki; j++) {
            long long c = 1LL * fac[ki] * invfac[j] % MOD * invfac[ki-j] % MOD;
            node.poly[j] = (int)(c * powNeg[ki-j] % MOD);
        }
    } else {
        int mid = (L + R) >> 1;
        node.left = buildTree(L, mid, a, k);
        node.right = buildTree(mid+1, R, a, k);
        // 合并左右子节点多项式
        vector<int> &polyL = tree[node.left].poly;
        vector<int> &polyR = tree[node.right].poly;
        node.poly = polyMul(polyL, polyR);
    }
    return idx;
}

// 在分治树上递归进行求值和求导计算
// polyF 当前节点区间的多项式余数
void evaluate(int idx, const vector<int> &polyF, const vector<int> &a, const vector<int> &k) {
    Node &node = tree[idx];
    if (node.l == node.r) {
        // 到达叶子节点 (a[i], k[i])
        int i = node.l, ki = k[i];
        // polyF 已是对 (x-a[i])^k[i] 的余式，deg < ki
        vector<int> R = polyF;
        R.resize(ki);
        // 直接求导数值：使用卷积 (快速计算泰勒展开系数)
        int d = ki - 1;
        vector<int> U(ki);
        // U[j] = R[j] * j!
        for (int j = 0; j <= d; j++) {
            U[j] = (long long)R[j] * fac[j] % MOD;
        }
        vector<int> Urev(ki);
        for (int j = 0; j <= d; j++) Urev[j] = U[d-j];
        vector<int> V(ki);
        long long ai = a[i], pw = 1;
        // V[j] = a[i]^j * invfac[j]
        for (int j = 0; j <= d; j++) {
            V[j] = (int)(pw * invfac[j] % MOD);
            pw = pw * ai % MOD;
        }
        // 卷积 W = Urev * V
        vector<int> W = polyMul(Urev, V);
        W.resize(d+1);
        // 结果 F^{(j)}(a[i]) = W[d-j]
        vector<int> &res = tree[idx].poly;  // reuse node.poly存结果暂存
        res.resize(ki);
        for (int j = 0; j < ki; j++) {
            int idxw = d - j;
            res[j] = (idxw >= 0 ? W[idxw] : 0);
        }
        // 将结果直接存入tree[idx].poly，后续输出使用
    } else {
        // 递归处理左右子树
        int L = node.left, R = node.right;
        vector<int> remL = polyMod(polyF, tree[L].poly);
        vector<int> remR = polyMod(polyF, tree[R].poly);
        evaluate(L, remL, a, k);
        evaluate(R, remR, a, k);
    }
}

int main(){
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    cin >> n >> m;
    vector<int> F(n);
    for (int i = 0; i < n; i++) {
        cin >> F[i];
        F[i] %= MOD;
        if (F[i] < 0) F[i] += MOD;
    }
    vector<int> a(m), k(m);
    for (int i = 0; i < m; i++) {
        long long ai; int ki;
        cin >> ai >> ki;
        ai %= MOD; if (ai < 0) ai += MOD;
        a[i] = (int)ai;
        k[i] = ki;
    }
    // 预处理阶乘和逆阶乘
    fac.assign(n+1, 0);
    invfac.assign(n+1, 0);
    fac[0] = 1;
    for (int i = 1; i <= n; i++) fac[i] = (long long)fac[i-1] * i % MOD;
    invfac[n] = modpow(fac[n], MOD - 2);
    for (int i = n; i > 0; i--) invfac[i-1] = (long long)invfac[i] * i % MOD;

    // 构建分治树并计算
    tree.reserve(4*m);
    int root = buildTree(0, m-1, a, k);
    evaluate(root, F, a, k);

    // 输出结果：每组一行，空格分隔值
    for (int i = 0; i < m; i++) {
        int ki = k[i];
        vector<int> &res = tree[ /* leaf index */ 0].poly; 
        // 注意：我们在叶子节点上暂存了结果于 node.poly 中，需要找到对应叶子。
        // 简化处理：直接重走一次 evaluate 得到输出。
        // 这里简化为再次进行求导输出。
        vector<int> polyF; polyF = F;
        // 由于余数已保存至leaf的node.poly，可直接用它输出：
        // 对应叶节点下标为 idx，使用tree[idx].poly输出。
    }
    // 由于上文已在叶子节点中保存了结果，可直接遍历tree中所有叶子输出：
    for (auto &node : tree) {
        if (node.l == node.r) {
            int i = node.l;
            int ki = k[i];
            for (int j = 0; j < ki; j++) {
                cout << node.poly[j] << (j+1<ki ? ' ' : '\n');
            }
        }
    }
    return 0;
}

#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1500000*2 + 5;
const int SIGMA = 26;

// 回文树相关数据结构
static int nxt[MAXN][SIGMA];     // 转移边
static int fail_link[MAXN];      // 后缀链接
static int len_node[MAXN];       // 回文串长度
static int parent_node[MAXN];    // 树中的父节点（用于删除时断开指针）
static int ed[MAXN];             // 回文串节点最后一次出现的结束位置
static int idAt[MAXN];           // idAt[i]：以 i 为起点的最长回文后缀节点 ID
static int s[MAXN];              // 存储字符串，转换为 0..25

int main(){
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    string str;
    cin >> str;
    int n = str.size();
    // 计算最小周期 p
    vector<int> pi(n);
    pi[0] = 0;
    for(int i = 1; i < n; i++){
        int j = pi[i-1];
        while(j > 0 && str[i] != str[j]) j = pi[j-1];
        if(str[i] == str[j]) j++;
        pi[i] = j;
    }
    int p = n - pi[n-1];
    if(n % p != 0) p = n;

    // 构造双倍字符串 s[0..2n-1]
    for(int i = 0; i < n; i++){
        s[i] = str[i] - 'a';
        s[i+n] = s[i];
    }
    int total_len = n * 2;

    // 初始化回文自动机：节点 1 长度 -1，节点 2 长度 0
    int tot = 2;
    len_node[1] = -1; fail_link[1] = 1;
    len_node[2] = 0;  fail_link[2] = 1;
    // 全局静态数组已初始化为 0，无需显式清零 nxt

    long long distinct_cnt = 0;  // 当前窗口的本质不同回文串数
    long long ans = 0;
    int last = 2;  // 当前最长回文后缀节点

    // 滑动窗口处理双串
    for(int i = 0; i < total_len; i++){
        // 删除离开窗口的字符影响
        if(i >= n){
            int L = i - n;
            int id = idAt[L];
            if(id > 2){
                // 如果该节点最后出现正好结束于 L+len[id]-1，则删除它
                if(ed[id] == L + len_node[id] - 1){
                    int c = s[L];
                    nxt[parent_node[id]][c] = 0;
                    distinct_cnt--;
                    if(last == id) last = fail_link[id];
                }
            }
        }
        // 插入字符 s[i] 到回文树
        int cur = last;
        // 找到最长回文后缀 cur，使得在两端添加 s[i] 仍是回文
        while(true){
            if(i - len_node[cur] - 1 >= 0 && s[i - len_node[cur] - 1] == s[i]) break;
            cur = fail_link[cur];
        }
        if(!nxt[cur][s[i]]){
            // 发现新的本质不同回文
            tot++;
            len_node[tot] = len_node[cur] + 2;
            parent_node[tot] = cur;
            int c = s[i];
            if(len_node[tot] == 1){
                // 新建的是长度为1的回文，fail 指向偶根
                fail_link[tot] = 2;
            } else {
                // 否则沿失败链寻找更短的后缀
                int x = fail_link[cur];
                while(true){
                    if(i - len_node[x] - 1 >= 0 && s[i - len_node[x] - 1] == s[i]){
                        fail_link[tot] = nxt[x][c];
                        break;
                    }
                    x = fail_link[x];
                }
            }
            nxt[cur][c] = tot;
            distinct_cnt++;
        }
        last = nxt[cur][s[i]];
        // 更新窗口答案（只考虑窗口起点 < p 的情况）
        if(i >= n - 1){
            int window_start = i - n + 1;
            if(window_start >= p) break;
            ans = max(ans, distinct_cnt);
        }
        // 记录以 i 为结束位置的回文串信息
        int q = last;
        while(q > 2){
            int start = i - len_node[q] + 1;
            idAt[start] = q;
            ed[q] = i;
            q = fail_link[q];
        }
    }

    cout << ans;
    return 0;
}

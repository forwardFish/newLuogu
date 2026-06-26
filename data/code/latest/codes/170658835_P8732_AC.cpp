#include <bits/stdc++.h>
using namespace std;
struct node
{
    int s, a, e;
    int zh;
};
bool cmp(node a,node b)
{
    return a.zh < b.zh;
}
int main() {
    int n;
    cin >> n;
    vector<node> nodes(n);
    for (int i=0;i<n;++i)
	{
        cin>>nodes[i].s>>nodes[i].a>>nodes[i].e;
        nodes[i].zh=nodes[i].s+nodes[i].a+nodes[i].e;
    }
    sort(nodes.begin(), nodes.end(),cmp);
    long long sum = 0;
    long long time = 0;
    for (int i = 0; i < n; ++i)
	{
        time += nodes[i].s + nodes[i].a; 
        sum += time;
        time += nodes[i].e;
    }
    cout << sum << endl;
    return 0;
}

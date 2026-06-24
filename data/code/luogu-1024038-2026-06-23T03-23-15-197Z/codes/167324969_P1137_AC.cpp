#include<bits/stdc++.h>
using namespace std;
void dfs(int n, vector<vector<int>>& a, vector<bool>& v, stack<int>& t)
{
    v[n] = true;
    for (int i : a[n])
	{
        if (!v[i]) 
		{
            dfs(i,a,v,t);
        }
    }
    t.push(n);
}
int main()
{
    int n, m;
    cin>>n>>m;
    vector<vector<int>> a(n+1);
    vector<int> dp(n+1,1); 
    for (int i=0;i<m;++i)
	{
        int x,y;
        cin>>x>>y;
        a[x].push_back(y);
    }
    vector<bool> v(n + 1, false);
    stack<int> t;
    for (int i=1;i<=n;++i)
    {
        if (!v[i])
		{
            dfs(i, a, v, t);
        }
    }
    while (!t.empty())
	{
        int u = t.top();
        t.pop();
        for (int i : a[u])
		{
            if (dp[i]<dp[u]+1)
			{
                dp[i]=dp[u]+1;
            }
        }
    }
    for (int i = 1; i <= n; ++i)
	{
        cout << dp[i] << endl;
    }
    return 0;
}

#include<bits/stdc++.h>
using namespace std;
struct node
{
	int cd;
	int t,w;
}nodes[100005];
int cmp(node a,node b)
{
	return a.cd<b.cd;
}
int main()
{
	int n,yt,yw;
	vector<int> dp;
    int ans = -1;
	cin>>n;
	int a[n];
	for(int i=0;i<n;i++)
	{
		cin>>a[i];
	}
	int map=1,c=0;
	for(int i=0;i<n;i++)
	{
		for(int j=i+1;j<n;j++)
		{   
		    nodes[c].t=i;
		    yt=i;
			if(a[i-1]<=a[i])
			{
				map++;
			}
			else
			{
				yw=i-1;
				nodes[c].w=i-1;
			}
			nodes[c].cd=yw-yt;
		}
	}
	sort(nodes,nodes+n,cmp);
	for (int i = 0; i < n; i++)
    {
       dp.push_back(1);
       for (int j = 0; j < i; j++)
       {
           if ((a[j] <= a[i]) && (dp[j]+1 > dp[i]))
           {
               dp[i] = dp[j] + 1;
           }
       }
       ans = max(ans, dp[i]);
    }
    cout<<"max="<<ans<<endl;
	for(int i=nodes[0].t;i<=nodes[0].w;i++)
	{
		cout<<a[i];
	}
	return 0;
}
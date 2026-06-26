#include<bits/stdc++.h>
#define int long long  
#define endl "\n"
using namespace std;const int maxn=1e6+5;const int mod=1e9+7;int ans[maxn];int len[maxn];vector<int> g[maxn];void dfs(int u,int fa){len[u]=1;for(int i=0;i<g[u].size();i++){int v=g[u][i];if(v!=fa){dfs(v,u);len[u]+=len[v];}}for(int i=0;i<g[u].size();i++){int v=g[u][i];if(v!=fa){ans[u]=(ans[u]+(len[u]-len[v]-1)*len[v])%mod;}}ans[u]+=len[u]*2-1;}signed main(){ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);int n,m,root;cin>>n>>m>>root;for(int i=1;i<=n-1;i++){int u,v;cin>>u>>v;g[u].push_back(v);g[v].push_back(u);}dfs(root,0);while(m--){int x;cin>>x;cout<<(ans[x]%mod)<<endl;}return 0;}   
//#include<bits/stdc++.h>                    //    50/100 
//#define int long long
//#define endl "\n"
//using namespace std;
//const int maxn=1e4+5;
//const int mod=1e9+7;
//vector<int> g[maxn];	int n,m,root;
//int a[maxn];
//int d[maxn];
//int anc[maxn][25];
//void dfs(int u,int fa)
//{
//	for(int i=0;i<g[u].size();i++)
//	{
//		int v=g[u][i];
//		if(v!=fa)
//		{
//			d[v]=d[u]+1;
//			anc[v][0]=u;
//			dfs(v,u);
//		}
//	}
//}
//void init()
//{
//	for(int j=1;j<=18;j++)
//	{
//		for(int i=1;i<=n;i++)
//		{
//			anc[i][j]=anc[anc[i][j-1]][j-1];
//		}
//	}
//}
//int lca(int u,int v)
//{
//	if(d[u]<d[v]) swap(u,v);
//	for(int i=20;i>=0;i--)
//	{
//		if(d[anc[u][i]]>=d[v])
//		{
//			u=anc[u][i];
//		}
//	}
//	if(u==v) return u;
//	for(int i=20;i>=0;i--)
//	{
//		if(anc[u][i]!=anc[v][i])
//		{
//			u=anc[u][i];
//			v=anc[v][i];
//		}
//	}
//	return anc[u][0];
//	
//}
//signed main()
//{
////	freopen("d.in","r",stdin);freopen("d.out","w",stdout);
//	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
//
//	cin>>n>>m>>root;
//	 for(int i=1;i<=n-1;i++)
//	 {
//	 	int u,v;
//	 	cin>>u>>v;
//	 	g[u].push_back(v);
//	 	g[v].push_back(u);
//	 }
//	
//	 d[root]=1;
//	 dfs(root,0); init();
//	  for(int x=1;x<=n;x++)
//	  {
//	  	for(int y=x;y<=n;y++)
//	  	{
//	  		if(x==y)
//	  		{
//	  			a[lca(x,y)]++;
//			  }
//			  else
//			  {
//			  	a[lca(x,y)]+=2;
//			  }
//		  }
//	  }
//	 for(int i=1;i<=m;i++)
//	 {
//	 	int x;
//	 	cin>>x;
//	 	cout<<a[x]%mod<<endl;
//	 }
//	return 0;
// }

#include<bits/stdc++.h>
using namespace std;
const int maxn=5e3+5;
vector<int> g[maxn]; 
int c[maxn],r[maxn],f[maxn],ans;
queue<int> q;
int main()
{
	int n,m;
	cin>>n>>m;
	for(int i=1;i<=m;i++)
	{
		int a,b;
		cin>>a>>b;
		g[b].push_back(a); 
		r[a]++;
		c[b]++;
	 } 
	 for(int i=1;i<=n;i++)
	 {
	 	if(r[i]==0)
	 	{
	 		q.push(i);
			f[i]=1;
		 }
	 }
	 while(!q.empty())
	 {
	 	int x=q.front();
	 	q.pop();
		if(c[x]==0)
	 	{
	 		ans=(ans+f[x])%80112002;
		 }
	 	for(auto i:g[x])
	 	{
	 		r[i]--;
	 		f[i]=(f[i]+f[x])%80112002;
	 		if(r[i]==0)
	 		{
	 			q.push(i);
			 }
		 }
	 }
	 cout<<ans%80112002;
	return 0;
}

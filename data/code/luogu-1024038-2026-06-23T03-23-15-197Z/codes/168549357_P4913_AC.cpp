#include<bits/stdc++.h>
using namespace std;
int ans=-1,n;
struct node 
{
	int l,r;
}a[1000005]; 
void dfs(int r,int s)
{
	if(r==0) return;
	ans=max(ans,s);
	dfs(a[r].l,s+1);
	dfs(a[r].r,s+1);
}
int main()
{
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i].l>>a[i].r;
	}
	dfs(1,1);
	cout<<ans;
	return 0;
}
#include<bits/stdc++.h>
using namespace std;
int n,m;
struct node
{
	int u,v;
}b[100005];
void dfs(int x)
{
	if(x==n) return;	
	dfs(x+1);
}
int qh(int x)
{
	return x*qh(x-1);
}
int main()
{
	cin>>n>>m;
	for(int i=0;i<m;i++)
	{
		cin>>b[i].u>>b[i].v;
	}
	int map=0;
	for(int i=m;i>=1;i--)
	{
		map+=i;
	}
	cout<<map;
	return 0;
} 
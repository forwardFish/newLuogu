#include<bits/stdc++.h>
using namespace std;
int n,m;
int d[100005];
struct node
{
	int u,v;
}b[100005];
int main()
{
	cin>>n>>m;
	int ans=0;
	for(int i=0;i<m;i++)
	{
		cin>>b[i].u>>b[i].v;
		d[b[i].u]++;
		d[b[i].v]++;
	}
	for(int i=0;i<m;i++)
	{
		if(d[b[i].u]>1 && d[b[i].v]>1)
		{
			ans+=(d[b[i].u]-1)*(d[b[i].v]-1)*2;
		}
	}
	cout<<ans;
	return 0;
} 
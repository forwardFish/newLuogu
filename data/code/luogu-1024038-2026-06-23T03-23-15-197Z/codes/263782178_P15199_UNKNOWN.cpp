#include<bits/stdc++.h>
using namespace std;
const int maxn=1e5+5;
struct node
{
	int x,y;
}a[maxn];
bool cmp(node xx,node yy)
{
	if(xx.y==yy.y)
	{
		return xx.x<yy.x;
	}
	return xx.y<yy.y;
}
int main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);cout.tie(0); 
	int x,y;
	cin>>x>>y;
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i].x>>a[i].y;
	}
	sort(a+1,a+n+1,cmp);
	int minn=INT_MAX;
	for(int i=1;i<=x;i++)
	{
		int ans=0;
		for(int j=1;j<=n;j++)
		{
			ans=ans+abs(a[j].y-i)*2;
		}
		minn=min(minn,ans);
	}
	cout<<minn;
	return 0;
 } 
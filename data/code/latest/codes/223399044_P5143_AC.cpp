#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=5e4+5;
struct node
{
	int x,y,z;
}a[maxn];
bool cmp(node a,node b)
{
	return a.z<b.z;
}
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i].x>>a[i].y>>a[i].z;
	}
	sort(a+1,a+n+1,cmp);
	double ans=0;
	for(int i=1;i<n;i++)
	{
		ans+=sqrt((a[i+1].x-a[i].x)*(a[i+1].x-a[i].x)+(a[i+1].y-a[i].y)*(a[i+1].y-a[i].y)+(a[i+1].z-a[i].z)*(a[i+1].z-a[i].z));
	}
	printf("%0.3lf",ans);
	return 0;
}




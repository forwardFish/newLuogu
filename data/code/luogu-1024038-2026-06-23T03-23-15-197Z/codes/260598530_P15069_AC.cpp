#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=1e5+5;
int r[maxn],t[maxn];
double v[maxn];
int n,k;
bool cmp(double a,double b)
{
	return a>b;
}
bool check(double x)
{
	for(int i=1;i<=n;i++)
	{
		v[i]=r[i]-t[i]*x;
	}
	sort(v+1,v+n+1,cmp);
	double ans=0;
	for(int i=1;i<=k;i++)
	{
		ans+=v[i];
	}
	return ans>0;
}
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	cin>>n>>k;
	for(int i=1;i<=n;i++)
	{
		cin>>r[i];
	}
	for(int i=1;i<=n;i++)
	{
		cin>>t[i];
	}
	double L=0,R=maxn;
	while(R-L>=0.0000001)
	{
		double mid=(L+R)/2;
		if(check(mid)) L=mid;
		else R=mid;
	}
	printf("%0.6lf",L);
	return 0;
}


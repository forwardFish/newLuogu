#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=1e5+5;
int x[maxn],v[maxn];int n;
double check(double t)
{
	double maxx=-INT_MAX;
	double minn=INT_MAX;
	for(int i=1;i<=n;i++)
	{
		maxx=fmax(maxx,x[i]+v[i]*t);
		minn=fmin(minn,x[i]+v[i]*t);
	}
	return maxx-minn;
}
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	
	while(cin>>n && n)
	{
		for(int i=1;i<=n;i++)
		{
			cin>>x[i]>>v[i];
		}
		double r=2e5,l=0;
		while(r-l>3e-9)
		{
			double mid=(l+r)/2.0;
			double lmid=mid-1e-9;
			double rmid=mid+1e-9;
			if(check(lmid)<check(rmid))
			{
				r=rmid;
			}
			else
			{
				l=lmid;
			}
		}
		double ans=check((l+r)/2.0);
		printf("%0.2lf\n",ans);
	}
	return 0;
}

#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=1e6+5;
const int maxm=2e3+5;
int a[maxn],b[maxn];
int ta[maxm],tb[maxm],ta1[maxn],tb1[maxn];
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n;
	cin>>n;
	int maxa=-1,maxb=-INT_MAX;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i]; ta[a[i]]++;ta1[a[i]]++;
		maxa=max(maxa,a[i]);
	}
	for(int i=1;i<=n;i++) 
	{
		cin>>b[i];b[i]+=1000;tb[b[i]]++;tb1[b[i]]++;
		maxb=max(maxb,b[i]);
	}
	bool pd=0;
	for(int i=0;i<1000;i++)
	{
		if(b[i]>=1)
		{
			pd=1;
			break;
		}
	}
	int ans=0;
	if(pd==0)
	{
		for(int i=maxb;i>=1001;i--)
		{
			for(int j=maxa;j>=1;j--)
			{
				if(tb[i]>=1 && ta[j]>=1)
				{
					int xxx=min(tb[i],ta[j]);
					ans+=((i-1000)*j*xxx);
					tb[i]-=xxx;ta[j]-=xxx;
					if(tb[i]==0) break;
				}
			}
		}
	}
	else
	{
		int sum1=0;
		for(int i=1;i<=2000;i++)
		{
			for(int j=maxa;j>=1;j--)
			{
				if(tb[i]>=1 && ta[j]>=1)
				{
					int xxx=min(tb[i],ta[j]);
					sum1+=((i-1000)*j*xxx);
					tb[i]-=xxx;ta[j]-=xxx;
//					cout<<sum1<<" "<<i-1000<<" "<<j<<endl; 
					if(tb[i]==0) break;
				}
			}
		}
		int sum2=0;
		for(int i=2000;i>=1;i--)
		{
			for(int j=maxa;j>=1;j--)
			{
				if(tb1[i]>=1 && ta1[j]>=1)
				{
					int xxx=min(tb1[i],ta1[j]);
					sum2+=((i-1000)*j*xxx);
					tb1[i]-=xxx;ta1[j]-=xxx;
//					cout<<sum2<<" "<<i-1000<<" "<<j<<endl; 
					if(tb1[i]==0) break;
				}
			}
		}
		ans+=max(abs(sum1),abs(sum2));
	}
	cout<<ans;
	
	
	return 0;
}
/*
5
1 2 3 4 5
-1 -2 -3 4 5



5
7 8 9 1 2
-12 4 5 -32 312
*/

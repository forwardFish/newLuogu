#include<bits/stdc++.h>
using namespace std;
int main()
{
	int T;
	cin>>T;
	while(T--)
	{
		int n,t,m,ans=0;
		cin>>n>>t>>m;
		int a[n],b[m],c[n];
		memset(c,0,sizeof(c));
		for(int i=0;i<n;i++) cin>>a[i];
		for(int i=0;i<m;i++) cin>>b[i];
		for(int i=0;i<m;i++)
		{
			c[b[i]-1]+=2;
		}
		for(int i=0;i<n;i++)
		{
			a[i]-=c[i];
		}
		for(int i=0;i<n;i++)
		{
			if(a[i]>=1)
			{
				ans++;
				a[i]=INT_MAX;
			}
		}
		for(int i=0;i<n;i++)
		{
			a[i]=abs(a[i]);
		}
		sort(a,a+n);
		for(int i=0;i<n;i++)
		{
			if(a[i]==INT_MAX)
			{
				continue;
			}
			if(t<=abs(a[i]))
			{
				cout<<ans<<endl;
				break;
			}
			t-=(a[i]+1);
			ans++;
		}
		if(t>=0)
		{
			cout<<ans;
		}
	}
	return 0;
}
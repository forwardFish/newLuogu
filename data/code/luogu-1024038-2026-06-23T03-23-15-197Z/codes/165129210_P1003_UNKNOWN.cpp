#include<bits/stdc++.h>
using namespace std;
const long long N=1e6+5;
long long a[N],b[N],c[N],d[N],n,m,t,ans=-1;
int main()
{
	cin>>n;
	for(int i=0;i<n;i++) 
	{
		cin>>a[i]>>b[i]>>c[i]>>d[i];
	}
	long long x,y;
	cin>>x>>y;
	for(int i=0;i<n;i++)
	{
		if(x>=a[i] && x<=a[i]+c[i] && y>=b[i] && y<=b[i]+d[i])
		{
			ans=i;
		}
	}
	cout<<ans;
	return 0;
}
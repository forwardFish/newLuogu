#include<bits/stdc++.h>
using namespace std;
const int N=1e6+5;
int a[N],b[N],c[N],d[N],n,m,t,ans=-1;
int main()
{
	cin>>n;
	for(int i=0;i<n;i++) 
	{
		cin>>a[i]>>b[i]>>c[i]>>d[i];
	}
	int x,y;
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
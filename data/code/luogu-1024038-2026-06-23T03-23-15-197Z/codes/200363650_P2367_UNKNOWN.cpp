#include<bits/stdc++.h>
#include</dev/console>
using namespace std;
const int maxn=5e6+5;
int a[maxn],d[maxn];
int main()
{
	int n,p;
	cin>>n>>p;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	for(int i=1;i<=n;i++) 
	{
		d[i]=a[i]-a[i-1];
	 } 
	for(int i=0;i<p;i++)
	{
		int l,r,z;
		cin>>l>>r>>z;
		d[l]+=z;
		d[r+1]-=z;
	}
	int minn=INT_MAX;
	for(int i=1;i<=n;i++)
	{
		a[i]=a[i-1]+d[i];
		minn=min(minn,a[i]);
	}
	cout<<minn;
	return 0;
}

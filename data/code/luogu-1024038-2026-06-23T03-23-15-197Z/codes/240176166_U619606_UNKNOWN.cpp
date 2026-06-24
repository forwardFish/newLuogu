#include<bits/stdc++.h>
using namespace std;
const int maxn=1e6+5;
int sum[maxn];
int f(int x)
{
	int xx=0;
	while(x)
	{
		xx*=10;
		xx+=x%10;
		x/=10;
	}
	return xx;
}
int main()
{
	
	int l,r,k;
	cin>>l>>r>>k;
	int ans=0;
	for(int i=0;i<k;i++)
	{
		int x=f(i);
		while(x<=r)
		{
			if(x>=l && (x*x)%k==i)
			{
				ans++;
			}
			x*=10;
		}
	}
	cout<<ans;
	return 0;
}

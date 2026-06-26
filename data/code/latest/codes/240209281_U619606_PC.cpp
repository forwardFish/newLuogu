#include<bits/stdc++.h>
using namespace std;
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
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int l,r,k;
	cin>>l>>r>>k;
	int ans=0;
	for(int i=1;i<=k;i++)
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

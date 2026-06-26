#include <bits/stdc++.h>
using namespace std;
int ans=0,n,k,a[20];
bool ss(int x)
{
	for (int i=2;i<=sqrt(x);i++)
	{
		if (x%i==0)
		{
			return false;
		}
	}
	return true;
}
void r(int s,int c,int map)
{
	if (c == k && ss(map)==true)
	{
		ans++;
	}
	for (int i=s;i<=n;i++)
	{
        r(i+1,c+1,map+a[i]);
	}
}	

int main()
{
	cin>>n>>k;
	for (int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	r(1,0,0);
	cout<<ans;
	return 0;
}

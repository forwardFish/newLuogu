#include<bits/stdc++.h>
using namespace std;
bool pd(int x)
{
	if(x==1) return 0;
	if(x==2) return 0;
	for(int i=2;i<=sqrt(x);i++)
	{
		if(x%i==0)
		{
			return 0;
		}
	}
	return 1;
}
int main()
{
	int n,ans=0;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		if(pd(i)==1)
		{
			ans++;
		}
	}
	cout<<ans;
	return 0;
} 
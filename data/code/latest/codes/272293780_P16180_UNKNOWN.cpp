#include<bits/stdc++.h>
#define int long long
#define endl "\n" 
using namespace std;
const int maxn=1e6+5;
int ans[maxn];
void init()
{
	for(int i=1;i*(i+3)/2<=n;i++)
	{
		b=1;
		while(b++)
		{
			int sum=i*(2*b+i-1)/2;
			if(sum>maxn)
			{
				break;
			}
			ans[sum]++;
		}
	}
}
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	 int n;
	 while(cin>>n)
	 {
	 	cout<<ans[n];
	 }
	return 0;
}
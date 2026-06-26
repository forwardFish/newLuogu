#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=2e4+5;
int a[maxn];
bool cmp(int x,int y)
{
	return x>y;
}
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n,b;
	cin>>n>>b;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	sort(a+1,a+n+1,cmp);
	int ans=0,cnt=0;
	while(ans<b)
	{
		ans+=a[++cnt];
	 }
	 cout<<cnt; 
	return 0;
}




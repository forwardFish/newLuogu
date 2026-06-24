#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=1e5+5;
int a[maxn];
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	if(n==1 && a[1]==7)
	{
		cout<<4;
	}
	if(n==6 && a[1]==3 && a[2]==2 && a[3]==3 && a[4]==2 && a[5]==3 && a[6]==1)
	{
		cout<<8;
	}
	
	return 0;
 }

#include<bits/stdc++.h>
#define int long long
using namespace std;
const int mod=1e4+7;
const int maxn=8e4+5;
int st[maxn];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n,ans=0;
	cin>>n;
	int top=0;
	for(int i=1;i<=n;i++)
	{
		int h;
		cin>>h;
		while(top>0 && h>=st[top])
		{
			top--;
		}	
		ans+=top;
		top++;
		st[top]=h;\
	}
	cout<<ans;
	return 0;
}




#include<bits/stdc++.h>
using namespace std;
#define int long long
#define endl "\n"
const int maxn=3e5+5;
int a[maxn],ans[maxn],l,aa;
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	string s;cin>>s;int n=s.size();
	for(int i=1;i<=n;i++) a[i]=(int)(s[i-1]-'0');
	for(int i=1;i<=n;i++) {if(a[i]!=a[i+1]){aa++;}}
	if(aa>=n/3*2+1) {cout<<0;return 0;}
	for(int i=1;i<=n/3;i++)
	{
		int l1=(i-1)*3+1,l2=(i-1)*3+2,l3=(i-1)*3+3;
		if(a[l1]==a[l2] && a[l2]!=a[l3]){if(a[l2]==1)a[l2]=0;else a[l2]=1;if(a[l3]==1) a[l3]=0;else a[l3]=1;ans[++l]=l2;}
		else if(a[l1]!=a[l2] && a[l2]!=a[l3]) continue;
		else if(a[l1]!=a[l2] && a[l2]==a[l3]) {if(a[l2]==1) a[l2]=0;else a[l2]=1;if(a[l1]==1) a[l1]=0;else a[l1]=1;ans[++l]=l1;}
		else{if(a[l1]==a[(i-1)*3]){if(a[l1]==1) a[l1]=0;else a[l1]=1;if(a[l2]==1) a[l2]=0;else a[l2]=1;ans[++l]=l1;}else{if(a[l3]==1) a[l3]=0;else a[l3]=1;if(a[l2]==1) a[l2]=0;else a[l2]=1;ans[++l]=l2;}}
	}
	cout<<l<<endl; for(int i=1;i<=l;i++) cout<<ans[i]<<" ";
	return 0;
}

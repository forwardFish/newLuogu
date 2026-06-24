#include<bits/stdc++.h>
#define int long long 
using namespace std;
const int maxm=4e2+5;;
int a[maxm];
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int n,m;
	cin>>n>>m;
	for(int i=1;i<=m;i++)
	{
		int x,y;cin>>x>>y;
		a[i]=(1<<(x-1)) | (1<<(y-1));
	 } 
	 int ans=0;
	 for(int i=0;i<(1<<n);i++)
	 {
	 	bool pd=1;
	 	for(int j=1;j<=m;j++)
	 	{
	 		if((i&a[j])==a[j])
	 		{
	 			pd=0;
	 			break;
			 }
		 }
		 if(pd) ans++;
	 }
	 cout<<ans;
	return 0;
 } 
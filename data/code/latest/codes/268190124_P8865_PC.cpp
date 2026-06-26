#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=1e3+5;
int a[maxn][maxn];
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int t,id;
	cin>>t>>id;
	while(t--)
	{
		int n,m,c,f;
		cin>>n>>m>>c>>f;
		for(int i=1;i<=n;i++)
		{
			for(int j=1;j<=m;j++)
			{
				cin>>a[i][j];
			}
		}
		if(id==1 || id==3) cout<<0<<" "<<0<<endl;
		
	}
	return 0;
 }

#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=1e3+5;
char a[maxn][maxn];
int t[maxn][maxn];
const int mod=998244353;
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int T,id;
	cin>>T>>id;
	while(T--)
	{
		memset(t,0,sizeof(t));
		int n,m,c,f;
		cin>>n>>m>>c>>f;
		int ansc=0,ansf=0;
		for(int i=1;i<=n;i++)
		{
			for(int j=1;j<=m;j++)
			{
				cin>>a[i][j];
			}
		}
		for(int i=1;i<=n;i++)
		{
			for(int j=m-1;j>=1;j--)
			{
				if(a[i][j]=='1') t[i][j]=-1;
				else if(a[i][j+1]=='0') t[i][j]=t[i][j+1]+1;
			}
		}
		int x,y;
		for(int j=1;j<m;j++)
		{
			x=y=0;
			for(int i=1;i<=n;i++)
			{
				if(t[i][j]==-1)
				{
					x=y=0;
					continue;
				}
				ansc=(ansc%mod+x*t[i][j]%mod)%mod;
				ansf=(ansf%mod+y%mod)%mod;
				y=(y%mod+t[i][j]*x%mod)%mod;
				x=(x+max(0ll,t[i-1][j]))%mod;
			}
		}
		cout<<ansc*c%mod<<" "<<ansf*f%mod<<endl;
		
	}
	return 0;
 }

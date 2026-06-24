#include<bits/stdc++.h>
using namespace std;
const int maxn=1e3+5;
char a[maxn][maxn];
int bj[maxn][maxn];
int main()
{
	int t;
	cin>>t;
	while(t--)
	{
		int n,m,k;
		cin>>n>>m>>k;
		int x,y,d;
		cin>>x>>y>>d;
		for(int i=1;i<=n;i++)
		{
			for(int j=1;j<=m;j++)
			{
				cin>>a[i][j];
			}
		}
		bj[x][y]++;
		for(int i=1;i<=k;i++)
		{
			if(d==0 && y+1<=m && a[x][y+1]=='.')
			{
				y++;
			}
			else if(d==1 && x+1<=n && a[x+1][y]=='.')
			{
				x++;
			}
			else if(d==2 && y-1>=1 && a[x][y-1]=='.')
			{
				y--;
			}
			else if(d==3 && x-1>=1 && a[x-1][y]=='.')
			{
				x--;
			}
			else
			{
				d=(d+1)%4;
			}
			bj[x][y]++;
		}
		int ans=0;
		for(int i=1;i<=n;i++)
		{
			for(int j=1;j<=m;j++)
			{
				if(bj[i][j]>=1)
				{
					ans++;
				}
			}
		}
		cout<<ans<<endl;;
	}
	return 0;
}

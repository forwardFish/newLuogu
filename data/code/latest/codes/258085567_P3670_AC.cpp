#include<bits/stdc++.h>
using namespace std;
int pd(char x)
{
	if(x=='A') return 1;
	if(x=='C') return 2;
	if(x=='T') return 3;
	if(x=='G') return 4;
}
const int maxn=5e2+5;
const int maxm=55;
int a[maxn][maxm],b[maxn][maxm];
int t[5][5][5];
int main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int n,m;
	cin>>n>>m;
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=m;j++)
		{
			char x;
			cin>>x;
			a[i][j]=pd(x);
		}
	}
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=m;j++)
		{
			char x;
			cin>>x;
			b[i][j]=pd(x);
		}
	}
	int ans=0;
	for(int i=1;i<=m-2;i++)
	{
		for(int j=i+1;j<=m-1;j++)
		{
			for(int k=j+1;k<=m;k++)
			{
				bool pd=1;
				memset(t,0,sizeof(t));
				for(int x=1;x<=n;x++)
				{
					t[a[x][i]][a[x][j]][a[x][k]]=1;
				}
				for(int x=1;x<=n;x++)
				{
					if(t[b[x][i]][b[x][j]][b[x][k]])
					{
						pd=0;break;	
					}
				}
				if(pd) ans++; 
			}
		}
            
	}
    cout<<ans;
	return 0;
}
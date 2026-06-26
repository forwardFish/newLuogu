#include<bits/stdc++.h>
using namespace std;
int n,m,ans;
int a[15][15],c[15][15],x[9]={0,1,1,1,0,0,-1,-1,-1},y[9]={0,1,-1,0,-1,1,0,1,-1};
void dfs(int i,int j,int xz)
{
    if(j>m)
	{
        i++;
        j=1;
    } 
    if(i>n)
	{
        if(xz>ans)
		{
			ans=xz;
		}
        return;
    }
    if(c[i][j]==0)
	{
        for(int k=1;k<9;k++)
		{
			c[i+x[k]][j+y[k]]++;
		}
        dfs(i,j+2,xz+a[i][j]);
        for(int k=1;k<9;k++)
		{
			c[i+x[k]][j+y[k]]--;
		}
    }
    dfs(i,j+1,xz);
}
int main()
{
    int t;
    cin>>t;
    while(t--)
	{
        cin>>n>>m;
        ans=0;
        for(int i=1;i<=n;i++)
		{
            for(int j=1;j<=m;j++)
			{
				cin>>a[i][j];
			}
        }
        memset(c,0,sizeof(c));
        dfs(1,1,0);
        cout<<ans;
    }
    return 0;
}

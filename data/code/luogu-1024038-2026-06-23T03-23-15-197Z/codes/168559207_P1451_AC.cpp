#include<bits/stdc++.h>
using namespace std;
int n,m,ans,a[105][105];
void dfs(int x,int y)
{
	if (x>n || y>m || x<0 || y<0) return;
	a[x][y]=0;
	if(a[x-1][y])
	{
		dfs(x-1,y);
	}
	if(a[x][y-1])
	{
		dfs(x,y-1);
	}	
	if(a[x+1][y])
	{
		dfs(x+1,y);
	}
	if(a[x][y+1])
	{
		dfs(x,y+1);
	}
}
int main(){
	cin>>n>>m;
	for (int i=0;i<n;i++)
	{
		for (int j=0;j<m;j++)
		{
			scanf("%1d",&a[i][j]);
		}
	}
	for (int i=0;i<n;i++)
	{
		for (int j=0;j<m;j++)
		{
			if(a[i][j])
			{
				ans++;
				dfs(i,j);
			}
		}
	}
	cout<<ans;
	return 0;
}
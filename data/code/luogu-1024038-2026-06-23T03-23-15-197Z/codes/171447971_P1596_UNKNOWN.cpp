#include<bits/stdc++.h>
using namespace std;
const int MAXN=100;
char grid[MAXN][MAXN];
bool vis[MAXN][MAXN];
int n,m;
void dfs(int i,int j)
{
    if (i < 0 || i >= n || j < 0 || j >= m || grid[i][j] == '.' || vis[i][j]) return;
    vis[i][j] = true;1
    dfs(i+1,j);
    dfs(i-1,j);
    dfs(i,j+1);
    dfs(i,j-1);
    dfs(i+1,j+1);
    dfs(i+1,j-1);
    dfs(i-1,j+1);
    dfs(i-1,j-1);
}
int main() {
    cin>>n>>m;
    for (int i=0;i<n;++i)
	{
        for (int j=0;j<m;++j)
		{
            cin>>grid[i][j];
        }
    }
    int count=0;
    for (int i=0;i<n;++i)
	{
        for (int j=0;j<m;++j)
		{
            if (grid[i][j] == 'W' && !vis[i][j])
			{
                dfs(i, j);
                count++;
            }
        }
    }
    cout<<count<<endl;
    return 0;
}

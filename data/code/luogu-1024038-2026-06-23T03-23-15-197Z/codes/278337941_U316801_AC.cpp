#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;const int maxn=1e3+5;const int dx[]={0,0,-1,1};const int dy[]={1,-1,0,0};int c[maxn][maxn];int n,m;set<int> s;void dfs(int x,int y){s.insert(c[x][y]);c[x][y]=0;for(int i=0;i<4;i++){int xx=x+dx[i],yy=y+dy[i];if(xx>=1 && xx<=n && yy>=1 && yy<=m && c[xx][yy]!=0){dfs(xx,yy);}}}signed main(){ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);cin>>n>>m;for(int i=1;i<=n;i++){for(int j=1;j<=m;j++){cin>>c[i][j];} }int ans=0;for(int i=1;i<=n;i++){for(int j=1;j<=m;j++){if(c[i][j]!=0){s.clear();dfs(i,j);int l=s.size();ans=max(ans,l);}}}cout<<ans;return 0;}

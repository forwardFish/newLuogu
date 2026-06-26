#include<bits/stdc++.h>
using namespace std;
#define int long long 
const int maxn=1e3+5;
const int INF=-(1LL<<60);
int n,m,s,k;
int a[maxn][maxn],q[maxn*maxn][3];
int vis[maxn][maxn];
int dx[3]={0,0,1};
int dy[3]={-1,1,0};
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(0);
    int c,T;
    cin>>c>>T;
    while(T--){
        cin>>n>>m>>s>>k;
        for(int i=1;i<=n;i++)
        {
        	for(int j=1;j<=m;j++)
        	{
        		cin>>a[i][j];
			}
		}
        memset(vis,-1,sizeof(vis));
        int l=0,r=0;
        for(int j=1;j<=m;j++)
		{
            int ss=s+a[1][j];
            if(ss<0)continue;
            if(ss>k)ss=k;
            q[r][0]=1;q[r][1]=j;q[r][2]=ss;r++;
            vis[1][j]=ss;
        }
        while(l<r)
		{
            int x=q[l][0],y=q[l][1];
            int cnt=q[l][2];
            l++;
            for(int d=0;d<3;d++){
                int nx=x+dx[d],ny=y+dy[d];
                if(nx<1||nx>n||ny<1||ny>m)continue;
                int sum=cnt+a[nx][ny];
                if(sum<0)continue;
                if(sum>k)sum=k;
                if(sum<=vis[nx][ny])continue;
                vis[nx][ny]=sum;
                q[r][0]=nx;q[r][1]=ny;q[r][2]=sum;r++;
            }
        }
        int ans=-1;
        for(int j=1;j<=m;j++)
		{
			if(vis[n][j]>=0)
			{
				ans=max(ans,vis[n][j]);
			}
		}
        cout<<ans<<"\n";
    }
    return 0;
}

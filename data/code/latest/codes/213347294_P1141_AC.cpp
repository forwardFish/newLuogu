#include<bits/stdc++.h>
using namespace std;
const int maxn=1e3+5;
const int dx[4]={0,0,-1,1};
const int dy[4]={1,-1,0,0};
char c[maxn][maxn];
int vis[maxn][maxn],a[maxn*maxn];
struct mg
{
    int x,y;
}q[1000001];
int main()
{
    int sx,sy,i,j,n,m,l,nx,ny,k,f,r,sum,d;
    cin>>n>>m;
    memset(a,0,sizeof(a));
    memset(vis,0,sizeof(vis)); 
    for(i=1;i<=n;i++)
        for(j=1;j<=n;j++)
            cin>>c[i][j]; 
    d=0;
    for(i=1;i<=n;i++)
        for(j=1;j<=n;j++)
            if(vis[i][j]==0)
            {
                d++;
                f=1;
                r=1;
                q[f].x=i;
                q[f].y=j;
                vis[i][j]=d;
                sum=1;
                while(f<=r)
                {
                    for(k=0;k<4;k++)
                    {
                        nx=q[f].x+dx[k];
                        ny=q[f].y+dy[k];
                        if(vis[nx][ny]==0 && nx>=1 && nx<=n && ny>=1&&ny<=n && ((c[nx][ny]=='1'&&c[q[f].x][q[f].y]=='0')||(c[nx][ny]=='0'&&c[q[f].x][q[f].y]=='1')))
                        {
                            r++;
                            sum++;
                            vis[nx][ny]=d;
                            q[r].x=nx;
                            q[r].y=ny; 
                        }
                    }
                    f++;
                }
                a[d]=sum; 
            }
    for(i=1;i<=m;i++)
    {
        cin>>sx>>sy;
        cout<<a[vis[sx][sy]]<<endl;
    }
    return 0;
}
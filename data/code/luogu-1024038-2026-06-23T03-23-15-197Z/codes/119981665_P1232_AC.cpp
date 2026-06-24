#include<iostream>
#include<cstdio>
#include<algorithm>
#include<cstring>
#include<cmath>
using namespace std;
typedef long long ll;
inline int read()
{
    int x=0,f=1; char ch=getchar();
    while(ch<'0'||ch>'9') { if(ch=='-') f=-1; ch=getchar(); }
    while(ch>='0'&&ch<='9') { x=(x<<1)+(x<<3)+(ch^48); ch=getchar(); }
    return x*f;
}
const int N=2e6+7;
int n;
double ans;
int dfn[N],pos[N],sum[N];
inline void mark(int x,int y) { sum[x]++,sum[y+1]--; }
int main()
{
    n=read();
    ans=1; mark(1,1);
    for(int i=1;i<=n;i++) dfn[read()]=i;
    for(int i=1;i<=n;i++) pos[dfn[read()]]=i;
    for(int i=1;i<=n;i++) dfn[pos[i]]=i;
    for(int i=1;i<n;i++)
    {
        if(dfn[i]>dfn[i+1]) ans++,mark(i,i);
        if(pos[i]<pos[i+1]-1) mark(pos[i],pos[i+1]-1);
    }
    int now=0;
    for(int i=1;i<n;i++) now+=sum[i],ans+=(now ? 0 : 0.5);
    ans+=1;
    printf("%.3lf",ans);
    return 0;
}
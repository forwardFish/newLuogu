#include<bits/stdc++.h>
using namespace std;
int n,m,f[101][100],Ans=2147483647;
struct Node
{
    int h,l;
}s[101];
bool cmp(const Node &a,const Node &b) {return a.h<b.h;}
int Min(const int &a,const int &b) {return a<b?a:b;}
int Abs(const int &x) {return x<0?(-x):x;}
int main()
{
    scanf("%d%d",&n,&m);m=n-m;
    for(int i=1;i<=n;++i) scanf("%d%d",&s[i].h,&s[i].l);
    sort(s+1,s+n+1,cmp);
    for(int i=2;i<=n;++i) for(int j=2;j<=Min(i,m);++j)
    {
      f[i][j]=2147483647;
      for(int k=j-1;k<i;++k) f[i][j]=Min(f[i][j],f[k][j-1]+Abs(s[i].l-s[k].l));
    }
    for(int i=m;i<=n;++i) Ans=Min(Ans,f[i][m]);
    printf("%d",Ans);
    return 0;
}
#include<bits/stdc++.h>
using namespace std;
const int MAXN=1000001;
inline int read()
{
    char c=getchar();int x=0,f=1;
    while(c<'0'||c>'9')    {if(c=='-')    f=-1;c=getchar();}
    while(c>='0'&&c<='9')    x=x*10+c-48,c=getchar();return x*f;
}
int n;
int a[MAXN];
int main()
{
    n=read();
    for(int i=1;i<=n;i++)
        a[i]=read();
    int nowhigh=a[2],ans=0;
    for(int i=2;i<=n;i++)
    {
        if(a[i]>nowhigh)    nowhigh=a[i];
        if(a[i+1]<nowhigh&&a[i+2]>a[i+1])    ans++,nowhigh=a[i+2],i=i+1;
    }
    printf("%d",ans);
    return 0;
}
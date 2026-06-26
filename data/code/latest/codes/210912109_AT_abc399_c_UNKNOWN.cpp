#include<bits/stdc++.h>
using namespace std;
int main()
{
   ios::sync_with_stdio(0);cin.tie(0);
   int n,m;cin>>n>>m;
   int c=n;
   while(m--)
   { 
     int u,v;cin>>u>>v;
     int x=u;while(p[x]!=x){p[x]=p[p[x]];x=p[x];} //判断是否联通 
     int y=v;while(p[y]!=y){p[y]=p[p[y]];y=p[y];}
     if(x!=y){p[y]=x;c--;} //求出总联通块个数（记得判重） 
   }
   cout<<max(m-(n-c),0); // 记得防止负数 
}
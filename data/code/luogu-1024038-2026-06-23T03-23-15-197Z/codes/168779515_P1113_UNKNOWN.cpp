#include<bits/stdc++.h>
#pragma GCC optimize(2)
using namespace std;
#define a int
#define b cin
a n,m,s,t,ans[10005];
int main()
{
    cin>>n;
    for(int i=1;i<=n;i++)
	{
        b>>i;
        b>>s;
        a map=0;
        while(b>>t && t!=0)
        {
        	map=max(ans[t],map);
		}
        ans[i]=map+s;
        m=max(ans[i],m);
    } 
    cout<<m;
    return 0;
 } 
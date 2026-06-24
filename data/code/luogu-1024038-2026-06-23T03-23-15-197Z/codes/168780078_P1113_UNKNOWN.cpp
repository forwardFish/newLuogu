#include<bits/stdc++.h>
#pragma GCC optimize(2)
using namespace std;
int n,m,s,t,ans[10005];
int main()
{
    cin>>n;
    for(int i=1;i<=n;i++)
	{
        cin>>i;
        cin>>s;
        int map=0;
        while(cin>>t && t!=0)
        {
        	map=max(ans[t],map);
		}
        ans[i]=map+s;
        m=max(ans[i],m);
    } 
    cout<<m;
    return 0;
 } 
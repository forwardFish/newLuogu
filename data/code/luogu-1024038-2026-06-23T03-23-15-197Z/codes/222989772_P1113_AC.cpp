#include<bits/stdc++.h>
#define int long long 
using namespace std;
int n,s,t,ans[10005];
signed main()
{
	int n;
    cin>>n;
    int maxx=-1;
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
        maxx=max(ans[i],maxx);
    } 
    cout<<maxx;
    return 0;
 } 
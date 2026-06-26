#include<bits/stdc++.h>
using namespace std;
int a[15],b[15],n,zs=0x7fffff;
int dfs(int i,int c,int d)
{
    if(i>n)
	{
        if(c==1&&d==0)
		{
			return 0;
		}
        zs=min(abs(c-d),zs);
        return 0;
    }
    dfs(i+1,c*a[i],d+b[i]);
    dfs(i+1,c,d);
    return 0;
}
int main()
{
    cin>>n; 
    for(int i=1;i<=n;i++)
	{
        cin>>a[i]>>b[i];
    }
    dfs(1,1,0);
    cout<<zs;
    return 0;
}
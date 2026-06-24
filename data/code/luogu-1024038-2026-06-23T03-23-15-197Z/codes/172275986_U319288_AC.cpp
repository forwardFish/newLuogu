#include<bits/stdc++.h>
using namespace std;
const int N=1e5+10;
int c[N],a[N],f[N],dp[2][11];
int n;
int main()
{
    scanf("%d",&n);
    for(int i=1;i<=n;i++)
    {
        cin>>c[i]>>a[i];
	}
    int ans=0;
    for(int i=1;i<=n;i++)
    {
        for(int j=0;j<2;j++)
        {
            if(c[i]!=j)
            {
            	for(int k=1;k<=10;k++)
            	{
                    if(a[i]!=k)
                    {
                        f[i]=max(f[i],f[dp[j][k]]+1);                     	
					}           		
				}
			}
		}
        if(f[i]>f[dp[c[i]][a[i]]])
		{
			dp[c[i]][a[i]]=i;	
		}
		ans=max(ans,f[i]);	
    }
    cout<<ans;
    return 0;
}
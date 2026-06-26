#include<bits/stdc++.h>
#define int long long
using namespace std; 
const int maxn=1e3+5;
int s[maxn],ans,sum; 
signed main()
{  
	int x,n,z=0;
    cin>>x>>n;  
    for(int i=1;i<=n;i++) cin>>s[i]; 
    sort(s+1,s+1+n);
    while(sum<x)
    {  
        for(int i=n;i>=1;i--)
		{
			if(s[i]<=sum+1) 
			{
				z=i;
				break;
			}
		}   
        ans++;
        sum+=s[z];
    }   
    cout<<ans;
    return 0;
}
#include<bits/stdc++.h>
using namespace std; 
const int maxn=5e3+5;
const int maxm=1e6+5;
int a[maxn],vis[maxn];
int main()
{
	int n;
    cin>>n;
    for(int i=1;i<=n;i++)
	{
        cin>>a[i];
    }
    for(int i=1;i<=n;++i)
	{
        for(int j=i+1;j<=n;++j)
		{
            int c=abs(a[i]-a[j]);
            vis[c]=1;
        }
    }
    for(int i=n;i<maxm;++i)
	{
        if(!vis[i])
		{
            int f=1;
            for(int j=i;j<maxn;j+=i) 
			{
				if(vis[j])
				{
					f=0;
					break;
				}
			}
            if(f)
			{
            	
               	cout<<i<<endl;
                return 0;
            }
        }
    }
    return 0;
}

#include<bits/stdc++.h>
using namespace std;
int a[100001],b[100001],ans[100001],f[100001];
int main()
{
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
		ans[a[i]]=i;
	}
	for(int i=1;i<=n;i++)
	{
		cin>>b[i];
		f[i]=INT_MAX;
	}
	int cd=0;
	f[0]=0;
	for(int i=1;i<=n;i++)
	{
		int l=0,r=cd,zj;
		if(ans[b[i]]>f[cd])
		{
			f[++cd]=ans[b[i]];
		}
		else 
		{
			while(l<r)
			{	
		    	zj=(l+r)/2;
		    	if(f[zj]>ans[b[i]])
				{
					r=zj;	
				}
				else
				{
					 l=zj+1;
				 } 
			}
			f[l]=min(ans[b[i]],f[l]);
     	}
    }
    cout<<cd;
    return 0;
}
#include<bits/stdc++.h>
using namespace std;
int n,a[105],b[2][105],ans=0;
int main(){
    cin>>n;
    for(int i=1;i<=n;i++) 
	{
		scanf("%d",&a[i]);
	}
    a[0]=0;
    for(int i=1;i<=n;i++)
	{
		for(int j=0;j<i;j++) 
		{
			if(a[i]>a[j]) 
			{
				b[0][i]=max(b[0][i],b[0][j]+1);
			}
		}
	} 
    a[n+1]=0;
    for(int i=n;i>=0;i--)
    {
    	for(int j=n+1;j>i;j--) 
		{
			if(a[i]>a[j])
			{
				b[1][i]=max(b[1][i],b[1][j]+1);	
			}
		}
	}
    for(int i=1;i<=n;i++) 
    {
    	ans=max(b[0][i]+b[1][i]-1,ans);
	}
    cout<<n-ans;
    return 0;
}
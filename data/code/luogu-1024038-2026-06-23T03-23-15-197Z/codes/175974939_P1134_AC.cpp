#include<bits/stdc++.h>
using namespace std;
int n,ans=1;
int a[4]={6,8,4,2};
int main()
{
    cin>>n;
    while(n>0)
	{
        for(int i=1;i<=n%10;i++)
        {
        	if(i!=5)
			{
				ans=ans*i%10;
			}
		}
        n=n/5;
        ans=ans*a[n%4]%10;
    }
    cout<<ans;
    return 0;
}
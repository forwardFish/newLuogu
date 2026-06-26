#include<bits/stdc++.h>
using namespace std;
int main()
{
	int n,x,ans=0;
	cin>>n>>x;
	for(int i=1;i<=n;i++)
	{
		int cnt=i
		while(cnt!=0)
		{
			if(cnt%10==x)
			{
				ans++;
			}
			cnt/=10;
		}
	
	 } 
	 cout<<ans;
	return 0;
}

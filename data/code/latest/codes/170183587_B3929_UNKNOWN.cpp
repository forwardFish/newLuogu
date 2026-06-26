#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a,n;
	cin>>a>>n;
	int sum[1005];
	int s[n];
	for(int i=2;i<=1005;i++)
	{
		sum[i-2]=i*i;
	}
	for(int i=0;i<n;i++)
	{
		cin>>s[i];
		if(s[i]<a)
		{
			for(int j=0;j<1005;j++)
			{
				if(sum[j]>=a)
				{
					cout<<sum[j]<<endl;
					break;
				}
			}
		}
		else
		{
			for(int j=0;j<1005;j++)
			{
				if(s[i]%sum[j]==0)
				{
					cout<<"lucky"<<endl;
					break;
				}
			}
		}
		
	}
	return 0;
}
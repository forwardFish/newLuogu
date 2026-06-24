#include<bits/stdc++.h>
using namespace std;
long long n,a[1000005],t=1,ans;
int main()
{
	cin>>n;
	for(int i=0;i<n;i++)
	{
		cin>>a[i];
	}
	for(int i=0;i<n;i++)
	{
		if(a[i+1]>a[i])
		{
			t++;
			if(t>ans)
            {
                ans=t;
            }
		}
		else
        {
            t=1;
        }
	}
	cout<<ans;
	return 0;
}
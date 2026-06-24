#include<bits/stdc++.h>
using namespace std;
long long n,a[1000005],t=1;
int main()
{
	cin>>n;
	for(i=0;i<n;i++)
	{
		cin>>a[i];
	}
	for(j=0;j<n;j++)
	{
		if(a[j+1]>a[j])
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
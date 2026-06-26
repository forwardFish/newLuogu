#include<bits/stdc++.h>
using namespace std;
int n,k,q;
int l[200005],r[200005],q1[200005],q2[200005],t[200005];
int main()
{
	cin>>n>>k>>q;
	for(int i=0;i<n;i++)
	{
		cin>>l[i]>>r[i];
		for(int j=l[i];j<=r[i];j++)
		{
			t[j]++;
		}
	}
	int ans=0;
	for(int i=0;i<q;i++)
	{
		ans=0;
		cin>>q1[i]>>q2[i];
		for(int j=q1[i];j<=q2[i];j++)
		{
			if(t[j]>=k)
			{
				ans++;
			}
		}
		cout<<ans<<endl;
	}
	return 0;
}
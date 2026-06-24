#include<bits/stdc++.h>
using namespace std;
const int maxn=55;
int a[55],b,c,sum,l,r,ans;
int main()
{
    int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	cin>>l>>r;
    for(int i=1;i<=n;i++)
    {
        sum+=a[i];
    }
	if(sum<n*l||sum>n*r)
	{
		cout<<"-1";
		return 0;
	}
	for(int i=1;i<=n;i++)
	{
		if(a[i]<l)
		{
			b+=(l-a[i]);
		}
		if(a[i]>r) c+=(a[i]-r);
	}
	cout<<max(b,c);
    return 0;
}
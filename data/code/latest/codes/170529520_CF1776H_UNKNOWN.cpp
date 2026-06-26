#include<bits/stdc++.h>
using namespace std;
const int N=1e5+5;
int t,n,ans;
int a[N],b[N];
int main()
{
	cin>>t;
	while(t--)
	{
		cin>>n;
		for(int i=1;i<=n;i++) cin>>a[i];
		for(int i=1;i<=n;i++) cin>>b[i];
		int l=n,r=n;
		ans=0;
		while(l>0 && r>0)
		{
			if(a[l]==b[r])
			{
				r--;
				ans++;
			}
			l--;
		}
		cout<<n-ans<<endl;
	}
	return 0;
}
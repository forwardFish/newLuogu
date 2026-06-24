#include<bits/stdc++.h>
using namespace std;
#define int long long
const int maxn=2e5+5;
int a[maxn],f,n,x;
bool check(int mid)
{
	int sum=0;
	for(int i=1;i<=n;i++)
	{
		sum+=max(0LL,mid-a[i]);
	}
	return sum<=x;
}
int solve()
{
    int ans=0;
    int l=1;
    int r=INT_MAX;
    while(l<=r)
    {
        int mid=(r+l)/2;
        if(check(mid))
        {
        	l=mid+1;
        	ans=mid;
		}
		else r=mid-1;
	}	
	return ans;
}
signed main() 
{
    int t;
    cin >> t;
    while (t--)
	{
        cin>>n>>x;
        for (int i=1;i<=n;++i)
		{
            cin >> a[i];
        }
        cout<<solve()<<endl;
    }
    return 0;
}

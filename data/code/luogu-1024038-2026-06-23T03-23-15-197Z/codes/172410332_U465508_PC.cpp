#include<bits/stdc++.h>
using namespace std;
int main()
{
    int n,p;
    cin>>n>>p;
    int a[n];
    for (int i=0;i<n;++i)
	{
        cin>>a[i];
    }
    int ans=0;
    for (int i=1;i<p;++i)
	{
        if (a[i]<a[i-1])
		{
            ans++;
            a[i]=a[i-1];
        }
    }
    for (int i=n-2;i>=p;--i)
	{
        if (a[i]<a[i+1])
		{
            ans++;
            a[i]=a[i+1];
        }
    }
    cout<<ans<<endl;
    return 0;
}

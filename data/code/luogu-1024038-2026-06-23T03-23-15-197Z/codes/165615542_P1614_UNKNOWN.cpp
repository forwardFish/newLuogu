#include<bits/stdc++.h
using namespace std;
int main()
{
    int n,m,a[100001],zx=INT_MAX,t=0;
    cin>>n>>m;
    for (int i=1;i<=n;i++)
    {
        cin>>a[i];
    }
    for (int i=1;i<=n-m+1;i++)
    {
       for (int j=1;j<=m;j++)
       {
           t+=a[i+j-1];
       }
        if (t<zx)
		{
			zx=t;
		}
        t=0;
    }
    cout<<zx;
    return 0;
}
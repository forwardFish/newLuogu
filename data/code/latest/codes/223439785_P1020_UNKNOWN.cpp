#include<bits/stdc++.h>
using namespace std;
const int maxn=1e5+10;
int a[maxn],n;
int dp1[maxn],dp2[maxn];
int main()
{
	while(cin>>a[++n]);
    n--;
	int len1=1;

    dp1[len1]=a[1];
    for(int i=2;i<=n;i++)
	{
        if(a[i]<=dp1[len1])
		{
            dp1[++len1]=a[i];
        }
		else
		{
            int p=upper_bound(dp1+1,dp1+1+len1,a[i],greater<int>())-dp1;
            dp1[p]=a[i];
        }
    }
    cout<<len1<<endl;
    int len2=1;
    dp2[len2]=a[1];
    for(int i=2;i<=n;i++)
	{
        if(a[i]>dp2[len2])
		{
            dp2[++len2]=a[i];
        }
		else
		{
            int p=lower_bound(dp2+1,dp2+1+len2,a[i])-dp2;
            dp2[p]=a[i];
        }
    }
    cout<<len2<<endl;
    return 0;
}
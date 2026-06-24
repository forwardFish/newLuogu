#include<bits/stdc++.h>
using namespace std;
int sum[100005];
int a[100005];
int main()
{
    int n;
    cin>>n;
    int map=0;
    for(int i=1;i<=n;i++)
    {
        cin>>a[i];
        map+=a[i];
        sum[i]=sum[i-1]+a[i];
    }

    int ans=0; 
    for(int i=1;i<n;i++)
    {
        if(sum[i]==map-sum[i])
        {
        	ans++;
		}
    }
    cout<<ans;
    return 0;
} 
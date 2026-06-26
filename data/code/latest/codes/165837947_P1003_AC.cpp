#include<bits/stdc++.h>
using namespace std;
int a[100005], b[100005],c[100005],d[100005];
int main()
{
    int n,x,y;
    cin>>n;
    for(int i=0;i<n;i++)
	{
        cin>>a[i]>>b[i]>>c[i]>>d[i];
    }
    cin>>x>>y;
    int ans = -INT_MAX;
    for(int i = 0; i < n; i++)
	{
        if(x >= a[i] && y >= b[i] && x <= a[i] + c[i] && y <= b[i] + d[i])
		{
            ans = i + 1;
        }
    }
    cout<<ans;
    return 0;
}
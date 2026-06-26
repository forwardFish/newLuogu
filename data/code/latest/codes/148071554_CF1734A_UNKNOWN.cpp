#include <bits/stdc++.h>
using namespace std;
int main()
{
	int a[500]={0},s[500];
    int t, n;
    cin>>t;
    while(t--)
	{
        int map=0x3f3f3f3f;
        cin>>n;
        for(int i = 1; i <= n; i ++)
        {
        	cin>>a[i];
		}
        sort(a+1,a+n+1);
        for(int i=2;i<n;i++)
		{
            s[i]=abs(a[i-1]-a[i])+abs(a[i+1]-a[i]);
            map=min(map, s[i]);
        }
        cout<<map<<endl;
    }
    return 0;
}
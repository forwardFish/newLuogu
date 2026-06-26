#include<bits/stdc++.h>
using namespace std;
int main()
{
    int n,a[105],b,map=0;
    cin>>n;
    for(int i=1;i<=n;i++)
    {
    	cin>>a[i];
	}
    cin>>b;
    for(int i=1;i<=n;i++)
    {
    	if(a[i]==b)
    	{
    		map++;
		}
	}
    cout<<map;
    return 0;
}
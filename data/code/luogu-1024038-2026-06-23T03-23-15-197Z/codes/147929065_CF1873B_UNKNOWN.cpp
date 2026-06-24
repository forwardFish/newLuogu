#include<bits/stdc++.h>
using namespace std;
int t,n,a[20],ans=1;
int main(){
    cin>>t;
    for(int i=1;i<=t;i++)
	{
        ans=1;
        cin>>n;
        for(int j=1;j<=n;j++)
		{
			cin>>a[j];
		}
        sort(a+1,a+n+1);
        ++a[1];
        for(int j=1;j<=n;j++)
		{
			ans*=a[j];
		}
        cout<<ans<<endl;
    }
    return 0;
}
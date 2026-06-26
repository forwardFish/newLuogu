#include<bits/stdc++.h>
using namespace std;
int a[4];
int main()
{
    int t;
    cin>>t;
    while(t--)
	{
        int x;
        cin>>x>>a[1]>>a[2]>>a[3];
        if(a[x]==0) 
		{
			cout<<"No"<<endl;
		}
        else if(a[a[x]]==0) 
		{
			cout<<"No"<<endl;
		}
        else
        {
        	cout<<"Yes"<<endl;
		}
    }
}
#include<bits/stdc++.h>
using namespace std;
int a[1005],b[1005];
int main(){
    int n;
    cin>>n;
    for(int i=0;i<n;i++)
	{
        cin>>a[i];
    }
    for(int i=0;i<n-1;i++)
	{
        b[i]=abs(a[i]-a[i+1]);
    }
    sort(b+1,b+n);
    for(int i=1;i<n;i++)
	{
    	
        if(b[i]!=i)
		{
			cout<<"Not jolly";
			return 0;
		}
    }
    cout<<"Jolly";
    return 0;
}
#include<bits/stdc++.h>
using namespace std;
int n,s=0;
int main()
{
    cin>>n;
    for(int i=0;i<n;i++)
    {
    	s=s*10+n%10;
		n/=10;
	}
    cout<<s;
    return 0;
}
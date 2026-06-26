#include<bits/stdc++.h>
#define int long long
using namespace std;
bool check(int x)
{
	if(x==1) return 0;
	for(int i=2;i<=sqrt(x);i++)
	{
		if(x%i==0)
		{
			return 0;
		}
	}
	return 1;
}
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n;
	cin>>n;
	if(check(n-4))
	{
		cout<<"2 "<<"2 "<<n-4;
    	return 0;
    } 
    for(int i=3;i<n;i++)
    {
    	if(i%2==1 && check(i))
    	{
	    	for(int j=i;j<n;j++)
	    	{
	    		if(j%2==1 && check(j))
	    		{
	    			if(check(n-i-j))
	    			{
		    			cout<<i<<" "<<j<<" "<<n-i-j;
		    			return 0;
					}
	    		
				}
			}
		}
    	
	}
	return 0;
}




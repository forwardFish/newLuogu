#include<bits/stdc++.h>
#define int long long 
using namespace std;
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int a,b,c,k;
	cin>>a>>b>>c>>k;
	if(a==1 && b==1 && c==1 && k==6)
	{
		cout<<1;
	}
	else if((a==1 && b==1) || (a==1 && c==1) || (b==2 && c==2))
	{
		if(k==5)
		{
		    cout<<2;
		}
		else if(k==4)
		{
		    cout<<((a+b+c)-2)-2;
		}
		else
		{
		    cout<<0;
		}
	}
	else if(a==1 || b==1 || c==1)
	{
		if(k==4)
		{
		    cout<<4;
		}
		else if(k==3)
		{
		    if(a==1)
			{
				cout<<(b-2)*2+(c-2)*2;
		    }
			else if(b==1)
			{
				cout<<(a-2)*2+(c-2)*2;
		    }
			else
			{
				cout<<(a-2)*2+(b-2)*2;
		    }
		}
		else if(k==2)
		{
		    if(a==1)
			{
				cout<<(b-2)*(c-2);
		    }
			else if(b==1)
			{
				cout<<(a-2)*(c-2);
		    }
			else
			{
		        cout<<(b-2)*(a-2);
		    }
		}
		else
		{
   			cout<<0;
		}
	}
	else
	{
		if(k==3)
		{
		    cout<<8;
		}
		else if(k==2)
		{
		    cout<<((a-2)+(b-2)+(c-2))*4;
		}
		else if(k==1)
		{
		    cout<<((a-2)*(b-2)*2)+((b-2)*(c-2)*2)+((a-2)*(c-2)*2);
		}
		else if(k==0)
		{
		    cout<<(a-2)*(b-2)*(c-2);
		}
		else
		{
		    cout<<0;
		}
	}
	return 0;
 } 
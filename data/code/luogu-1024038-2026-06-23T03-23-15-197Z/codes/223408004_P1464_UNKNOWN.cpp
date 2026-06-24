#include<bits/stdc++.h>
#define int long long
using namespace std;
int w(int a,int b,int c)
{
	if(a<=0 || b<=0 || c<=0) return 1;
	if(a>20 || b>20 || c>20) return w(20,20,20);
	if(a<b && b<c)
	{
		 return w(a,b,c-1)+w(a,b-1,c-1)-w(a,b-1,c);
	}
	else
	{
		return w(a-1,b,c)+w(a-1,b-1,c)+w(a-1,b,c-1)-w(a-1,b-1,c-1);
	}
}

signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int a,b,c;
	while(cin>>a>>b>>c)
	{
		if(a==-1 && b==-1 && c==-1)
		{
			return 0;
		}
		cout<<"w("<<a<<", "<<b<<", "<<c<<") = "<<w(a,b,c)<<endl;
	}
	
	
	
	return 0;
}




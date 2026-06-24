#include<bits/stdc++.h>
using namespace std;
int main()
{
	string a,b;
	cin>>a>>b;
	for (int i=0;i<b.size();i++)
	{
		int t=(a[i%a.size()]&31)-1;
		b[i]=(b[i]&31)-t>0?b[i]-t:b[i]-t+26;
//		if(b[i]&31-t>0)
//		{
//			b[i]-=t;
//		}
//		else
//		{
//			b[i]=b[i]-t+26;
//		}
	}
	cout<<b<<endl;
	return 0;
}

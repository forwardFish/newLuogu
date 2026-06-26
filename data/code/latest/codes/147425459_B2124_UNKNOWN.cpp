#include<bits/stdc++.h>
using namespace std;
string a,b;
int main()
{
	cin >> a;
	b=a;
	reverse(a.begin(), a.end());
	if(a==b)
	{
		cout<<"Yes";
	}
    else
    {
    	cout<<"No";
	}
	return 0;
}
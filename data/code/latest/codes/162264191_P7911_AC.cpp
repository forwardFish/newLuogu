#include <bits/stdc++.h>
using namespace std;
int n;
bool Check(string s)
{
  	long long a, b, c, d, e;
  	if (sscanf(s.c_str(), "%lld.%lld.%lld.%lld:%lld", &a, &b, &c, &d, &e) != 5) 
  	{
		return false;
  	}
  	if (a < 0 || a > 255 || b < 0 || b > 255 || c < 0 || c > 255 || d < 0 || d > 255 || e < 0 || e > 65535) 
	{
	  	return false;
	}
  	stringstream ss;
  	ss<<a<<'.'<<b<<'.'<<c<<'.'<<d<<':'<<e;
  	return ss.str() == s;
}
map<string, int> a;
string b, c;
int main()
{
  	cin >> n;
  	for (int i = 1; i <= n; i++)
  	{
    	cin >> b >> c;
    	if (!Check(c))
		{
			cout << "ERR\n";
			continue;
		}
    	if (b[0] == 'S')
		{
      		if(a[c])
			{
		 	 	cout << "FAIL\n";
			}
      		else 
			{
		  		a[c] = i;
				cout << "OK\n";
			}
    	}
		else
		{
      		if (!a.count(c))
	  		{
	  			cout << "FAIL\n";
	  		}
      		else 
	  		{
	  			cout << a[c] << '\n';
	  		}
    	}
  	}
  	return 0;
}
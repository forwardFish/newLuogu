#include <bits/stdc++.h>
using namespace std;
int main()
{
    string s;
    getline(cin,s);
    int map=0;
    for (int i=0;i<=s.length()-1;i++)
	{
        if (s[i]<='9'&&s[i]>='0')
        {
            map++;	
		}
    }
    cout<<map;
    return 0;
}
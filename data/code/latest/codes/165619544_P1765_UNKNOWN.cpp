#include<bits/stdc++.h>
using namespace std;
int main()
{
	int map;
	string a;
	int b[26]={1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,4,1,2,3,1,2,3,4};
    cin>>a;
    for(int i=0;i<a.size();i++)
    {
        if(a[i]>='a' && a[i]<='z') 
		{
			map+=b[a[i]-'a'];
		}
        if(a[i]==' ') 
		{
			map++;
		}
    }
    cout<<map;
    return 0;
}
#include<bits/stdc++.h>
using namespace std;
map<string,string> fa;
string get(string x)
{
	if(fa[x]==x) return x;
	return fa[x]=get(fa[x]);
}
int main()
{
	string s,s1,s2;
	char opt;
	cin>>opt;
	while(opt!='$')
	{
		cin>>s;
		if(opt=='#')
		{
			s1=s;
			if(fa[s]=="")
			{
				fa[s]=s;
			}
		}
		else if(opt=='+')
		{
			fa[s]=s1;
		}
		else
		{
			cout<<s<<" "<<get(s)<<endl;
		}
		cin>>opt;
	}
	
 } 
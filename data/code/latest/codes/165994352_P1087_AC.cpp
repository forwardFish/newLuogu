#include<bits/stdc++.h>
using namespace std;
int n;
char s[1<<20];
char t[1<<20];
void dfs(int x)
{
	if(x>=(1<<n))
	{
		if(s[x]=='1')
		{
			t[x]='I';
		}
		else
		{
			t[x]='B';
		}
		cout<<t[x];
		return;
	}
	dfs(2*x);
	dfs(2*x+1);
	if(t[2*x]==t[2*x+1])
	{
		t[x]=t[2*x];
	}
	else
	{
		t[x]='F';
	}
	cout<<t[x];
}
int main()
{
	cin>>n;
	for(int i=(1<<n);i<(1<<(n+1));i++)
	{
		cin>>s[i];
	}
	dfs(1);
	return 0;
} 
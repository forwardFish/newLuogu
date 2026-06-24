#include<bits/stdc++.h>
using namespace std;
int a[2000],b[2000],e=0,f=0,h[2000],j=1,x=0;
char c[2000],d[2000];
int main()
{
	cin>>c>>d;
	e=strlen(c);
	f=strlen(d);
	for(int i=1;i<=e;i++)
	{
		a[i]=c[e-i]-'0';
	}
	for(int i=1;i<=f;i++)
	{
		b[i]=d[f-i]-'0';
	}
	while(j<=e || j<=f)
	{
		h[j]=a[j]+b[j]+x;
		x=h[j]/10;
		h[j]%=10;
		j++;
	}
	c[j]=x;
	while(h[j]==0&&j>1)
	{
		j--;
	}
	for(int i=j;i>=1;i--)
	{
		cout<<h[i];
	}
	return 0;
}
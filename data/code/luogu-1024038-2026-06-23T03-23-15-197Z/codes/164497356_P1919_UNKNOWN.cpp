#include<bits/stdc++.h>
#define maxn 10005
using namespace std;
int a[maxn],b[maxn],c[maxn];
int main()
{
	string A,B;
	cin>>A>>B;
	int lena=A.size(),lenb=B.size();
	for(int i=0;i<lena;i++)
	{
		a[lena-i]=A[i]-'0';
	}
	for(int i=0;i<lenb;i++)
	{
		b[lenb-i]=B[i]-'0';
	}
	for(int i=1;i<=lena;i++)
	{
		int x=0;
		for(int j=1;j<=lenb;j++)
		{
			c[i+j-1]=a[i]*b[i]+x+c[i+j-1];
			x=c[i+j-1]/10;
			c[i+j-1]%=10;
		}
		c[i+lenb]=x;
	}
	int lenc=lena+lenb;
	while(c[lenc]==0 && lenc>1)
	{
		lenc--;
	}
	for(int i=lenc;i>=1;i--)
	{
		cout<<c[i];
	}
	return 0;
}
#include<bits/stdc++.h> 
#define fo(a,b,c)for(a=b;a<=c;a++)
#define fd(a,b,c)for(a=b;a>=c;a--)
using namespace std;
unsigned long long p[64];
unsigned long long m;
int n,i,j,k,l;
int main()
{
	freopen("code.in","r",stdin);
	freopen("code.out","w",stdout);
	p[0]=1;
	fo(i,1,63)
	p[i]=p[i-1]*2;
	cin>>n>>m;
	fd(i,n-1,0)
	if (m<p[i])
	printf("0");
	else
	printf("1"),m=p[i]-(m-p[i])-1;
	printf("\n");
	fclose(stdin);
	fclose(stdout);
	return 0;
}
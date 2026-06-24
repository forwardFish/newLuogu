#include<bits/stdc++.h>
using namespace std;
const int maxn=5e6+5;
int ds[maxn];
int d[maxn];
int main()
{
    for(int i=1;i<=maxn; ++i) 
	{
        int num=i;
        int sum=0;
        int p1=1;
        while (num > 0)
		{
            int g=num%10;
            sum+=g;
            p1*=g;
            num/=10;
        }
        ds[i]=sum;
        d[i]=p1;
    }
    int t;
    cin>>t;
    while(t--)
	{
        int m,n,k;
        cin>>m>>n>>k;
        int b=-1;
        int p=-1;
        for(int x=m;x<=n;++x)
		{
            if(ds[x]==k)
			{
                int pr=d[x];
                if(pr > p || (pr == p && x < b))
				{
                    p=pr;
                    b=x;
                }
            }
        }
        cout<<b<<" "<<p<<endl;
    }
    return 0;
}

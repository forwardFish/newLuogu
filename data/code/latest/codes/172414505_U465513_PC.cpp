#include<bits/stdc++.h>
using namespace std;

int a(int b)
{
    int c=0;
    while (b > 0)
	{
        c+=b%10;
        b/=10;
    }
    return c;
}
int d(int b)
{
    int c=1;
    while (b > 0)
	{
        c*=b%10;
        b/=10;
    }
    return c;
}
int main()
{
    int T;
    cin>>T;
    while (T--)
	{
        int M,N,k;
        cin>>M>>N>>k;
        int e=-1;
        int ma=-1;
        for (int x=M;x<=N;++x)
		{
            if (a(x) == k)
			{
                int p = d(x);
                if (p > ma || (p == ma && x < e))
				{
                    ma=p;
                    e=x;
                }
            }
        }
        cout<<e<< " " <<ma<<endl;
    }
    return 0;
}

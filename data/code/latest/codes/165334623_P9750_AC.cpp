#include<bits/stdc++.h> 
using namespace std;
int gcd(int a,int b)
{
    return b==0 ? abs(a) : gcd(b,a % b);
}
void s(int &e,int &f) 
{
    if (f<0)
    {
        e=-e;
        f=-f;
    }
    int g=gcd(abs(e), abs(f));
    e/=g;
    f/=g;
}
string r(int p, int q)
{
    s(p,q);
    if (q==1)
	{
		return to_string(p);
	}
    else 
	{
		return to_string(p) + "/" + to_string(q);
	}
}
int main() 
{
    int t, m;
    cin >>t>>m;
    while (t--)
    {
        int a, b, c;
        cin>>a>>b>>c;
        long long d =1LL*b*b-4LL*a*c;
        if (d<0)
		{
            cout<<"NO"<<endl;
            continue;
        }
        int x1, x12, x2,x21;
        if (d==0)
		{
            x1=-b;
            x12=2*a;
            cout<<r(x1,x12)<<endl;
        }
		else
		{
            long long kf=static_cast<long long>(sqrt(d));
            if (kf*kf==d)
			{ 
                x1=-b+kf;
                x12=2*a;
                x2=-b-kf;
                x21=2*a;
                string x1_str=r(x1,x12);
                string x2_str=r(x2,x21);
                if(x1*x21>=x2*x12)
				{
                    cout<<x1_str<<endl;
                } 
				else 
				{
                    cout<<x2_str<<endl;
                }
            } 
			else 
			{
                int q1=-b;
                int q12=2*a;
                s(q1,q12);
                int q2=1;
                for(int i = 2;i * i <= d;i++)
                {
                	while (d % (i * i) == 0) 
					{
						q2 *= i,d /= (i * i);
					}
				}
                int q21=abs(2*a);
                s(q2,q21);
                if (q1!=0)
				{
                    printf("%d",q1);
                    if (q12!=1) printf("/%d",q12);
                    printf("+");
                }
                if (q2!=1)
				{
                    printf("%d*",q2);
                }
                printf("sqrt(%d)",d);
                if (q21!=1){
                    printf("/%d",q21);
                }
                printf("\n");
            }
        }
    }
    return 0;
}
#include<bits/stdc++.h> 
using namespace std;
long long gcd(long long a,long long b)
{
    return b==0 ? abs(a) : gcd(b,a % b);
}
void s(long long &e,long long &f) 
{
    if (f<0)
    {
        e=-e;
        f=-f;
    }
    long long g=gcd(abs(e), abs(f));
    e/=g;
    f/=g;
}
string r(long long p, long long q)
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
    long long t, m;
    cin >>t>>m;
    while (t--)
    {
        long long a, b, c;
        cin>>a>>b>>c;
        long long d =1LL*b*b-4LL*a*c;
        if (d<0)
		{
            cout<<"NO"<<endl;
            continue;
        }
        long long x1, x12, x2,x21;
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
                long long q1=-b;
                long long q12=2*a;
                s(q1,q12);
                long long q2=1;
                long long q21=2*a;
                s(q2,q21);
                string q1_str=r(q1,q12);
                string q2_str=r(q2,q21);
                if(q1==0)
                {
                	 cout<<(q1==0 ? "":"+")<<(q2_str=="1"?"":(q2_str=="1/" ?"":q2_str))<<"sqrt("<<d<<")"<<endl;
				}
				else
				{
					 cout<<q1_str<<(q1==0 ? "":"+")<<(q2_str=="1"?"":(q2_str=="1/" ?"":q2_str))<<"sqrt("<<d<<")"<<endl;
				 } 
            }
        }
    }
    return 0;
}
//解题思路
//计算判别式：首先计算判别式 Delta =b^2 - 4ac。
//
//若 Delta < 0，则方程无实数解，输出 NO。
//若 Delta geq=0，则方程有实数解。
//解的计算：
//
//若 Delta = 0，方程有一个实数解 x=-b/2a。
//若 Delta > 0，方程有两个实数解 x_1=(-b+sqrt(Delta))/2a 和 x_2=(-b-sqrt(Delta))/2a。选择其中较大者作为输出。
//有理数的输出格式：
//
//我们需要将结果表示为有理数的格式：p/q。
//确保分母 q > 0 并且 gcd(p, q) = 1。
//若 q = 1,则输出 p，否则输出 p/q。
//处理有理数形式：
//
//使用欧几里得算法来计算 gcd。
//对于非整数结果，需要将其处理为最简分数形式
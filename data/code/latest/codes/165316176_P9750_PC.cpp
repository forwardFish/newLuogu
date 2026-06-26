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
    int T, M;
    cin >> T >> M;
    while (T--)
    {
        int a, b, c;
        cin >> a >> b >> c;
        long long d =1LL*b*b-4LL*a*c;
        if (d < 0)
		{
            cout << "NO" << endl;
            continue;
        }
        int x1, x12, x2,x21;
        if (d == 0)
		{
            x1 = -b;
            x12 = 2 * a;
            cout << r(x1, x12) << endl;
        }
		else
		{
            long long kf = static_cast<long long>(sqrt(d));
            if (kf * kf == d)
			{ 
                x1 = -b + kf;
                x12 = 2 * a;
                x2 = -b - kf;
                x21= 2 * a;
                string x1_str = r(x1, x12);
                string x2_str = r(x2, x21);
                if(x1 * x21>= x2 * x12)
				{
                    cout << x1_str << endl;
                } 
				else 
				{
                    cout << x2_str << endl;
                }
            } 
			else 
			{
                int q1=-b;
                int q12 = 2 * a;
                s(q1, q12);
                int q2 = 1;
                int q21 = 2 * a;
                s(q2, q21);
                string q1_str=r(q1, q12);
                string q2_str=r(q2, q21);
                cout<<q1_str<<(q1==0 ? "":"+")<<(q2_str=="1"?"":(q2_str=="1/" ?"":q2_str))<<"sqrt("<<d<<")"<<endl;
            }
        }
    }
    return 0;
}

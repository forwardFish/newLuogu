#include<bits/stdc++.h>
using ll=long long;
using lld=unsigned long long;
using namespace std;
inline int read()
{
    int x=0,f=1;char ch=getchar();
    while(!isdigit(ch)){if(ch=='-') f=-1;ch=getchar();}
    while(isdigit(ch)){x=x*10+ch-'0';ch=getchar();}
    return x*f;
}
inline void write(int x)
{
    if(x<0){putchar('-');x=-x;}
    if(x>9) write(x/10);
    putchar(x%10+'0');
}
#define int long long
#define endl "\n"
const int mod1=19650827;
const int mod=1e9+7;
const int maxn=2e5+5;
vector<int> a[3];
int mex(int x,int y)
{
	if(x!=0 && y!=0) return 0;
	if(x==1 || y==1) return 2;
	return 1;
}
void push(int x)
{
	if(x==0) a[0].push_back(0);
    else if(x==1) a[1].push_back(1);
    else a[2].push_back(2);
}
void print(int x,int y)
{
	cout<<x<<" "<<y<<endl;
	push(mex(x,y));
}
int p0()
{
	a[0].pop_back();
	return 0;
}
int popn()
{
	if (!a[2].empty())
	{
        int x=a[2].back();
        a[2].pop_back();
        return x;
    }
    int x=a[1].back();
    a[1].pop_back();
    return x;
}
int popa()
{
	if (!a[2].empty())
	{
        int x=a[2].back();
        a[2].pop_back();
        return x;
    }
    if (!a[1].empty())
	{
        int x=a[1].back();
        a[1].pop_back();
        return x;
    }
    return p0();
 } 
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int t;
	cin>>t;
	while(t--)
	{
		int n;
		cin>>n;
		for(int i=0;i<3;i++)
		{
			a[i].clear();
		} 
		for(int i=1;i<=n;i++)
		{
			int x;
			cin>>x;
			if(x==0) a[0].push_back(0);
			else if(x==1) a[1].push_back(1);
			else a[2].push_back(x);
			
		}
		int z=a[0].size();
		if(n==1)
		{
			cout<<-1<<endl; 
			continue;
		}
		else if(n==2) 
		{
			if(z!=0)
			{
				cout<<-1<<endl;continue;
			}
			print(popa(),popa());
			continue;
		}
		else if(n==3)
		{
			if(z==0 || z==3) 
			{
				cout<<-1<<endl;continue;
			}
			if(z==2)
			{
				print(p0(),p0());
			}
			else
			{
				print(p0(),popn());
			}
			print(popn(),popn());
			continue;
		}
		while(a[0].size()+a[1].size()+a[2].size()>4)
		{
			print(popa(),popa());
		}
		z=a[0].size();
        if(z<=1) print(popn(),popn());
        else if(z==2) print(p0(),popn());
        else print(p0(),p0()); 
        z=a[0].size();
        if(z==2) print(p0(),p0());
        else print(p0(),popn());
        print(popn(),popn());
		
	}
	return 0;
}

 






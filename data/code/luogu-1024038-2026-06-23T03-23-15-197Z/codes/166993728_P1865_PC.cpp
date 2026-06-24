#include<bits/stdc++.h>
using namespace std;
int f[1000001];
bool v[1000001];
void ss(int n)
{
    f[1]=0;
    v[1]=true;
    for(int i=2;i<=n;i++)
    {
        if(v[i]==false)
        {
            f[i]=f[i-1]+1;
            for(int j=i*2;j<=n;j+=i)
            {
                v[j]=true;
            }
        }
        else f[i]=f[i-1];
    }
}

int main()
{
    int n,m;
    cin>>n>>m;
    ss(n);
    for(int i=1;i<=m;i++)
    {
        int l,r;
        cin>>l>>r;
        if(l<1 || r>n) 
		{
			cout<<"Crossing the line"<<endl;
		}
        else 
        {
            cout<<f[r]-f[l-1]<<endl;
        }
    }
    return 0;
}
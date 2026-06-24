#include <bits/stdc++.h>
using namespace std;       
int main()
{
	int n;
    cin>>n;
    int a[n],b[n],t[n],map=0;     
    for (int i=1;i<=n;i++)
	{
		cin>>a[i]>>b[i]>>t[i];
	}
    for (int i=1;i<=n;i++)
	{
        if(a[i]==0)
		{
			map+=b[i];
		}
        else
		{
            bool f=false;
            for (int j=max(1,i-45);j<i;j++)
			{
                if (a[j]==0 && t[i]-t[j]<=45 && b[j]>=b[i])
				{
                    a[j]=1;
                    f=true;
                    break;
                }
            }
            if(!f)
			{
				map+=b[i];
			}
        }
    }
    cout<<map<<endl;
    return 0;
}

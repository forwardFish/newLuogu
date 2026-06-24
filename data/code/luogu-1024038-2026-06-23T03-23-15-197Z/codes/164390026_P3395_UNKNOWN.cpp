#include<bits/stdc++.h>
using namespace std;
int main()
{
	int t;
    cin>>t;
    int a[1005][1005];
    for(int i=0;i<t;i++)
    {
    	int n;
        cin>>n;
        for(int j=1;j<=2*n-2;j++)
        {
        	int x,y;
            cjn>>x>>y;
            if(x==n && y==n && x+y-2<j)
            {
                cout<<"No"<<endl;
                break;
            }
            if(x+y-2>j)
            {
            	a[x][y]=-1;
			}
        }
        a[1][1]=1;
        for(int i=1;i<=n;i++)
        {
        	for(int j=1;j<=n;j++)
        	{
        		if((a[i-1][j]==1 || a[i][j-1]==1) && a[i][j]!=-1)
        		{
                   a[i][j]=1;       			
				}
			}
		}
        if(a[n][n]==1)
        {
            cout<<"Yes"<<endl;        	
		}
        else
        {
            cout<<"No"<<endl;
    	}
        if(q!=t)
        {
        	for(int i=1;i<=n;i++)
        	{
        		for(int j=1;j<=n;j++)
        		{
        			a[i][j]=0; 
				}
			}       	
		}
    }
}

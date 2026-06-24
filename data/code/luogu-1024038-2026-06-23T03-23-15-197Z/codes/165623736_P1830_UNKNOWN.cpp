#include<bits/stdc++.h> 
using namespace std;   
int n,m,t1,t2,ans[1000][1000],hz[1000][1000],x1,x2,y1,y2; 
int main()
{  
    cin>>n>>m>>t1>>t2;
    for (int k=1;k<=t1;k++)
	{  
        cin>>x1>>y1>>x2>>y2;
        for(int i=x1;i<=x2;i++)  
        {
        	for(int j=y1;j<=y2;j++)
		  	{  
             	ans[i][j]++; 
             	hz[i][j]=k;
        	}  
		}
    }  
    for (int k=1;k<=t2;k++)
	{  
        scanf("%d%d",&x1,&y1);  
        if (ans[x1][y1]!=0) 
		{
			cout<<"Y"<<" "<<ans[x1][y1]<<" "<<hz[x1][y1]<<endl; 
		}
		else 
		{
			cout<<"N";
		} 
    }  
}  
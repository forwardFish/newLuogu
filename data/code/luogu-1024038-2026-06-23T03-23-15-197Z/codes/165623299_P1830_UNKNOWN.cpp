#include<iostream>  
using namespace std;   
int main()
{  
	int n,m,t1,t2,map[1000][1000],hz[1000][1000],x1,x2,y1,y2; 
    cin>>n>>m>>t1>>t2;
    for (int k=1;k<=t1;k++)
	{  
        cin>>x1>>y1>>x2>>y2;
        for(int i=x1;i<=x2;i++)  
        {
        	for(int j=y1;j<=y2;j++)
		  	{  
             	map[i][j]++; 
             	hz[i][j]=k;
        	}  
		}
    }  
    for (int k=1;k<=t2;k++)
	{  
        scanf("%d%d",&x1,&y1);  
        if (map[x1][y1]!=0) 
		{
			cout<<"Y"<<" "<<map[x1][y1]<<" "hz[x1][y1])<<endl; 
		}
		else 
		{
			cout<<"N" 
		} 
    }  
}  
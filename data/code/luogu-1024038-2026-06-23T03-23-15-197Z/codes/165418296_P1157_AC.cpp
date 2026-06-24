#include<bits/stdc++.h>
int x[30];
using namespace std;
int main(){
    int n,r;
    scanf("%d%d",&n,&r);
    for(int i=r+1;i<=n;++i)
    {
         x[i]=1;    	
	}
    do
	{
        for(int i=1;i<=n;++i)
        {
        	if(x[i]==0) 
			{
				cout<<setw(3)<<i;
			}	
		}
        printf("\n");
    }
	while(next_permutation(x+1,x+n+1));
    return 0;
}
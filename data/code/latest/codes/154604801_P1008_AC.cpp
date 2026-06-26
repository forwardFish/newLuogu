#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a[10]={0};
	int map=0;
	for(int i=123;i<=333;i++)
    {
    	memset(a,0,sizeof(a));
        a[i%10]=a[i/10%10]=a[i/100]=a[i*2%10]=a[i*2/10%10]=a[i*2/100]=a[i*3%10]=a[i*3/10%10]=a[i*3/100]=1;
        for(int j=1;j<=9;j++) map+=a[j];
        if(map==9) 
		{
			printf("%d %d %d\n",i,i*2,i*3);
		}
		map=0;
    }
	return 0;
}
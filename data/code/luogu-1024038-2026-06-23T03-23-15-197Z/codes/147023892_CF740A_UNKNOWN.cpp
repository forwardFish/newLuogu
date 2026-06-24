#include<bits/stdc++.h>
using namespace std;
int main()
{
    int n,a,b,c;
    cin>>n>>a>>b>>c;
    int mint=1e9;
    for (int i=0;i<=10000;i++)
	{
        for (int j=0;j<=10000;j++)
		{
            int books=i+2*j;
            if(books >= n)
			{
                int cost=i*a+j*b+max(0,books-n)*c;
                mint = min(mint,cost);
            }
        }
    }
    cout<<mint<<endl;
    return 0;
}

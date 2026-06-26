#include <bits/stdc++.h>
using namespace std;
int main()
{
	int n,a,map=0;
    scanf("%d", &n);
    for(int i=0;i<n<<1;i++)
    {
    	scanf("%d", &a);
		map+=a*(n-(i-1>>1));
	}
    printf("%d\n",map-8*n*(n+1)/2);
    return 0;
}
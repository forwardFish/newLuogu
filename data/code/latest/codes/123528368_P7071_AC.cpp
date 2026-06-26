
#include <bits/stdc++.h>
using namespace std;
int main(){
    int n,g[100],l=0;
    scanf("%d",&n);
    if(n%2==1){
        printf("-1");
        return 0;
    }
    while(n>0){
        g[l] = n%2;
        l++;
        n/=2;
    }
    for(int i=l-1;i>0;i--)
        if(g[i]) printf("%d ", (int)pow(2, i));
    return 0;
}
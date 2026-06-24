#include <bits/stdc++.h>
struct Block{
    char ch;
    long long count;
};
Block a[100000];int c=0;
int main(){
    char s[100001];
    long long c;
    scanf("%100000s%lld",s,&c);
    int i=0;
    while(s[i]!='\0'){
        char ch=s[i];
        i++;
        char c[20];
        int l=0;
        while(s[i]!='\0'&&isdigit(s[i])){
            c[l++]=s[i];
            i++;
        }
        c[l]='\0';
        long long cnt=strtoll(c,NULL,10);
        a[c].ch=ch;
        a[c].count=cnt;
        c++;
    }
    long long ans=0;
    for(int j=0;j<c;++j){
        ans+=a[j].count;
    }
    if(ans==0){
        printf("\n");
        return 0;
    }
    long long k=c%ans;
    long long current=0;
    for(int j=0;j<c;++j){
        if(current+a[j].count>k){
            printf("%c\n",a[j].ch);
            return 0;
        }
        current+=a[j].count;
    }
    return 0;
}

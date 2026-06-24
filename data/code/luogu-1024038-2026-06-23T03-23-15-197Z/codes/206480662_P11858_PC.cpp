#include <bits/stdc++.h>
struct Block{
    char ch;
    long long count;
};
Block a[100000];int js=0;
int main(){
    char s[100001];
    long long c;
    scanf("%100000s%lld",s,&c);
    int i=0;
    while(s[i]!='\0'){
        char ch=s[i];
        i++;
        char c1[20];
        int num_len=0;
        while(s[i]!='\0'&&isdigit(s[i])){
            c1[num_len++]=s[i];
            i++;
        }
        c1[num_len]='\0';
        long long cnt=strtoll(c1,NULL,10);
        a[js].ch=ch;
        a[js].count=cnt;
        js++;
    }
    long long ans=0;
    for(int j=0;j<js;++j){
        ans+=a[j].count;
    }
    if(ans==0){
        printf("\n");
        return 0;
    }
    long long k=c%ans;
    long long current=0;
    for(int j=0;j<js;++j){
        if(current+a[j].count>k){
            printf("%c\n",a[j].ch);
            return 0;
        }
        current+=a[j].count;
    }
    return 0;
}

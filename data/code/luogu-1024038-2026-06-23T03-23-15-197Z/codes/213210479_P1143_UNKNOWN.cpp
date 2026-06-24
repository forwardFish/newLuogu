#include<bits/stdc++.h>
using namespace std;
int b,m;char s[40],t[40];
int main(){
    scanf("%d %s %d",&b,s,&m);
    itoa(strtol(s,NULL,b),t,m);
    auto& f=use_facet<ctype<char>>(locale());
    f.toupper(t,t+40);
    puts(t);
    return 0;
}
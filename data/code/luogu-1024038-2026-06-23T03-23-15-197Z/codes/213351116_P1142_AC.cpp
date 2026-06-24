#include<bits/stdc++.h> 
using namespace std;
struct node{
    int x,y;
};
int main(){
    int n; 
    cin>>n;
    node p[n];
    for (int i=0;i<n;i++){
        cin>>p[i].x>>p[i].y;
    }
    int max=0;
    for (int i=0;i<n-1;i++){
        for (int j=i+1;j<n;j++){
            int cnt=2;
            node vec1;
            vec1.x=p[j].x-p[i].x;
            vec1.y=p[j].y-p[i].y;
            for (int h=0;h<n;h++)
			{
                if (h==i || h==j) continue;
                node vec2;
                vec2.x=p[h].x-p[i].x;
                vec2.y=p[h].y-p[i].y;
                if (vec1.x*vec2.y==vec1.y*vec2.x)
				{
                    cnt++;
                }
            }
            if (cnt>max) max=cnt;
        }
    }
    cout<<max;
    return 0;
}
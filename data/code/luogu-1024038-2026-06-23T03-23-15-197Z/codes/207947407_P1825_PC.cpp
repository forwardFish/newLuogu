#include<iostream>
#include<queue>
#include<unordered_map>
#include<vector>
using namespace std;
struct Node{
    int x,y,time;
};
int N,M;
char maze[305][305];
int dir[4][2]={{-1,0},{1,0},{0,-1},{0,1}};
unordered_map<char,vector<pair<int,int>>>sliders;
bool visited[305][305];
int bfs(int startX,int startY){
    queue<Node>q;
    q.push({startX,startY,0});
    visited[startX][startY]=true;
    while(!q.empty()){
        Node cur=q.front();q.pop();
        if(maze[cur.x][cur.y]=='=')return cur.time;
        for(int i=0;i<4;i++){
            int nx=cur.x+dir[i][0],ny=cur.y+dir[i][1];
            if(nx<0||ny<0||nx>=N||ny>=M||maze[nx][ny]=='#'||visited[nx][ny])continue;
            if('A'<=maze[nx][ny]&&maze[nx][ny]<='Z'){
                char ch=maze[nx][ny];
                for(auto&point:sliders[ch]){
                    if(!visited[point.first][point.second]){
                        visited[point.first][point.second]=true;
                        q.push({point.first,point.second,cur.time+1});
                    }
                }
            }else{
                visited[nx][ny]=true;
                q.push({nx,ny,cur.time+1});
            }
        }
    }
    return -1;
}
int main(){
    cin>>N>>M;
    int startX,startY;
    for(int i=0;i<N;i++){
        for(int j=0;j<M;j++){
            cin>>maze[i][j];
            if(maze[i][j]=='@'){
                startX=i;
                startY=j;
            }else if('A'<=maze[i][j]&&maze[i][j]<='Z'){
                sliders[maze[i][j]].push_back({i,j});
            }
        }
    }
    cout<<bfs(startX,startY)<<endl;
    return 0;
}

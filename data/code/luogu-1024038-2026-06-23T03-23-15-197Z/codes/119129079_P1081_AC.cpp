#include<cstdio>
#include<cstring>
#include<algorithm>
#include<cmath>
#define MAX 2000000000
using namespace std;
const int maxn=100005;
struct City{
	int num;
	int h;
	City *last,*next; 
}city[maxn]; 
City *pos[maxn];
long long n,m,x0,ss[maxn],xx[maxn],h[maxn],maxk; 
long long aaim[maxn],baim[maxn],adis[maxn],bdis[maxn];
long long longdis[maxn][20],longaim[maxn][20];
long long alongdis[maxn][20],alongaim[maxn][20];
long long s0,da=-1,db=-1;
void fun1(long long curs){
	long long tot=0,cura=0,curb=0,curn=curs;
	for(int k=maxk;k>=0;k--){
		if(longaim[curn][k]!=0&&longdis[curn][k]+tot>x0){
			continue;
		}
		if(longaim[curn][k]==0){
			continue;
		}
		tot+=longdis[curn][k];
		cura+=alongdis[curn][k];
		curn=longaim[curn][k];
	}
	curb=tot-cura;
	if(aaim[curn]!=0&&tot+adis[curn]<=x0){
		tot+=adis[curn];
		cura+=adis[curn];
	}
	if(da==-1){
		s0=curs;
		da=cura;
		db=curb;
	}else if(db==0&&curb==0&&h[curs]>h[s0]){
		s0=curs;
		da=cura;
		db=curb;
	}else if(db==0){
		s0=curs;
		da=cura;
		db=curb;
	}else if(curb==0){
		
	}else if(da*curb>db*cura){
		s0=curs;
		da=cura;
		db=curb;
	}else if(da*curb==db*cura&&h[curs]>h[s0]){
		s0=curs;
		da=cura;
		db=curb;
	} 
}
void fun2(long long s,long long xi){
	long long tot=0,cura=0,curb=0,curn=s;
	for(int k=maxk;k>=0;k--){
		if(longaim[curn][k]!=0&&longdis[curn][k]+tot>xi){
			continue;
		}
		if(longaim[curn][k]==0){
			continue;
		}
		tot+=longdis[curn][k];
		cura+=alongdis[curn][k];
		curn=longaim[curn][k];
	}
	curb=tot-cura;
	if(aaim[curn]!=0&&tot+adis[curn]<=xi){
		tot+=adis[curn];
		cura+=adis[curn];
	}
	printf("%d %d\n",cura,curb); 
}
int cmp(City a,City b){
	return a.h<b.h;
}
void update(City cur,City aim){
	if((abs(cur.h-aim.h)<bdis[cur.num])||(abs(cur.h-aim.h)==bdis[cur.num]&&aim.h<pos[baim[cur.num]]->h)){
		adis[cur.num]=bdis[cur.num];
		aaim[cur.num]=baim[cur.num];
		bdis[cur.num]=abs(cur.h-aim.h);
		baim[cur.num]=aim.num;
	}else if((abs(cur.h-aim.h)<adis[cur.num])||(abs(cur.h-aim.h)==adis[cur.num]&&aim.h<pos[aaim[cur.num]]->h)){
		adis[cur.num]=abs(cur.h-aim.h);
		aaim[cur.num]=aim.num;
	}
}
int main(){
	scanf("%lld",&n);
	for(int i=1;i<=n;i++){
		scanf("%lld",&city[i].h);
		adis[i]=bdis[i]=MAX;
		city[i].num=i;
	}
	scanf("%lld%lld",&x0,&m);
	for(int i=0;i<m;i++){
		scanf("%lld%lld",&ss[i],&xx[i]);
	}
	sort(city+1,city+n+1,cmp);

	for(int i=1;i<=n;i++){
		if(i==1){
			city[i].last=NULL;
		}else{
			city[i].last=&city[i-1];
		}
		if(i==n){
			city[i].next=NULL;
		}else{
			city[i].next=&city[i+1];
		}
		pos[city[i].num]=&city[i];
	}

	for(int i=1;i<=n;i++){
		City *p;
		p=pos[i]->last;
		if(p!=NULL){
			update(*pos[i],*p);
			p=p->last;
			if(p!=NULL){
				update(*pos[i],*p);
			}
		}
		p=pos[i]->next;
		if(p!=NULL){
			update(*pos[i],*p);
			p=p->next;
			if(p!=NULL){
				update(*pos[i],*p);
			}
		}
		if(pos[i]->next!=NULL){
			pos[i]->next->last=pos[i]->last;
		}
		if(pos[i]->last!=NULL){
			pos[i]->last->next=pos[i]->next;
		}
		 
	} 
	for(int i=1;i<=n;i++){
		if(aaim[i]!=0&&baim[aaim[i]]!=0){
			longdis[i][0]=adis[i]+bdis[aaim[i]];
			longaim[i][0]=baim[aaim[i]];
			alongdis[i][0]=adis[i];
			alongaim[i][0]=baim[aaim[i]];
		}else{
			longaim[i][0]=0;
			longdis[i][0]=MAX;
			alongdis[i][0]=MAX;
			alongaim[i][0]=0;
		}
	}
	for(int k=1;(1<<k)<=n;k++){
		for(int i=1;i<=n;i++){
			if(longaim[i][k-1]!=0&&longaim[longaim[i][k-1]][k-1]!=0){
				longdis[i][k]=longdis[i][k-1]+longdis[longaim[i][k-1]][k-1];
				longaim[i][k]=longaim[longaim[i][k-1]][k-1];
			}else{
				longdis[i][k]=MAX;
				longaim[i][k]=0;
			}
			if(alongaim[i][k-1]!=0&&alongaim[alongaim[i][k-1]][k-1]!=0){
				alongdis[i][k]=alongdis[i][k-1]+alongdis[alongaim[i][k-1]][k-1];
				alongaim[i][k]=alongaim[alongaim[i][k-1]][k-1];
			}else{
				alongdis[i][k]=MAX;
				alongaim[i][k]=0;
			}
			
		}
		maxk=k;
	}	
	for(int i=1;i<=n;i++){
		fun1(i);
	}
	printf("%d\n",s0);
	for(int i=0;i<m;i++){
		fun2(ss[i],xx[i]);
	}
	return 0;
} 

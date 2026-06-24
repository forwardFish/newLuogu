#include<iostream>

const int N = 100005;
int n,q,xo[N],t[22],p[22];
bool vs[N << 3];
int main(){
	std::ios::sync_with_stdio(false);
	std::cin.tie(nullptr);
	std::cin >> n >> q;
	for(int i = 2;i <= n; ++i){
		std::cout << "? "<< 1 <<' '<< i << '\n';
		std::cout.flush();
		std::cin >> xo[i];
		for(int j = 0;j < 21; ++j){
			if(xo[i] >> j & 1){
				++ t[j];
			}else{
				++ p[j];
			}
		}
		vs[xo[i]] = 1;
	}
	for(int i = 1;i < n; ++i){
		int ans = i;
		for(int j = 0;j < 21; ++j){
			if(!(i >> j & 1)){
				ans += t[j] * (1 << j);
			}else{
				ans += p[j] * (1 << j);
			}
		}
		if(ans == 2 * n - 2 && !vs[i]){
			std::cout << "! ";
			std::cout.flush();
			std::cout << i << ' ';
			for(int j = 2;j <= n; ++j){
				std::cout << (i ^ xo[j]) << ' ';
			}
			std::cout.flush();
			return 0;
		}
	}
	return 0;
}
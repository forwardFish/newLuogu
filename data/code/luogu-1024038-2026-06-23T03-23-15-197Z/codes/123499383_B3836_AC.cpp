#include <iostream>
using namespace std;
int main() {
	int x, y, z, n, m, cnt = 0;
	cin >> x >> y >> z >> n >> m;
	for (int gj = 0; gj * x <= n && gj <= m; gj++)
	{
		for (int mj = 0; mj * y + gj * x <= n && mj + gj <= m; mj++)
		{
 			int xj = (n - gj * x - mj * y) * z;
 			if (gj + mj + xj == m)
  			{
				cnt++;
		 	}
 		}
	}
 cout << cnt << endl;
 return 0;
}
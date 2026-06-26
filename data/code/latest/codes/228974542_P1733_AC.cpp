#include <cstdio>
#include <iostream>

int main() {
  for (int l = 1, r = 1000000000, mid = (l + r) >> 1, res; l <= r; mid = (l + r) >> 1) {
    std::cout << mid << std::endl;
    std::cin >> res;
    if (res == 0) {
      return 0;
    } else if (res == -1) {
      l = mid + 1;
    } else if (res == 1) {
      r = mid - 1;
    } else {
      puts("OvO, I AK IOI"); // this statement will never be executed.
    }
  }
  return 0;
}

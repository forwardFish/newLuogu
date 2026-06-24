#include<bits/stdc++.h>
using namespace std;
int main() {
    ifstream infile("numlist.txt");
    long long num;
    int count = 0;
    while (infile >> num)
	{
        while (num % 2 == 0)
		{
            count++;
            num /= 2;
        }
    }
	cout << count <<endl;
    return 0;
}

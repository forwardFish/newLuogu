#include <bits/stdc++.h>
using namespace std;
char c[114][3];
int lun = 10,ju = 10,sum[15],r;
int main()
{
    for(int i = 1;i <= lun;i ++)
    {
        cin >> c[i][1];
        if(r == 1 && c[i][1] == '/')lun ++;
        if(i == 10 && c[i][1] == '/')lun ++,r = 1;
        if(c[i][1] != '/')
        {
            cin >> c[i][2];
            if(i == 10 && c[i][2] == '/')lun ++;
        }
    }
    for(int i = 1;i <= 10;i ++)
    {
        int num = 0;
        if(c[i][1] == '/')
        {
            if(c[i + 1][1] == '/')
            {
                if(c[i + 2][1] == '/')num = 30;
                else if(c[i + 2][1] >= '0')num = 20 + c[i + 2][1] - '0';
                else {ju = i - 1;break;}
            }
            else if(c[i + 1][2] == '/')num = 20;
            else if(c[i + 1][1] >= '0' && c[i + 1][2] >= 48)num = 10 + c[i + 1][1] - '0' + c[i + 1][2] - '0';
            else {ju = i - 1;break;}
        }
        else if(c[i][2] == '/')
        {
            if(c[i + 1][1] == '/')num = 20;
            else if(c[i + 1][1] >= '0')num = 10 + c[i + 1][1] - '0';
            else {ju = i - 1;break;}
        }
        else
        {
            if(c[i][2] >= '0')num = c[i][1] - '0' + c[i][2] - '0';
            else {ju = i - 1;break;}
        }
        sum[i] = sum[i - 1] + num;
        cout << num << " ";
    }
    cout << '\n';
    for(int i = 1;i <= ju;i ++)cout << sum[i] << " ";
}
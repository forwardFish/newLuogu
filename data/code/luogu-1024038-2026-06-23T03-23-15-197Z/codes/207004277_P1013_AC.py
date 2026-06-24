import sys
from itertools import permutations

def main():
    n = int(sys.stdin.readline())
    rows = [sys.stdin.readline().split() for _ in range(n)]
    if n < 3 or n > 9:
        print("ERROR!")
        return
    
    s_list = rows[0][1:]  # 符号列表
    m = n - 1
    
    # 检查符号数量是否正确且唯一
    if len(s_list) != m or len(set(s_list)) != m:
        print("ERROR!")
        return
    
    # 预处理加法表
    add_table = []
    for i in range(m):
        row = rows[i+1][1:]
        if len(row) != m:
            print("ERROR!")
            return
        add_table.append(row)
    
    # 检查所有结果字符串的字符是否在符号列表中，且长度正确
    valid = True
    for i in range(m):
        for j in range(m):
            res_str = add_table[i][j]
            if len(res_str) not in (1, 2):
                valid = False
                break
            for c in res_str:
                if c not in s_list:
                    valid = False
                    break
            if not valid:
                break
        if not valid:
            break
    if not valid:
        print("ERROR!")
        return
    
    # 查找零符号
    zero_idx = None
    for i in range(m):
        if add_table[i][i] == s_list[i]:
            if zero_idx is not None:
                print("ERROR!")
                return
            zero_idx = i
    if zero_idx is None:
        print("ERROR!")
        return
    
    # 建立字符到索引的映射
    char_to_index = {c: idx for idx, c in enumerate(s_list)}
    
    # 生成剩余的符号索引
    others = [i for i in range(m) if i != zero_idx]
    if len(others) != m-1:
        print("ERROR!")
        return
    
    # 尝试所有可能的排列
    found = False
    for perm in permutations(range(1, m)):
        val = [0] * m
        val[zero_idx] = 0
        for idx, num in zip(others, perm):
            val[idx] = num
        
        # 检查所有加法项
        all_ok = True
        for i in range(m):
            for j in range(m):
                sum_val = val[i] + val[j]
                high = sum_val // m
                low = sum_val % m
                res_str = add_table[i][j]
                expected_len = 1 if sum_val < m else 2
                if len(res_str) != expected_len:
                    all_ok = False
                    break
                if expected_len == 1:
                    c = res_str[0]
                    c_idx = char_to_index[c]
                    if val[c_idx] != sum_val:
                        all_ok = False
                        break
                else:
                    c1, c2 = res_str[0], res_str[1]
                    c1_idx = char_to_index[c1]
                    c2_idx = char_to_index[c2]
                    if val[c1_idx] != high or val[c2_idx] != low:
                        all_ok = False
                        break
            if not all_ok:
                break
        if all_ok:
            output = [f"{s}={val[idx]}" for idx, s in enumerate(s_list)]
            print(' '.join(output))
            print(m)
            found = True
            break
    if not found:
        print("ERROR!")

if __name__ == "__main__":
    main()
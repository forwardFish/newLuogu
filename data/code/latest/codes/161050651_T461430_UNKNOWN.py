MOD = 998244353

def solve():
    import sys
    input = sys.stdin.read
    data = input().split()
    
    n = int(data[0])
    m = int(data[1])
    
    minerals = []
    idx = 2
    for _ in range(n):
        l_i = int(data[idx])
        r_i = int(data[idx + 1])
        minerals.append((l_i, r_i))
        idx += 2
    
    mining_points = []
    for _ in range(m):
        a_i = int(data[idx])
        mining_points.append(a_i)
        idx += 1
    
    # Determine the sets of reachable minerals at each mining point
    reachable_sets = set()
    
    for a in mining_points:
        reachable = 0
        for i in range(n):
            if minerals[i][0] <= a <= minerals[i][1]:
                reachable |= (1 << i)
        if reachable != 0:
            reachable_sets.add(reachable)
    
    # The number of unique subsets is the size of the set
    result = len(reachable_sets)
    
    # Print the result modulo 998244353
    print(result % MOD)


# CSP-S knowledge ability tree

Generated at: 2026-06-25T06:50:23.078Z

## PROGRAMMING_BASICS Programming basics

### PROGRAMMING_BASICS.READING Reading and constraints

Slots: T1, T2

- PROGRAMMING_BASICS.READING.CONSTRAINT_EXTRACTION: Extract objective, constraints and hidden cases; verify: Pre-code checklist has no missing constraint.

### PROGRAMMING_BASICS.IMPLEMENTATION Implementation stability

Slots: T1, T2, T3

- IMPLEMENTATION.INDEX_BOUNDARY: Index and boundary safety; verify: No out-of-range issue in blind task.
- IMPLEMENTATION.INITIALIZATION: Initialization and reset; verify: Pass multi-test stress.
- IMPLEMENTATION.INTEGER_OVERFLOW: Integer overflow and range estimate; verify: No overflow on max tests.
- IMPLEMENTATION.MULTITEST_CLEAR: Multi-test clearing; verify: Pass repeated random tests.
- IMPLEMENTATION.RECURSION_STACK: Recursion depth and stack safety; verify: No stack risk on max chain/tree.
- IMPLEMENTATION.IO_FORMAT: Input/output format stability; verify: No PE/format failures.
- IMPLEMENTATION.TEMPLATE_CORRECTNESS: Template correctness; verify: Template passes standard tests.
- IMPLEMENTATION.DEBUG_TIMEOUT: Debugging time control; verify: Debug log identifies first failing invariant.

## BASIC_ALGORITHM Basic algorithms

### BASIC_ALGORITHM.SIMULATION_ENUMERATION Simulation and enumeration

Slots: T1, T2

- BASIC_ALGORITHM.SIMULATION_ENUMERATION.CASE_SPLIT: Correct case split and enumeration; verify: T1 blind score >= 90.

### BASIC_ALGORITHM.BINARY_SEARCH Binary search

Slots: T2, T3

- BASIC_ALGORITHM.BINARY_SEARCH.CHECK_MONOTONICITY: Prove check monotonicity and boundary; verify: AC in <= 2 submissions and proof written before code.

## DATA_STRUCTURE Data structures

### DATA_STRUCTURE.DSU Disjoint set union

Slots: T2, T3

- DATA_STRUCTURE.DSU.SET_MEANING: Define set meaning and merge condition; verify: No initialization/discretization error in blind task.

### DATA_STRUCTURE.RANGE_QUERY Segment tree and Fenwick tree

Slots: T2, T3, T4

- DATA_STRUCTURE.RANGE_QUERY.TEMPLATE_BOUNDARY: Range data-structure template and boundary; verify: Pass random stress tests against brute force.

## GRAPH Graph

### GRAPH.MODELING Graph modeling

Slots: T2, T3, T4

- GRAPH.MODELING.GRAPH_ABSTRACTION: Turn problem relation into graph states and edges; verify: Can justify graph construction and complexity.

### GRAPH.SHORTEST_PATH Shortest path

Slots: T2, T3

- GRAPH.SHORTEST_PATH.STATE_AND_INIT: Shortest-path state and initialization; verify: No INF/start/end mistake in blind task.

## DP Dynamic programming

### DP.GENERAL General DP

Slots: T2, T3, T4

- DP.GENERAL.STATE_TRANSITION: State, transition, init and order; verify: State definition is accepted by review before code.

### DP.INTERVAL Interval DP

Slots: T2, T3, T4

- DP.INTERVAL.RECOGNIZE_STRUCTURE: Recognize interval substructure; verify: Can reject false interval-DP labels.
- DP.INTERVAL.INIT_AND_ORDER: Initialization and length-order enumeration; verify: AC in <= 2 submissions on blind variant.

### DP.STATE_COMPRESSION State compression DP

Slots: T3, T4

- DP.STATE_COMPRESSION.MASK_DESIGN: Mask meaning, transition and pruning; verify: Can pass brute-force stress tests.

## MATH Mathematics

### MATH.NUMBER_THEORY Number theory

Slots: T1, T2, T3, T4

- MATH.NUMBER_THEORY.CORE: Number theory core ability; verify: Derivation matches brute force on random small cases.

### MATH.MODULAR Modular arithmetic

Slots: T1, T2, T3, T4

- MATH.MODULAR.CORE: Modular arithmetic core ability; verify: Derivation matches brute force on random small cases.

### MATH.GCD_FACTOR GCD and factorization

Slots: T1, T2, T3, T4

- MATH.GCD_FACTOR.CORE: GCD and factorization core ability; verify: Derivation matches brute force on random small cases.

### MATH.COMBINATORICS Combinatorics

Slots: T1, T2, T3, T4

- MATH.COMBINATORICS.CORE: Combinatorics core ability; verify: Derivation matches brute force on random small cases.

### MATH.COUNTING Counting

Slots: T1, T2, T3, T4

- MATH.COUNTING.CORE: Counting core ability; verify: Derivation matches brute force on random small cases.

### MATH.RECURRENCE Recurrence

Slots: T1, T2, T3, T4

- MATH.RECURRENCE.CORE: Recurrence core ability; verify: Derivation matches brute force on random small cases.

### MATH.FORMULA_DERIVATION Formula derivation

Slots: T1, T2, T3, T4

- MATH.FORMULA_DERIVATION.CORE: Formula derivation core ability; verify: Derivation matches brute force on random small cases.

### MATH.INVARIANT Invariant

Slots: T1, T2, T3, T4

- MATH.INVARIANT.CORE: Invariant core ability; verify: Derivation matches brute force on random small cases.

### MATH.CONSTRUCTION Construction

Slots: T1, T2, T3, T4

- MATH.CONSTRUCTION.CORE: Construction core ability; verify: Derivation matches brute force on random small cases.

### MATH.PERIODICITY Periodicity

Slots: T1, T2, T3, T4

- MATH.PERIODICITY.CORE: Periodicity core ability; verify: Derivation matches brute force on random small cases.

### MATH.OVERFLOW_RANGE Overflow and range

Slots: T1, T2, T3, T4

- MATH.OVERFLOW_RANGE.CORE: Overflow and range core ability; verify: Derivation matches brute force on random small cases.

### MATH.MODEL_TO_DP Math model to DP

Slots: T1, T2, T3, T4

- MATH.MODEL_TO_DP.CORE: Math model to DP core ability; verify: Derivation matches brute force on random small cases.

## STRING String

### STRING.PATTERN String pattern and boundary

Slots: T1, T2, T3

- STRING.PATTERN.BOUNDARY: String boundary and pattern model; verify: Corner-case checklist passed before submission.

## SEARCH Search

### SEARCH.DFS_BFS DFS/BFS and pruning

Slots: T2, T3, T4

- SEARCH.DFS_BFS.PRUNING_AND_STATE: Search state and pruning; verify: Brute and optimized results match on small tests.

## GREEDY Greedy

### GREEDY.PROOF Greedy proof and counterexample check

Slots: T2, T3, T4

- GREEDY.PROOF.EXCHANGE_ARGUMENT: Exchange argument and counterexample search; verify: Can give proof or reject greedy within 20 minutes.

## COMPREHENSIVE Comprehensive contest strategy

### COMPREHENSIVE.EXAM_STRATEGY Contest strategy

Slots: T1, T2, T3, T4

- COMPREHENSIVE.EXAM_STRATEGY.TIME_ALLOCATION: Time allocation and stop-loss; verify: Mock review shows no over-investment in one task.

## NON_KNOWLEDGE_SKILL Non-knowledge skills

### NON_KNOWLEDGE_SKILL.PARTIAL_SCORE Partial-score strategy

Slots: T3, T4

- PARTIAL_SCORE.SUBTASK_ANALYSIS: Subtask and partial-score decomposition; verify: At least 5 blind T3/T4 tasks show predicted route and actual score match.

### NON_KNOWLEDGE_SKILL.STRESS_TEST Stress testing

Slots: T2, T3, T4

- IMPLEMENTATION.STRESS_TEST: Brute-force stress testing; verify: Bug found locally before submission.

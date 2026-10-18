cmake_minimum_required(VERSION 3.15)
project(TrafficOptimizer VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

# Primary C++ Interactive Terminal Engine
add_executable(TrafficOptimizer
    src/Graph.cpp
    src/Algorithms.cpp
    src/main.cpp
)

# Automated C++ DSA Unit Test Runner
add_executable(test_dsa
    src/Graph.cpp
    src/Algorithms.cpp
    tests/test_dsa.cpp
)

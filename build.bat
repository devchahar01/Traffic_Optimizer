@echo off
echo ===================================================
echo   Compiling C++ Intelligent Route Optimizer and Tests...
echo ===================================================

g++ -std=c++17 -O3 -Iinclude src/Graph.cpp src/Algorithms.cpp src/main.cpp -o TrafficOptimizer.exe
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] TrafficOptimizer.exe compilation failed.
    exit /b %ERRORLEVEL%
)

g++ -std=c++17 -O3 -Iinclude src/Graph.cpp src/Algorithms.cpp tests/test_dsa.cpp -o test_dsa.exe
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] test_dsa.exe compilation failed.
    exit /b %ERRORLEVEL%
)

echo.
echo [SUCCESS] Compilation 100%% Complete!
echo Binaries generated:
echo   - TrafficOptimizer.exe (Interactive C++ DSA Engine)
echo   - test_dsa.exe         (Automated Unit Test Suite)
echo.
echo To run the interactive CLI:  run.bat  or  .\TrafficOptimizer.exe
echo To run the automated tests:  test.bat or  .\test_dsa.exe

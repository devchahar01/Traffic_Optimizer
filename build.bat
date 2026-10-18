@echo off
echo ===================================================
echo   Compiling C++ Traffic Optimizer and DSA Engine...
echo ===================================================

g++ -std=c++17 -O3 -Iinclude src/Graph.cpp src/Algorithms.cpp src/main.cpp -o TrafficOptimizer.exe

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Compilation Complete!
    echo Binary generated: TrafficOptimizer.exe
    echo Run "run.bat" or ".\TrafficOptimizer.exe" to launch.
) else (
    echo.
    echo [ERROR] Compilation failed. Please inspect errors above.
)

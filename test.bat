@echo off
echo ===================================================
echo   Compiling and Running C++ DSA Unit Tests...
echo ===================================================

g++ -std=c++17 -O3 -Iinclude src/Graph.cpp src/Algorithms.cpp tests/test_dsa.cpp -o test_dsa.exe
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Test compilation failed!
    exit /b %ERRORLEVEL%
)

echo [SUCCESS] Test suite compiled successfully!
echo Launching tests...
echo.
.\test_dsa.exe

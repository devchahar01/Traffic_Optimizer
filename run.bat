@echo off
if not exist TrafficOptimizer.exe (
    call build.bat
)
if exist TrafficOptimizer.exe (
    TrafficOptimizer.exe
)

@echo off
title Zuka Okropiridze - C++ Robotics Portfolio Launcher
cls
echo ================================================================
echo    ZUKA OKROPIRIDZE // C++ ROBOTICS & EMBEDDED DEVELOPER
echo ================================================================
echo.
echo   [1] Open Portfolio Website (index.html)
echo   [2] Open Your Private Message Inbox (inbox.html)
echo   [3] Open Contact & Test Terminal (contact.html)
echo   [4] Exit
echo.
echo ================================================================
set /p choice="Select an option [1-4] (Default is 1): "

if "%choice%"=="2" (
    echo Opening Private Inbox...
    start "" "%~dp0inbox.html"
    exit
)
if "%choice%"=="3" (
    echo Opening Contact Page...
    start "" "%~dp0contact.html"
    exit
)
if "%choice%"=="4" (
    exit
)

echo Opening Portfolio Website...
start "" "%~dp0index.html"
exit

@echo off
chcp 65001 > nul
title Techora EduFee Server
color 0B
cls

echo.
echo =======================================================================
echo.
echo   _______        _                     ______    _       ______         
echo  ^|__   __^|      ^| ^|                   ^|  ____^|  ^| ^|     ^|  ____^|        
echo     ^| ^| ___  ___^| ^|__   ___  _ __ __ _^| ^|__   __^| ^|_   _^| ^|__ ___  ___  
echo     ^| ^|/ _ \/ __^| '_ \ / _ \^| '__/ _` ^|  __^| / _` ^| ^| ^| ^|  __/ _ \/ _ \ 
echo     ^| ^|  __/ (__^| ^| ^| ^| (_) ^| ^| ^| (_^| ^| ^|___^| (_^| ^| ^|_^| ^| ^| ^|  __/  __/ 
echo     ^|_^|\___^|\___^|_^| ^|_^|\___/^|_^|  \__,_^|______\__,_^|\__,_^|_^|  \___^|\___^| 
echo.                                                                       
echo                           EDU FEE PLATFORM
echo.
echo =======================================================================
echo.
echo [*] Starting Node.js Backend Server...
echo [*] Opening your browser automatically...
echo.
echo [+] Default Admin Credentials:
echo     Email:    admin@techora.in
echo     Password: admin123
echo.
echo =======================================================================
echo.
echo To stop the server, press CTRL+C
echo.

start "" "http://localhost:3001/pages/login.html"
call npm start
pause

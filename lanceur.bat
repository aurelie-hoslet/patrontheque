@echo off
title Sewing Box - Lanceur
color 0D
echo.
echo  ============================================
echo        SEWING BOX - Demarrage...
echo  ============================================
echo.

:: Lancer le backend dans une nouvelle fenetre
echo  [1/2] Demarrage du serveur...
start "Sewing Box - Backend" cmd /k "title Sewing Box - Serveur && cd /d "%~dp0backend" && npm start"

:: Attendre que le backend demarre
timeout /t 3 /nobreak > nul

:: Lancer le frontend dans une nouvelle fenetre
echo  [2/2] Demarrage de l'interface...
start "Sewing Box - Frontend" cmd /k "title Sewing Box - Interface && cd /d "%~dp0frontend" && npm start"

echo.
echo  ============================================
echo   Sewing Box demarre !
echo   L'app va s'ouvrir dans votre navigateur.
echo   (attendez quelques secondes)
echo  ============================================
echo.
echo  Pour arreter : fermez les deux fenetres noires.
echo.
timeout /t 5 /nobreak > nul
exit

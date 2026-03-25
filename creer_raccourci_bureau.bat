@echo off
title Creation du raccourci bureau
echo.
echo  Creation du raccourci "Patron Manager" sur le bureau...
echo.

set "LANCEUR=%~dp0lanceur.bat"
set "WORKDIR=%~dp0"
set "SCRIPT=%TEMP%\create_shortcut_pm.ps1"

(
  echo $ws = New-Object -ComObject WScript.Shell
  echo $desktop = [Environment]::GetFolderPath('Desktop'^)
  echo $s = $ws.CreateShortcut($desktop + '\Patron Manager.lnk'^)
  echo $s.TargetPath = '%LANCEUR%'
  echo $s.WorkingDirectory = '%WORKDIR%'
  echo $s.IconLocation = '%SystemRoot%\System32\shell32.dll,43'
  echo $s.Description = 'Lancer Patron Manager'
  echo $s.Save(^)
  echo Write-Host 'Raccourci cree avec succes !'
) > "%SCRIPT%"

powershell -ExecutionPolicy Bypass -File "%SCRIPT%"
del "%SCRIPT%" > nul 2>&1

echo.
echo  Le raccourci "Patron Manager" est maintenant sur votre bureau !
echo  Double-cliquez dessus pour lancer l'application.
echo.
pause

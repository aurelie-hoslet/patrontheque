' Lance le Sewing Box Launcher sans afficher de fenêtre de terminal
Set fso = CreateObject("Scripting.FileSystemObject")
Set wsh = CreateObject("WScript.Shell")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
wsh.Run "cmd /c cd /d """ & scriptDir & """ && npm run launcher", 0, False
Set wsh = Nothing
Set fso = Nothing

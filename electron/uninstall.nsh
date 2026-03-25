; Script NSIS personnalisé – nettoyage à la désinstallation
; Appelé automatiquement par electron-builder après la suppression des fichiers installés.

!macro customUnInstall
  ; Demander si l'utilisateur veut supprimer ses données personnelles
  MessageBox MB_YESNO|MB_ICONQUESTION \
    "Voulez-vous aussi supprimer vos données personnelles ?$\n$\n\
Cela inclut vos patrons, tissus, projets, PDFs et toutes vos données.$\n$\n\
(Si vous réinstallez l'application, répondez Non pour les conserver.)" \
    IDYES delete_data IDNO skip_data

  delete_data:
    RMDir /r "$APPDATA\Sewing Box"

  skip_data:
!macroend

@echo off
rem Lance la synchro GitHub en arrière-plan (toutes les 2 minutes). Un raccourci vers ce fichier dans shell:startup la lance à chaque démarrage.
start "" /min powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0synchro.ps1"

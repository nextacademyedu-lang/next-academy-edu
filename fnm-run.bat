@echo off
SET FNM_DIR=C:\Users\mizot\AppData\Roaming\fnm
SET FNM_EXE=C:\Users\mizot\AppData\Local\Microsoft\WinGet\Packages\Schniz.fnm_Microsoft.Winget.Source_8wekyb3d8bbwe\fnm.exe

REM Activate fnm environment
FOR /F "tokens=*" %%i IN ('%FNM_EXE% env --use-on-cd --shell cmd') DO %%i

REM Use Node 22
%FNM_EXE% use 22

REM Re-activate fnm after switching version
FOR /F "tokens=*" %%i IN ('%FNM_EXE% env --use-on-cd --shell cmd') DO %%i

echo Node version:
node --version
echo.

echo === Method: Run payload bin with --disable-transpile via node --import tsx ===
node --import tsx node_modules/payload/bin.js --disable-transpile generate:importmap

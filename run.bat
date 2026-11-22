@echo off
cd /d %~dp0
if exist out rmdir /s /q out
mkdir out
for /r src %%f in (*.java) do @echo %%f>>sources.txt
javac --release 17 -d out @sources.txt
if errorlevel 1 exit /b 1
del sources.txt
java -cp out showtime.Main

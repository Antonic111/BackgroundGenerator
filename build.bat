@echo off
echo Building OBS Background Generator...

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Build the standalone version
echo Building standalone HTML file...
npm run build-standalone

echo Build complete! Check the dist folder for the standalone HTML file.
echo You can now use this file directly in OBS Studio as a Browser Source.
pause

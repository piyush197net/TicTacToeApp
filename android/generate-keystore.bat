@echo off
REM Helper: generate a JKS keystore for release signing (Windows)
REM Edit the STOREPASS and KEYPASS variables before running if you want custom passwords.
setlocal
set KEYSTORE_PATH=%~dp0keystore.jks
set ALIAS=my-key-alias
set STOREPASS=changeit
set KEYPASS=changeit

echo Generating keystore at %KEYSTORE_PATH%
keytool -genkeypair -v -keystore "%KEYSTORE_PATH%" -storetype JKS -keyalg RSA -keysize 2048 -validity 10000 -alias %ALIAS% -storepass %STOREPASS% -keypass %KEYPASS% -dname "CN=Your Name, OU=Org Unit, O=Organization, L=City, S=State, C=US"
if errorlevel 1 (
  echo.
  echo keytool failed. Ensure JDK is installed and keytool is on PATH.
  exit /b 1
)

echo.
echo Keystore generated at: %KEYSTORE_PATH%
echo Create a file at android\keystore.properties with the following contents (do not commit it):
echo storeFile=keystore.jks
echo storePassword=%STOREPASS%
echo keyAlias=%ALIAS%
echo keyPassword=%KEYPASS%
endlocal
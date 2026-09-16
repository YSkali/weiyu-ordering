@echo off
chcp 65001 > nul
title 味遇点餐系统 - 后端服务
echo ==========================================
echo  味遇点餐系统 - 后端启动
echo ==========================================
echo.

:: 切换到脚本所在目录
cd /d "%~dp0"

:: 检查 server 目录是否存在
if not exist "server\" (
  echo [错误] 找不到 server 目录！
  pause
  exit /b 1
)

cd server

:: 检查 .env 是否存在，不存在则从模板复制
if not exist ".env" (
  echo [提示] 未找到 .env，从模板复制...
  copy .env.example .env
  echo.
  echo [重要] 请编辑 server\.env 填入正确的数据库密码，再重新运行本脚本！
  echo.
  pause
  exit /b 1
)

:: 检查 .env 中是否仍是默认密码
findstr /i "your_mysql_password" .env > nul
if %errorlevel%==0 (
  echo [错误] .env 中数据库密码仍是默认值 "your_mysql_password"！
  echo.
  echo [提示] 请用编辑器打开 server\.env，修改 DB_PASSWORD 为你的 MySQL 密码。
  echo.
  pause
  exit /b 1
)

:: 检查 JWT_SECRET 是否仍是默认值
findstr /i "change_this_to_a_random_string" .env > nul
if %errorlevel%==0 (
  echo [警告] JWT_SECRET 仍是默认值，建议修改为随机字符串。
  echo.
  choice /c YN /m "是否继续启动？(Y=继续/N=先去修改)"
  if %errorlevel%==2 exit /b 1
  echo.
)

:: 检查 node_modules
if not exist "node_modules\" (
  echo [提示] 首次运行，先安装依赖...
  call npm install
  echo.
)

echo [启动] NestJS 后端服务...
echo [提示] 按 Ctrl+C 停止服务
echo.

call npm run start:dev

echo.
echo [停止] 服务已关闭
pause

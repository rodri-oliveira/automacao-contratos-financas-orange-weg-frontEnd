# Iniciar o backend
Start-Process -FilePath "python" -ArgumentList "run_server.py" -WorkingDirectory "caminho/para/seu/backend"

# Aguardar um pouco para o backend iniciar
Start-Sleep -Seconds 3

# Iniciar o frontend
Set-Location -Path "caminho/para/seu/frontend"
npm run dev 
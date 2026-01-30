#!/bin/bash
# Quick Start - Metafy Local Development

echo "🚀 Iniciando Metafy..."

# Verificar se está na pasta correta
if [ ! -f "index.html" ]; then
    echo "❌ Erro: index.html não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

# Usar Python ou Node.js para servidor local
if command -v python3 &> /dev/null; then
    echo "📱 Servidor iniciado em http://localhost:8000"
    python3 -m http.server 8000
elif command -v npx &> /dev/null; then
    echo "📱 Servidor iniciado em http://localhost:8000"
    npx http-server -p 8000
else
    echo "❌ Erro: Python 3 ou Node.js não encontrado."
    echo "   Instale um deles e tente novamente."
    exit 1
fi

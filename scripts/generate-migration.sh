#!/bin/bash
set -e

SERVICE=$1
MIGRATION_NAME=$2

if [ -z "$SERVICE" ] || [ -z "$MIGRATION_NAME" ]; then
  echo "❌ Uso: npm run migration:generate-helper <service> <MigrationName>"
  echo ""
  echo "Exemplos:"
  echo "  npm run migration:generate-helper auth AddUserAvatar"
  echo "  npm run migration:generate-helper tasks AddTaskTags"
  echo "  npm run migration:generate-helper notifications AddNotificationSettings"
  exit 1
fi

# Mapear nome curto para workspace completo
case $SERVICE in
  auth)
    WORKSPACE="auth-service"
    ;;
  tasks)
    WORKSPACE="tasks-service"
    ;;
  notifications)
    WORKSPACE="notifications-service"
    ;;
  *)
    echo "❌ Service inválido: $SERVICE (opções: auth, tasks, notifications)"
    exit 1
    ;;
esac

echo "🚀 Gerando migration: $MIGRATION_NAME para $WORKSPACE"

# Detectar se o container do Postgres já está rodando
if docker ps --format '{{.Names}}' | grep -q '^db$'; then
  echo "✅ Banco de dados já está rodando (container: db)"
else
  echo "🗄️  Subindo banco de dados..."
  docker-compose up -d db
  sleep 3
fi

# Executar migration generate com DB_HOST=localhost para conectar localmente
echo "📝 Gerando migration no workspace: $WORKSPACE"
DB_HOST=localhost DB_PORT=5432 npx turbo run migration:generate --filter=$WORKSPACE -- src/migrations/$MIGRATION_NAME

echo ""
echo "✅ Migration gerada com sucesso!"
echo "📋 Verifique em apps/$WORKSPACE/src/migrations/"
echo ""
echo "Próximos passos:"
echo "  1. Revise a migration gerada"
echo "  2. Rebuild e restart: docker-compose build $WORKSPACE && docker-compose up -d"
echo ""
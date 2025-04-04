# Guia de Uso do Bot WhatsApp Dockerizado

Este guia explica como configurar e usar o bot do WhatsApp que monitora mensagens e executa ações com base nelas.

## Configuração Inicial

### 1. Requisitos
- Docker instalado
- Docker Compose instalado
- Conexão à internet

### 2. Preparação dos Arquivos
Clone ou crie os arquivos necessários na mesma estrutura de diretório:

```
whatsapp-bot/
├── Dockerfile
├── package.json
├── index.js
├── docker-compose.yml
└── actions/
    └── customActions.js
```

### 3. Iniciar o Bot
Execute o comando no diretório do projeto:

```bash
docker-compose up -d
```

### 4. Autenticação Inicial
Na primeira execução, você precisará autenticar com o WhatsApp:

1. Verifique os logs para obter o código QR:
   ```bash
   docker-compose logs -f
   ```

2. Escaneie o código QR com seu WhatsApp no celular:
   - Abra o WhatsApp
   - Toque em "⋮" (menu) > "WhatsApp Web"
   - Escaneie o código QR exibido nos logs

3. Após a autenticação, o bot estará ativo e a sessão será salva (não precisará escanear novamente em reinicializações).

## Funcionalidades do Bot

### Monitoramento de Mensagens
O bot monitora todas as mensagens recebidas e pode responder automaticamente com base em palavras-chave.

Exemplos incluídos:
- Responde a "olá" e "oi" com uma saudação automática
- Responde a "status" com uma mensagem de status
- Responde a mensagens que começam com "/comando" executando ações personalizadas

### API REST
O bot também oferece uma API REST que permite:

1. **Verificar Status**
   ```
   GET http://localhost:3000/api/status
   ```

2. **Enviar Mensagens**
   ```
   POST http://localhost:3000/api/send-message
   Content-Type: application/json
   
   {
     "number": "5511999999999",
     "message": "Mensagem de teste via API"
   }
   ```

## Personalizando Ações

### Adicionar Novas Ações
Para adicionar novas ações ao bot:

1. Edite o arquivo `actions/customActions.js` para adicionar suas funções
2. Importe e use suas ações em `index.js` na seção de tratamento de mensagens

### Exemplo de Implementação

Para adicionar uma nova ação que responde a uma palavra-chave:

```javascript
// Em index.js, no evento 'message'
if (message.body.toLowerCase().includes('relatório')) {
    const { gerarRelatorio } = require('./actions/customActions');
    const resultado = await gerarRelatorio();
    
    if (resultado.success) {
        await message.reply(`Relatório gerado: ${resultado.data}`);
    } else {
        await message.reply('Erro ao gerar relatório');
    }
}
```

## Segurança e Boas Práticas

1. **Proteja a API**: Considere adicionar autenticação à API REST
2. **Limite Comandos**: Restrinja quais comandos do sistema podem ser executados
3. **Lista de Contatos**: Implemente uma lista de contatos autorizados para maior segurança
4. **Backup**: Faça backup regular do diretório de sessão para evitar perda de autenticação

## Manutenção

### Logs
Visualize os logs para depuração:
```bash
docker-compose logs -f
```

### Reiniciar o Bot
```bash
docker-compose restart
```

### Atualizar o Bot
Para atualizar o código:

1. Modifique os arquivos necessários
2. Reconstrua e reinicie o container:
   ```bash
   docker-compose up -d --build
   ```

---

## Exemplos de Uso Prático

### 1. Bot para Suporte Técnico
Configurado para responder a perguntas frequentes e encaminhar problemas complexos.

### 2. Monitor de Sistemas
Configurado para executar verificações de sistema e enviar relatórios.

### 3. Assistente de Agendamento
Configurado para gerenciar agendamentos e enviar lembretes.

---

Para personalizar este bot para suas necessidades específicas, edite o arquivo `index.js` e adicione suas próprias funções no diretório `actions`.
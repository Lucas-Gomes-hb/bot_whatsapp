const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Lista de números permitidos - apenas este número poderá receber respostas
const ALLOWED_NUMBERS = [
  '55519925668194@c.us'  // Número permitido
];

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './whatsapp-session'
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

client.on('qr', (qr) => {
  console.log('QR Code recebido, escaneie-o com seu telefone:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Cliente WhatsApp está pronto!');
});

client.on('authenticated', () => {
  console.log('Autenticado com sucesso!');
});

client.on('message', async (message) => {
  console.log(`Mensagem recebida de ${message.from}: ${message.body}`);
  
  // Verifica se o remetente está na lista de permitidos
  const isAllowed = ALLOWED_NUMBERS.includes(message.from);
  
  // Se não estiver autorizado, ignora a mensagem
  if (!isAllowed) {
    console.log(`Mensagem ignorada de ${message.from}: não autorizado`);
    return;
  }
  
  // Continua com o processamento apenas para o número autorizado
  if (!message.body || message.body.length === 0) return;
  
  try {
    if (message.body.toLowerCase().includes('status')) {
      return await message.reply('Todos os sistemas estão funcionando normalmente.');
    }
    
    if (message.body.startsWith('/comando')) {
      const comando = message.body.substring(9);
      console.log(`Executando comando: ${comando}`);
      return await message.reply(`Comando "${comando}" executado com sucesso!`);
    }
    
    const response = await axios.post('http://localhost:8082/agent', {
      chat_id: message.from,
      user_content: message.body,
      collection_name: "arquivos"
    });
    
    if (response.data?.response?.content) {
      await message.reply(response.data.response.content);
    } else {
      await message.reply("Não entendi sua mensagem. Poderia reformular?");
    }
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    if (message.body.toLowerCase().includes('olá') || message.body.toLowerCase().includes('oi')) {
      await message.reply('Olá! Este é um bot automatizado. Como posso ajudar?');
    } else {
      await message.reply('Desculpe, estou com problemas técnicos. Tente novamente mais tarde.');
    }
  }
});

client.initialize();

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/send-message', async (req, res) => {
  try {
    const { number, message } = req.body;
    if (!number || !message) {
      return res.status(400).json({
        success: false,
        message: 'Número e mensagem são obrigatórios'
      });
    }
    
    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
    
    // Verifica se o número está na lista de permitidos para envio de mensagens
    if (!ALLOWED_NUMBERS.includes(formattedNumber)) {
      return res.status(403).json({
        success: false,
        message: 'Número não autorizado para receber mensagens'
      });
    }
    
    await client.sendMessage(formattedNumber, message);
    res.status(200).json({
      success: true,
      message: 'Mensagem enviada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar mensagem',
      error: error.message
    });
  }
});

// Endpoint para gerenciar a lista de números permitidos
app.post('/api/manage-allowed', (req, res) => {
  const { action, number } = req.body;
  const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
  
  if (action === 'add') {
    if (!ALLOWED_NUMBERS.includes(formattedNumber)) {
      ALLOWED_NUMBERS.push(formattedNumber);
    }
    res.json({
      success: true,
      message: `Número ${formattedNumber} adicionado à lista de permitidos`,
      allowedNumbers: ALLOWED_NUMBERS
    });
  } else if (action === 'remove') {
    const index = ALLOWED_NUMBERS.indexOf(formattedNumber);
    if (index > -1) {
      ALLOWED_NUMBERS.splice(index, 1);
    }
    res.json({
      success: true,
      message: `Número ${formattedNumber} removido da lista de permitidos`,
      allowedNumbers: ALLOWED_NUMBERS
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Ação inválida. Use "add" ou "remove"'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor API rodando na porta ${PORT}`);
});

process.on('SIGINT', async () => {
  console.log('Encerrando a aplicação...');
  await client.destroy();
  process.exit(0);
});
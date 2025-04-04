const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Configuração do Express para API (opcional)
const app = express();
app.use(cors());
app.use(express.json());

// Porta para a API
const PORT = process.env.PORT || 3000;

// Inicializar o cliente WhatsApp
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

// Evento para exibir o código QR
client.on('qr', (qr) => {
    console.log('QR Code recebido, escaneie-o com seu telefone:');
    qrcode.generate(qr, { small: true });
    
    // Opcional: Você pode criar um endpoint para obter o QR code via API
});

// Evento de quando o cliente está pronto
client.on('ready', () => {
    console.log('Cliente WhatsApp está pronto!');
});

// Evento de autenticação bem-sucedida
client.on('authenticated', () => {
    console.log('Autenticado com sucesso!');
});

// Evento para monitorar as mensagens
client.on('message', async (message) => {
    console.log(`Mensagem recebida de ${message.from}: ${message.body}`);
    
    // Aqui você pode adicionar sua lógica para responder ou processar mensagens
    // Exemplo: verificar se a mensagem vem de um número específico
    
    // Lógica de exemplo - responder automaticamente a certas palavras-chave
    if (message.body.toLowerCase().includes('olá') || message.body.toLowerCase().includes('oi')) {
        message.reply('Olá! Este é um bot automatizado. Como posso ajudar?');
    }
    
    // Exemplo de execução de uma ação com base na mensagem
    if (message.body.toLowerCase().includes('status')) {
        // Aqui você pode executar alguma ação como verificar o status de um serviço
        await message.reply('Todos os sistemas estão funcionando normalmente.');
    }
    
    // Exemplo de ação para comandos específicos
    if (message.body.startsWith('/comando')) {
        const comando = message.body.substring(9);
        try {
            // Aqui você executaria a ação correspondente ao comando
            // Por exemplo, interagir com outro sistema, API, etc.
            console.log(`Executando comando: ${comando}`);
            await message.reply(`Comando "${comando}" executado com sucesso!`);
        } catch (error) {
            console.error(`Erro ao executar comando: ${error}`);
            await message.reply('Erro ao executar o comando. Por favor, tente novamente.');
        }
    }
});

// Iniciar o cliente WhatsApp
client.initialize();

// Endpoints da API

// Status do bot
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// Endpoint para enviar mensagem via API
app.post('/api/send-message', async (req, res) => {
    try {
        const { number, message } = req.body;
        
        if (!number || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Número e mensagem são obrigatórios' 
            });
        }
        
        // Formatação do número (adicionar código do país se necessário)
        const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
        
        // Enviar a mensagem
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

// Iniciar o servidor Express
app.listen(PORT, () => {
    console.log(`Servidor API rodando na porta ${PORT}`);
});

// Tratamento de erros e encerramento
process.on('SIGINT', async () => {
    console.log('Encerrando a aplicação...');
    await client.destroy();
    process.exit(0);
});
/**
 * Arquivo para definir ações personalizadas que podem ser chamadas pelo bot
 * Estas funções podem ser importadas no arquivo principal e usadas para reagir a mensagens
 */

const fs = require('fs');
const path = require('path');

/**
 * Registra uma mensagem em um arquivo de log
 * @param {string} from Número do remetente
 * @param {string} message Conteúdo da mensagem
 */
const logMessage = (from, message) => {
    const logDir = path.join(__dirname, '../logs');
    
    // Criar diretório de logs se não existir
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'messages.log');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] From: ${from}, Message: ${message}\n`;
    
    fs.appendFileSync(logFile, logEntry);
    
    return true;
};

/**
 * Exemplo de uma ação que poderia chamar uma API externa
 * @param {string} parameter Parâmetro para a chamada da API
 * @returns {Promise<object>} Resultado da chamada
 */
const callExternalAPI = async (parameter) => {
    try {
        // Simulação de uma chamada API
        console.log(`Chamando API externa com parâmetro: ${parameter}`);
        
        // Aqui você colocaria sua lógica real de chamada de API
        // const response = await fetch('https://api.example.com/data?param=' + parameter);
        // const data = await response.json();
        
        // Simulando um resultado
        return {
            success: true,
            data: {
                parameter,
                result: 'Processado com sucesso',
                timestamp: new Date().toISOString()
            }
        };
    } catch (error) {
        console.error('Erro ao chamar API externa:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Função para executar um comando no sistema
 * NOTA: Use com cuidado, pois permite execução de código no sistema
 * Considere implementar uma lista de comandos permitidos
 * @param {string} command Comando a ser executado
 * @returns {Promise<object>} Resultado da execução
 */
const executeSystemCommand = async (command) => {
    // Lista de comandos permitidos (para segurança)
    const allowedCommands = ['date', 'uptime', 'whoami', 'df -h', 'free -m'];
    
    // Verificar se o comando está na lista de permitidos
    const isAllowed = allowedCommands.some(cmd => command.startsWith(cmd));
    
    if (!isAllowed) {
        return {
            success: false,
            error: 'Comando não permitido por questões de segurança'
        };
    }
    
    try {
        const { exec } = require('child_process');
        
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erro ao executar comando: ${error}`);
                    return resolve({
                        success: false,
                        error: error.message
                    });
                }
                
                resolve({
                    success: true,
                    output: stdout,
                    error: stderr || null
                });
            });
        });
    } catch (error) {
        console.error('Erro ao executar comando do sistema:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    logMessage,
    callExternalAPI,
    executeSystemCommand
};
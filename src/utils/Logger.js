const fs = require('fs-extra');
const path = require('path');

/**
 * Sistema de logging para o aplicativo
 */
class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../data/logs');
        this.logFile = path.join(this.logDir, 'app.log');
        this.errorFile = path.join(this.logDir, 'error.log');
        this.initialized = false;
    }

    /**
     * Inicializa o sistema de logging
     */
    async initialize() {
        if (this.initialized) return;

        try {
            await fs.ensureDir(this.logDir);
            this.initialized = true;
        } catch (error) {
            console.error('Erro ao inicializar sistema de logging:', error.message);
        }
    }

    /**
     * Formata uma mensagem de log
     * @param {string} level - Nível do log
     * @param {string} message - Mensagem
     * @param {Object} metadata - Metadados adicionais
     * @returns {string} Mensagem formatada
     */
    formatMessage(level, message, metadata = {}) {
        const timestamp = new Date().toISOString();
        const metaStr = Object.keys(metadata).length > 0 ? 
            ` | ${JSON.stringify(metadata)}` : '';
        
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
    }

    /**
     * Escreve log em arquivo
     * @param {string} filename - Nome do arquivo
     * @param {string} message - Mensagem formatada
     */
    async writeToFile(filename, message) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            await fs.appendFile(filename, message + '\n');
        } catch (error) {
            console.error('Erro ao escrever log:', error.message);
        }
    }

    /**
     * Log de informação
     * @param {string} message - Mensagem
     * @param {Object} metadata - Metadados
     */
    async info(message, metadata = {}) {
        const formattedMessage = this.formatMessage('info', message, metadata);
        console.log(formattedMessage);
        await this.writeToFile(this.logFile, formattedMessage);
    }

    /**
     * Log de aviso
     * @param {string} message - Mensagem
     * @param {Object} metadata - Metadados
     */
    async warn(message, metadata = {}) {
        const formattedMessage = this.formatMessage('warn', message, metadata);
        console.warn(formattedMessage);
        await this.writeToFile(this.logFile, formattedMessage);
    }

    /**
     * Log de erro
     * @param {string} message - Mensagem
     * @param {Error|Object} error - Erro ou metadados
     */
    async error(message, error = {}) {
        const metadata = error instanceof Error ? {
            error: error.message,
            stack: error.stack
        } : error;

        const formattedMessage = this.formatMessage('error', message, metadata);
        console.error(formattedMessage);
        await this.writeToFile(this.errorFile, formattedMessage);
        await this.writeToFile(this.logFile, formattedMessage);
    }

    /**
     * Log de debug (apenas em desenvolvimento)
     * @param {string} message - Mensagem
     * @param {Object} metadata - Metadados
     */
    async debug(message, metadata = {}) {
        if (process.env.NODE_ENV === 'development') {
            const formattedMessage = this.formatMessage('debug', message, metadata);
            console.debug(formattedMessage);
            await this.writeToFile(this.logFile, formattedMessage);
        }
    }

    /**
     * Log de atividade do usuário
     * @param {string} action - Ação realizada
     * @param {Object} details - Detalhes da ação
     */
    async userActivity(action, details = {}) {
        await this.info(`User Activity: ${action}`, {
            action,
            ...details,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Log de transação
     * @param {string} type - Tipo de transação
     * @param {Object} details - Detalhes da transação
     */
    async transaction(type, details = {}) {
        await this.info(`Transaction: ${type}`, {
            type,
            ...details,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Log de performance
     * @param {string} operation - Operação realizada
     * @param {number} duration - Duração em ms
     * @param {Object} metadata - Metadados adicionais
     */
    async performance(operation, duration, metadata = {}) {
        await this.info(`Performance: ${operation}`, {
            operation,
            duration: `${duration}ms`,
            ...metadata
        });
    }

    /**
     * Limpa logs antigos
     * @param {number} days - Dias para manter os logs
     */
    async cleanOldLogs(days = 30) {
        try {
            const files = await fs.readdir(this.logDir);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            for (const file of files) {
                const filePath = path.join(this.logDir, file);
                const stats = await fs.stat(filePath);
                
                if (stats.mtime < cutoffDate) {
                    await fs.remove(filePath);
                    await this.info(`Log antigo removido: ${file}`);
                }
            }
        } catch (error) {
            await this.error('Erro ao limpar logs antigos', error);
        }
    }

    /**
     * Obtém estatísticas dos logs
     * @returns {Object} Estatísticas dos logs
     */
    async getLogStats() {
        try {
            const stats = {
                logFile: { exists: false, size: 0, lines: 0 },
                errorFile: { exists: false, size: 0, lines: 0 }
            };

            if (await fs.pathExists(this.logFile)) {
                const logStats = await fs.stat(this.logFile);
                const logContent = await fs.readFile(this.logFile, 'utf8');
                
                stats.logFile = {
                    exists: true,
                    size: logStats.size,
                    lines: logContent.split('\n').length - 1,
                    lastModified: logStats.mtime
                };
            }

            if (await fs.pathExists(this.errorFile)) {
                const errorStats = await fs.stat(this.errorFile);
                const errorContent = await fs.readFile(this.errorFile, 'utf8');
                
                stats.errorFile = {
                    exists: true,
                    size: errorStats.size,
                    lines: errorContent.split('\n').length - 1,
                    lastModified: errorStats.mtime
                };
            }

            return stats;
        } catch (error) {
            await this.error('Erro ao obter estatísticas dos logs', error);
            return null;
        }
    }

    /**
     * Lê as últimas linhas do log
     * @param {number} lines - Número de linhas para ler
     * @param {string} type - Tipo de log ('app' ou 'error')
     * @returns {Array} Últimas linhas do log
     */
    async getRecentLogs(lines = 100, type = 'app') {
        try {
            const filename = type === 'error' ? this.errorFile : this.logFile;
            
            if (!await fs.pathExists(filename)) {
                return [];
            }

            const content = await fs.readFile(filename, 'utf8');
            const allLines = content.split('\n').filter(line => line.trim());
            
            return allLines.slice(-lines);
        } catch (error) {
            await this.error('Erro ao ler logs recentes', error);
            return [];
        }
    }
}

// Instância singleton do logger
const logger = new Logger();

module.exports = logger;


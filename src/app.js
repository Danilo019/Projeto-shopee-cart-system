#!/usr/bin/env node

/**
 * Sistema de Carrinho de Compras - Shopee Clone
 * Arquivo principal da aplicação
 */

const AppController = require('./controllers/AppController');

/**
 * Função principal da aplicação
 */
async function main() {
    try {
        const app = new AppController();
        await app.start();
    } catch (error) {
        console.error('❌ Erro fatal na aplicação:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

/**
 * Tratamento de erros não capturados
 */
process.on('uncaughtException', (error) => {
    console.error('❌ Erro não capturado:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejeitada não tratada:', reason);
    process.exit(1);
});

/**
 * Tratamento de interrupção do usuário (Ctrl+C)
 */
process.on('SIGINT', () => {
    console.log('\n\n👋 Sistema encerrado pelo usuário. Até logo!');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n👋 Sistema encerrado. Até logo!');
    process.exit(0);
});

// Iniciar aplicação
if (require.main === module) {
    main();
}

module.exports = { main };


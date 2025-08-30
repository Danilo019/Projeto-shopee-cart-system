const chalk = require('chalk');
const Table = require('cli-table3');

/**
 * Utilitários para formatação e exibição no terminal
 */
class DisplayUtils {
    /**
     * Exibe o cabeçalho do sistema
     */
    static showHeader() {
        console.clear();
        console.log(chalk.cyan.bold('╔══════════════════════════════════════════════════════════════╗'));
        console.log(chalk.cyan.bold('║') + chalk.white.bold('           🛒 Sistema de Carrinho - Shopee Clone             ') + chalk.cyan.bold('║'));
        console.log(chalk.cyan.bold('╚══════════════════════════════════════════════════════════════╝'));
        console.log();
    }

    /**
     * Exibe uma mensagem de sucesso
     * @param {string} message - Mensagem a ser exibida
     */
    static showSuccess(message) {
        console.log(chalk.green('✅ ' + message));
        console.log();
    }

    /**
     * Exibe uma mensagem de erro
     * @param {string} message - Mensagem de erro
     */
    static showError(message) {
        console.log(chalk.red('❌ ' + message));
        console.log();
    }

    /**
     * Exibe uma mensagem de aviso
     * @param {string} message - Mensagem de aviso
     */
    static showWarning(message) {
        console.log(chalk.yellow('⚠️  ' + message));
        console.log();
    }

    /**
     * Exibe uma mensagem informativa
     * @param {string} message - Mensagem informativa
     */
    static showInfo(message) {
        console.log(chalk.blue('ℹ️  ' + message));
        console.log();
    }

    /**
     * Exibe um separador
     */
    static showSeparator() {
        console.log(chalk.gray('─'.repeat(60)));
    }

    /**
     * Exibe lista de produtos em formato de tabela
     * @param {Array} products - Lista de produtos
     * @param {boolean} showStock - Se deve mostrar estoque
     */
    static showProductList(products, showStock = true) {
        if (!products || products.length === 0) {
            this.showWarning('Nenhum produto encontrado.');
            return;
        }

        const table = new Table({
            head: showStock ? 
                ['ID', 'Nome', 'Categoria', 'Preço', 'Desconto', 'Preço Final', 'Estoque', 'Avaliação'] :
                ['ID', 'Nome', 'Categoria', 'Preço', 'Desconto', 'Preço Final', 'Avaliação'],
            colWidths: showStock ? [8, 25, 15, 12, 10, 12, 8, 10] : [8, 30, 15, 12, 10, 12, 10]
        });

        products.forEach((product, index) => {
            const row = [
                chalk.cyan((index + 1).toString()),
                product.name.length > 22 ? product.name.substring(0, 22) + '...' : product.name,
                product.category,
                `R$ ${product.price.toFixed(2)}`,
                product.discount > 0 ? chalk.green(`${product.discount}%`) : '-',
                product.discount > 0 ? 
                    chalk.green(`R$ ${product.getFinalPrice().toFixed(2)}`) : 
                    `R$ ${product.price.toFixed(2)}`,
                product.rating > 0 ? `⭐ ${product.rating}` : '-'
            ];

            if (showStock) {
                row.splice(-1, 0, product.stock > 0 ? 
                    chalk.green(product.stock.toString()) : 
                    chalk.red('0'));
            }

            table.push(row);
        });

        console.log(table.toString());
        console.log();
    }

    /**
     * Exibe o carrinho de compras
     * @param {ShoppingCart} cart - Carrinho de compras
     */
    static showCart(cart) {
        if (!cart || cart.isEmpty()) {
            this.showWarning('Seu carrinho está vazio.');
            return;
        }

        console.log(chalk.yellow.bold('🛒 Seu Carrinho de Compras'));
        console.log();

        const table = new Table({
            head: ['Item', 'Produto', 'Preço Unit.', 'Qtd', 'Subtotal', 'Desconto'],
            colWidths: [6, 25, 12, 6, 12, 10]
        });

        cart.items.forEach((item, index) => {
            const displayInfo = item.getDisplayInfo();
            table.push([
                chalk.cyan((index + 1).toString()),
                displayInfo.name.length > 22 ? displayInfo.name.substring(0, 22) + '...' : displayInfo.name,
                displayInfo.finalPrice,
                displayInfo.quantity,
                chalk.green(displayInfo.subtotal),
                displayInfo.savings !== '-' ? chalk.green(displayInfo.savings) : '-'
            ]);
        });

        console.log(table.toString());

        // Resumo financeiro
        const summary = cart.getFinancialSummary();
        this.showFinancialSummary(summary);
    }

    /**
     * Exibe resumo financeiro
     * @param {Object} summary - Resumo financeiro
     */
    static showFinancialSummary(summary) {
        console.log(chalk.yellow.bold('💰 Resumo Financeiro'));
        console.log();

        const summaryTable = new Table({
            colWidths: [25, 15]
        });

        if (summary.originalSubtotal !== summary.subtotal) {
            summaryTable.push(
                ['Subtotal Original:', chalk.gray(`R$ ${summary.originalSubtotal.toFixed(2)}`)],
                ['Desconto em Produtos:', chalk.green(`-R$ ${summary.productDiscounts.toFixed(2)}`)]
            );
        }

        summaryTable.push(['Subtotal:', `R$ ${summary.subtotal.toFixed(2)}`]);

        if (summary.couponDiscounts > 0) {
            summaryTable.push(['Desconto Cupom:', chalk.green(`-R$ ${summary.couponDiscounts.toFixed(2)}`)]);
        }

        if (summary.shippingCost > 0) {
            summaryTable.push(['Frete:', `R$ ${summary.shippingCost.toFixed(2)}`]);
        } else if (summary.subtotal > 0) {
            summaryTable.push(['Frete:', chalk.green('GRÁTIS')]);
        }

        summaryTable.push([
            chalk.bold('TOTAL:'), 
            chalk.green.bold(`R$ ${summary.total.toFixed(2)}`)
        ]);

        if (summary.totalSavings > 0) {
            summaryTable.push([
                chalk.green('Você economizou:'), 
                chalk.green.bold(`R$ ${summary.totalSavings.toFixed(2)}`)
            ]);
        }

        console.log(summaryTable.toString());
        console.log();
    }

    /**
     * Exibe lista de cupons disponíveis
     * @param {Array} coupons - Lista de cupons
     */
    static showCouponList(coupons) {
        if (!coupons || coupons.length === 0) {
            this.showWarning('Nenhum cupom disponível no momento.');
            return;
        }

        console.log(chalk.magenta.bold('🎫 Cupons Disponíveis'));
        console.log();

        const table = new Table({
            head: ['Código', 'Desconto', 'Valor Mínimo', 'Validade', 'Descrição'],
            colWidths: [12, 12, 12, 12, 30]
        });

        coupons.forEach(coupon => {
            const discount = coupon.type === 'percentage' ? 
                `${coupon.value}%` : 
                `R$ ${coupon.value.toFixed(2)}`;
            
            const minAmount = coupon.minimumAmount > 0 ? 
                `R$ ${coupon.minimumAmount.toFixed(2)}` : 
                'Sem mínimo';
            
            const validity = coupon.expiryDate ? 
                coupon.expiryDate.toLocaleDateString('pt-BR') : 
                'Sem prazo';

            table.push([
                chalk.cyan(coupon.code),
                chalk.green(discount),
                minAmount,
                validity,
                coupon.description || 'Cupom de desconto'
            ]);
        });

        console.log(table.toString());
        console.log();
    }

    /**
     * Exibe opções de frete
     * @param {Array} shippingOptions - Opções de frete
     */
    static showShippingOptions(shippingOptions) {
        if (!shippingOptions || shippingOptions.length === 0) {
            this.showWarning('Nenhuma opção de frete disponível.');
            return;
        }

        console.log(chalk.blue.bold('🚚 Opções de Frete'));
        console.log();

        const table = new Table({
            head: ['Opção', 'Valor', 'Prazo', 'Entrega Estimada'],
            colWidths: [15, 12, 15, 18]
        });

        shippingOptions.forEach(option => {
            const cost = option.isFreeShipping ? 
                chalk.green('GRÁTIS') : 
                `R$ ${option.cost.toFixed(2)}`;
            
            const delivery = option.estimatedDelivery.toLocaleDateString('pt-BR');

            table.push([
                option.name,
                cost,
                `${option.deliveryDays} dias úteis`,
                delivery
            ]);
        });

        console.log(table.toString());
        console.log();
    }

    /**
     * Exibe informações de frete grátis
     * @param {Object} freeShippingInfo - Informações de frete grátis
     */
    static showFreeShippingProgress(freeShippingInfo) {
        if (freeShippingInfo.qualified) {
            this.showSuccess('🎉 Parabéns! Você ganhou frete grátis!');
            return;
        }

        const remaining = freeShippingInfo.remaining;
        const percentage = freeShippingInfo.percentage;
        
        console.log(chalk.blue.bold('🚚 Progresso para Frete Grátis'));
        console.log();
        
        const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
        
        console.log(`Progresso: [${chalk.green(progressBar)}] ${percentage.toFixed(1)}%`);
        console.log(`Faltam apenas ${chalk.green(`R$ ${remaining.toFixed(2)}`)} para ganhar frete grátis!`);
        console.log();
    }

    /**
     * Exibe resumo do pedido finalizado
     * @param {Object} orderSummary - Resumo do pedido
     */
    static showOrderSummary(orderSummary) {
        console.log(chalk.green.bold('🎉 Pedido Finalizado com Sucesso!'));
        console.log();

        console.log(chalk.yellow.bold(`📋 Pedido: ${orderSummary.orderId}`));
        console.log(chalk.gray(`Data: ${orderSummary.processedAt.toLocaleString('pt-BR')}`));
        console.log();

        // Itens do pedido
        console.log(chalk.blue.bold('📦 Itens do Pedido:'));
        const itemsTable = new Table({
            head: ['Produto', 'Quantidade', 'Preço Unit.', 'Subtotal'],
            colWidths: [30, 10, 12, 12]
        });

        orderSummary.items.forEach(item => {
            itemsTable.push([
                item.product.name.length > 27 ? item.product.name.substring(0, 27) + '...' : item.product.name,
                item.quantity,
                `R$ ${item.product.finalPrice.toFixed(2)}`,
                chalk.green(`R$ ${item.subtotal.toFixed(2)}`)
            ]);
        });

        console.log(itemsTable.toString());
        console.log();

        // Resumo financeiro
        this.showFinancialSummary(orderSummary.financialSummary);

        if (orderSummary.shippingAddress) {
            console.log(chalk.blue.bold('📍 Endereço de Entrega:'));
            console.log(`${orderSummary.shippingAddress.street}, ${orderSummary.shippingAddress.number}`);
            console.log(`${orderSummary.shippingAddress.city} - ${orderSummary.shippingAddress.state}`);
            console.log(`CEP: ${orderSummary.shippingAddress.zipCode}`);
            console.log();
        }

        this.showSuccess('Obrigado pela sua compra! Você receberá um e-mail com os detalhes do pedido.');
    }

    /**
     * Aguarda o usuário pressionar Enter
     * @param {string} message - Mensagem personalizada
     */
    static async waitForEnter(message = 'Pressione Enter para continuar...') {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise(resolve => {
            rl.question(chalk.gray(message), () => {
                rl.close();
                resolve();
            });
        });
    }

    /**
     * Exibe loading com animação
     * @param {string} message - Mensagem do loading
     * @param {number} duration - Duração em ms
     */
    static async showLoading(message, duration = 2000) {
        const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        let i = 0;
        
        const interval = setInterval(() => {
            process.stdout.write(`\r${chalk.blue(frames[i])} ${message}`);
            i = (i + 1) % frames.length;
        }, 100);

        await new Promise(resolve => setTimeout(resolve, duration));
        
        clearInterval(interval);
        process.stdout.write(`\r${chalk.green('✅')} ${message} - Concluído!\n`);
    }
}

module.exports = DisplayUtils;


const inquirer = require('inquirer');
const { ProductService, CartService, DiscountService, ShippingService } = require('../services');
const DisplayUtils = require('../utils/DisplayUtils');

/**
 * Controlador principal da aplicação
 */
class AppController {
    constructor() {
        this.productService = new ProductService();
        this.cartService = new CartService(this.productService);
        this.discountService = new DiscountService();
        this.shippingService = new ShippingService();
        this.currentCart = null;
        this.initialized = false;
    }

    /**
     * Inicializa todos os serviços
     */
    async initialize() {
        if (this.initialized) return;

        DisplayUtils.showHeader();
        await DisplayUtils.showLoading('Inicializando sistema...', 1500);

        try {
            await this.productService.initialize();
            await this.cartService.initialize();
            await this.discountService.initialize();
            
            // Criar carrinho padrão
            this.currentCart = await this.cartService.createCart('user-default');
            
            this.initialized = true;
            DisplayUtils.showSuccess('Sistema inicializado com sucesso!');
        } catch (error) {
            DisplayUtils.showError(`Erro ao inicializar sistema: ${error.message}`);
            process.exit(1);
        }
    }

    /**
     * Inicia a aplicação
     */
    async start() {
        await this.initialize();
        await this.showMainMenu();
    }

    /**
     * Exibe o menu principal
     */
    async showMainMenu() {
        while (true) {
            DisplayUtils.showHeader();
            
            // Mostrar informações do carrinho
            if (!this.currentCart.isEmpty()) {
                const totalItems = this.currentCart.getTotalItems();
                const total = this.currentCart.getTotal();
                console.log(`🛒 Carrinho: ${totalItems} ${totalItems === 1 ? 'item' : 'itens'} - Total: R$ ${total.toFixed(2)}`);
                console.log();
            }

            const choices = [
                '📋 Ver Catálogo de Produtos',
                '🔍 Buscar Produtos',
                '🛒 Ver Carrinho',
                '➕ Adicionar Produto ao Carrinho',
                '✏️  Modificar Quantidade no Carrinho',
                '🗑️  Remover Item do Carrinho',
                '🎫 Ver Cupons Disponíveis',
                '💳 Aplicar Cupom de Desconto',
                '🚚 Calcular Frete',
                '💰 Finalizar Compra',
                '🧹 Limpar Carrinho',
                '❌ Sair'
            ];

            const { action } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'O que você gostaria de fazer?',
                    choices: choices,
                    pageSize: 12
                }
            ]);

            try {
                switch (action) {
                    case '📋 Ver Catálogo de Produtos':
                        await this.showProductCatalog();
                        break;
                    case '🔍 Buscar Produtos':
                        await this.searchProducts();
                        break;
                    case '🛒 Ver Carrinho':
                        await this.showCart();
                        break;
                    case '➕ Adicionar Produto ao Carrinho':
                        await this.addProductToCart();
                        break;
                    case '✏️  Modificar Quantidade no Carrinho':
                        await this.modifyCartQuantity();
                        break;
                    case '🗑️  Remover Item do Carrinho':
                        await this.removeFromCart();
                        break;
                    case '🎫 Ver Cupons Disponíveis':
                        await this.showAvailableCoupons();
                        break;
                    case '💳 Aplicar Cupom de Desconto':
                        await this.applyCoupon();
                        break;
                    case '🚚 Calcular Frete':
                        await this.calculateShipping();
                        break;
                    case '💰 Finalizar Compra':
                        await this.checkout();
                        break;
                    case '🧹 Limpar Carrinho':
                        await this.clearCart();
                        break;
                    case '❌ Sair':
                        await this.exit();
                        return;
                }
            } catch (error) {
                DisplayUtils.showError(`Erro: ${error.message}`);
                await DisplayUtils.waitForEnter();
            }
        }
    }

    /**
     * Exibe o catálogo de produtos
     */
    async showProductCatalog() {
        DisplayUtils.showHeader();
        
        const { category } = await inquirer.prompt([
            {
                type: 'list',
                name: 'category',
                message: 'Escolha uma categoria:',
                choices: [
                    'Todos os Produtos',
                    'Produtos em Promoção',
                    'Mais Bem Avaliados',
                    ...this.productService.getCategories(),
                    '← Voltar'
                ]
            }
        ]);

        if (category === '← Voltar') return;

        let products = [];
        
        if (category === 'Todos os Produtos') {
            products = this.productService.getAllProducts();
        } else if (category === 'Produtos em Promoção') {
            products = this.productService.getDiscountedProducts();
        } else if (category === 'Mais Bem Avaliados') {
            products = this.productService.getTopRatedProducts();
        } else {
            products = this.productService.getProductsByCategory(category);
        }

        DisplayUtils.showProductList(products);
        await DisplayUtils.waitForEnter();
    }

    /**
     * Busca produtos
     */
    async searchProducts() {
        DisplayUtils.showHeader();
        
        const { searchTerm } = await inquirer.prompt([
            {
                type: 'input',
                name: 'searchTerm',
                message: 'Digite o termo de busca:',
                validate: input => input.trim().length > 0 || 'Digite um termo válido'
            }
        ]);

        const products = this.productService.searchProducts(searchTerm);
        
        if (products.length === 0) {
            DisplayUtils.showWarning(`Nenhum produto encontrado para "${searchTerm}".`);
        } else {
            console.log(`\n🔍 Resultados para "${searchTerm}" (${products.length} ${products.length === 1 ? 'produto' : 'produtos'}):\n`);
            DisplayUtils.showProductList(products);
        }
        
        await DisplayUtils.waitForEnter();
    }

    /**
     * Exibe o carrinho
     */
    async showCart() {
        DisplayUtils.showHeader();
        DisplayUtils.showCart(this.currentCart);
        
        if (!this.currentCart.isEmpty()) {
            const freeShippingInfo = this.shippingService.getFreeShippingInfo(this.currentCart.getSubtotal());
            DisplayUtils.showFreeShippingProgress(freeShippingInfo);
        }
        
        await DisplayUtils.waitForEnter();
    }

    /**
     * Adiciona produto ao carrinho
     */
    async addProductToCart() {
        DisplayUtils.showHeader();
        
        const products = this.productService.getAllProducts();
        const productChoices = products.map((product, index) => ({
            name: `${index + 1}. ${product.name} - R$ ${product.getFinalPrice().toFixed(2)} ${product.discount > 0 ? `(${product.discount}% OFF)` : ''} - Estoque: ${product.stock}`,
            value: product.id
        }));

        productChoices.push({ name: '← Voltar', value: 'back' });

        const { productId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'productId',
                message: 'Escolha um produto para adicionar:',
                choices: productChoices,
                pageSize: 10
            }
        ]);

        if (productId === 'back') return;

        const product = this.productService.getProductById(productId);
        
        const { quantity } = await inquirer.prompt([
            {
                type: 'number',
                name: 'quantity',
                message: `Quantidade (disponível: ${product.stock}):`,
                default: 1,
                validate: input => {
                    if (input <= 0) return 'Quantidade deve ser maior que zero';
                    if (input > product.stock) return `Quantidade não pode ser maior que ${product.stock}`;
                    return true;
                }
            }
        ]);

        await DisplayUtils.showLoading('Adicionando produto ao carrinho...');
        
        const success = await this.cartService.addProductToCart(this.currentCart.id, productId, quantity);
        
        if (success) {
            DisplayUtils.showSuccess(`${product.name} adicionado ao carrinho!`);
        } else {
            DisplayUtils.showError('Falha ao adicionar produto ao carrinho.');
        }
        
        await DisplayUtils.waitForEnter();
    }

    /**
     * Modifica quantidade no carrinho
     */
    async modifyCartQuantity() {
        if (this.currentCart.isEmpty()) {
            DisplayUtils.showWarning('Seu carrinho está vazio.');
            await DisplayUtils.waitForEnter();
            return;
        }

        DisplayUtils.showHeader();
        DisplayUtils.showCart(this.currentCart);

        const itemChoices = this.currentCart.items.map((item, index) => ({
            name: `${index + 1}. ${item.product.name} (Qtd atual: ${item.quantity})`,
            value: item.product.id
        }));

        itemChoices.push({ name: '← Voltar', value: 'back' });

        const { productId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'productId',
                message: 'Escolha o item para modificar:',
                choices: itemChoices
            }
        ]);

        if (productId === 'back') return;

        const item = this.currentCart.getItem(productId);
        const product = item.product;

        const { newQuantity } = await inquirer.prompt([
            {
                type: 'number',
                name: 'newQuantity',
                message: `Nova quantidade (atual: ${item.quantity}, disponível: ${product.stock}):`,
                default: item.quantity,
                validate: input => {
                    if (input < 0) return 'Quantidade não pode ser negativa';
                    if (input > product.stock) return `Quantidade não pode ser maior que ${product.stock}`;
                    return true;
                }
            }
        ]);

        await DisplayUtils.showLoading('Atualizando quantidade...');

        if (newQuantity === 0) {
            const success = await this.cartService.removeProductFromCart(this.currentCart.id, productId);
            if (success) {
                DisplayUtils.showSuccess('Item removido do carrinho!');
            }
        } else {
            const success = await this.cartService.updateProductQuantity(this.currentCart.id, productId, newQuantity);
            if (success) {
                DisplayUtils.showSuccess('Quantidade atualizada!');
            }
        }

        await DisplayUtils.waitForEnter();
    }

    /**
     * Remove item do carrinho
     */
    async removeFromCart() {
        if (this.currentCart.isEmpty()) {
            DisplayUtils.showWarning('Seu carrinho está vazio.');
            await DisplayUtils.waitForEnter();
            return;
        }

        DisplayUtils.showHeader();
        DisplayUtils.showCart(this.currentCart);

        const itemChoices = this.currentCart.items.map((item, index) => ({
            name: `${index + 1}. ${item.product.name}`,
            value: item.product.id
        }));

        itemChoices.push({ name: '← Voltar', value: 'back' });

        const { productId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'productId',
                message: 'Escolha o item para remover:',
                choices: itemChoices
            }
        ]);

        if (productId === 'back') return;

        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Tem certeza que deseja remover este item?',
                default: false
            }
        ]);

        if (confirm) {
            await DisplayUtils.showLoading('Removendo item...');
            const success = await this.cartService.removeProductFromCart(this.currentCart.id, productId);
            
            if (success) {
                DisplayUtils.showSuccess('Item removido do carrinho!');
            } else {
                DisplayUtils.showError('Falha ao remover item.');
            }
        }

        await DisplayUtils.waitForEnter();
    }

    /**
     * Exibe cupons disponíveis
     */
    async showAvailableCoupons() {
        DisplayUtils.showHeader();
        
        const coupons = this.discountService.getActiveCoupons();
        DisplayUtils.showCouponList(coupons);
        
        await DisplayUtils.waitForEnter();
    }

    /**
     * Aplica cupom de desconto
     */
    async applyCoupon() {
        if (this.currentCart.isEmpty()) {
            DisplayUtils.showWarning('Adicione produtos ao carrinho antes de aplicar cupons.');
            await DisplayUtils.waitForEnter();
            return;
        }

        DisplayUtils.showHeader();
        
        const { couponCode } = await inquirer.prompt([
            {
                type: 'input',
                name: 'couponCode',
                message: 'Digite o código do cupom:',
                validate: input => input.trim().length > 0 || 'Digite um código válido'
            }
        ]);

        await DisplayUtils.showLoading('Validando cupom...');

        const validation = this.discountService.validateCoupon(couponCode, this.currentCart.getSubtotal());
        
        if (!validation.isValid) {
            DisplayUtils.showError(validation.error);
        } else {
            const success = await this.cartService.applyCouponToCart(this.currentCart.id, validation.coupon);
            
            if (success) {
                DisplayUtils.showSuccess(`Cupom ${couponCode} aplicado! Desconto: R$ ${validation.discount.toFixed(2)}`);
            } else {
                DisplayUtils.showError('Falha ao aplicar cupom. Verifique se já não foi aplicado.');
            }
        }

        await DisplayUtils.waitForEnter();
    }

    /**
     * Calcula frete
     */
    async calculateShipping() {
        if (this.currentCart.isEmpty()) {
            DisplayUtils.showWarning('Adicione produtos ao carrinho antes de calcular o frete.');
            await DisplayUtils.waitForEnter();
            return;
        }

        DisplayUtils.showHeader();
        
        const { cep } = await inquirer.prompt([
            {
                type: 'input',
                name: 'cep',
                message: 'Digite o CEP de entrega (00000-000):',
                validate: input => {
                    if (!this.shippingService.validateCEP(input)) {
                        return 'CEP inválido. Use o formato 00000-000';
                    }
                    return true;
                }
            }
        ]);

        await DisplayUtils.showLoading('Calculando frete...');

        const weight = this.shippingService.calculateWeight(this.currentCart.items);
        const value = this.currentCart.getSubtotal();
        const shippingOptions = this.shippingService.getShippingOptions(cep, weight, value);

        DisplayUtils.showShippingOptions(shippingOptions);

        const { selectedOption } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedOption',
                message: 'Escolha uma opção de frete:',
                choices: [
                    ...shippingOptions.map(option => ({
                        name: `${option.name} - ${option.isFreeShipping ? 'GRÁTIS' : `R$ ${option.cost.toFixed(2)}`} - ${option.deliveryDays} dias úteis`,
                        value: option
                    })),
                    { name: '← Não aplicar frete agora', value: null }
                ]
            }
        ]);

        if (selectedOption) {
            await this.cartService.setShippingCost(this.currentCart.id, selectedOption.cost);
            DisplayUtils.showSuccess(`Frete ${selectedOption.name} aplicado!`);
        }

        await DisplayUtils.waitForEnter();
    }

    /**
     * Finaliza a compra
     */
    async checkout() {
        if (this.currentCart.isEmpty()) {
            DisplayUtils.showWarning('Seu carrinho está vazio.');
            await DisplayUtils.waitForEnter();
            return;
        }

        DisplayUtils.showHeader();
        DisplayUtils.showCart(this.currentCart);

        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Confirma a finalização da compra?',
                default: false
            }
        ]);

        if (!confirm) return;

        await DisplayUtils.showLoading('Processando pedido...', 3000);

        try {
            const orderSummary = await this.cartService.checkout(this.currentCart.id);
            
            DisplayUtils.showHeader();
            DisplayUtils.showOrderSummary(orderSummary);
            
            // Criar novo carrinho
            this.currentCart = await this.cartService.createCart('user-default');
            
        } catch (error) {
            DisplayUtils.showError(`Erro ao processar pedido: ${error.message}`);
        }

        await DisplayUtils.waitForEnter();
    }

    /**
     * Limpa o carrinho
     */
    async clearCart() {
        if (this.currentCart.isEmpty()) {
            DisplayUtils.showWarning('Seu carrinho já está vazio.');
            await DisplayUtils.waitForEnter();
            return;
        }

        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Tem certeza que deseja limpar todo o carrinho?',
                default: false
            }
        ]);

        if (confirm) {
            await DisplayUtils.showLoading('Limpando carrinho...');
            await this.cartService.clearCart(this.currentCart.id);
            DisplayUtils.showSuccess('Carrinho limpo com sucesso!');
        }

        await DisplayUtils.waitForEnter();
    }

    /**
     * Sai da aplicação
     */
    async exit() {
        DisplayUtils.showHeader();
        console.log('🙏 Obrigado por usar nosso sistema!');
        console.log('👋 Até a próxima compra!');
        console.log();
        process.exit(0);
    }
}

module.exports = AppController;


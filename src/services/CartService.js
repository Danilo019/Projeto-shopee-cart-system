const fs = require('fs-extra');
const path = require('path');
const { ShoppingCart, CartItem } = require('../models');

/**
 * Serviço para gerenciamento do carrinho de compras
 */
class CartService {
    constructor(productService) {
        this.productService = productService;
        this.carts = new Map();
        this.dataFile = path.join(__dirname, '../data/carts.json');
        this.initialized = false;
    }

    /**
     * Inicializa o serviço carregando carrinhos do arquivo
     */
    async initialize() {
        if (this.initialized) return;

        try {
            await this.loadCarts();
            this.initialized = true;
        } catch (error) {
            console.error('Erro ao inicializar CartService:', error.message);
            this.initialized = true;
        }
    }

    /**
     * Carrega carrinhos do arquivo JSON
     */
    async loadCarts() {
        try {
            const data = await fs.readJSON(this.dataFile);
            this.carts.clear();
            
            for (const cartData of data.carts) {
                const cart = ShoppingCart.fromJSON(cartData);
                
                // Recriar itens do carrinho com produtos atualizados
                for (const itemData of cartData.items) {
                    const product = this.productService.getProductById(itemData.product.id);
                    if (product) {
                        const item = CartItem.fromJSON(itemData, product);
                        cart.items.push(item);
                    }
                }
                
                this.carts.set(cart.id, cart);
            }
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
            // Arquivo não existe, isso é normal na primeira execução
        }
    }

    /**
     * Salva carrinhos no arquivo JSON
     */
    async saveCarts() {
        try {
            await fs.ensureDir(path.dirname(this.dataFile));
            
            const data = {
                carts: Array.from(this.carts.values()).map(cart => cart.toJSON()),
                lastUpdated: new Date().toISOString()
            };
            
            await fs.writeJSON(this.dataFile, data, { spaces: 2 });
        } catch (error) {
            console.error('Erro ao salvar carrinhos:', error.message);
            throw error;
        }
    }

    /**
     * Cria um novo carrinho
     * @param {string} userId - ID do usuário (opcional)
     * @returns {ShoppingCart} Novo carrinho criado
     */
    async createCart(userId = null) {
        const cart = new ShoppingCart(userId);
        this.carts.set(cart.id, cart);
        await this.saveCarts();
        return cart;
    }

    /**
     * Obtém um carrinho por ID
     * @param {string} cartId - ID do carrinho
     * @returns {ShoppingCart|null} Carrinho encontrado ou null
     */
    getCart(cartId) {
        return this.carts.get(cartId) || null;
    }

    /**
     * Obtém carrinho por usuário
     * @param {string} userId - ID do usuário
     * @returns {ShoppingCart|null} Carrinho do usuário ou null
     */
    getCartByUser(userId) {
        for (const cart of this.carts.values()) {
            if (cart.userId === userId) {
                return cart;
            }
        }
        return null;
    }

    /**
     * Adiciona produto ao carrinho
     * @param {string} cartId - ID do carrinho
     * @param {string} productId - ID do produto
     * @param {number} quantity - Quantidade do produto
     * @returns {boolean} True se adicionado com sucesso
     */
    async addProductToCart(cartId, productId, quantity = 1) {
        const cart = this.getCart(cartId);
        if (!cart) {
            throw new Error('Carrinho não encontrado');
        }

        const product = this.productService.getProductById(productId);
        if (!product) {
            throw new Error('Produto não encontrado');
        }

        if (!product.isAvailable(quantity)) {
            throw new Error(`Produto indisponível. Estoque atual: ${product.stock}`);
        }

        const success = cart.addProduct(product, quantity);
        if (success) {
            await this.saveCarts();
        }
        return success;
    }

    /**
     * Remove produto do carrinho
     * @param {string} cartId - ID do carrinho
     * @param {string} productId - ID do produto
     * @returns {boolean} True se removido com sucesso
     */
    async removeProductFromCart(cartId, productId) {
        const cart = this.getCart(cartId);
        if (!cart) {
            throw new Error('Carrinho não encontrado');
        }

        const success = cart.removeProduct(productId);
        if (success) {
            await this.saveCarts();
        }
        return success;
    }

    /**
     * Atualiza quantidade de produto no carrinho
     * @param {string} cartId - ID do carrinho
     * @param {string} productId - ID do produto
     * @param {number} newQuantity - Nova quantidade
     * @returns {boolean} True se atualizado com sucesso
     */
    async updateProductQuantity(cartId, productId, newQuantity) {
        const cart = this.getCart(cartId);
        if (!cart) {
            throw new Error('Carrinho não encontrado');
        }

        const product = this.productService.getProductById(productId);
        if (!product) {
            throw new Error('Produto não encontrado');
        }

        if (newQuantity > 0 && !product.isAvailable(newQuantity)) {
            throw new Error(`Quantidade indisponível. Estoque atual: ${product.stock}`);
        }

        const success = cart.updateProductQuantity(productId, newQuantity);
        if (success) {
            await this.saveCarts();
        }
        return success;
    }

    /**
     * Limpa todos os itens do carrinho
     * @param {string} cartId - ID do carrinho
     * @returns {boolean} True se limpo com sucesso
     */
    async clearCart(cartId) {
        const cart = this.getCart(cartId);
        if (!cart) {
            throw new Error('Carrinho não encontrado');
        }

        cart.clear();
        await this.saveCarts();
        return true;
    }

    /**
     * Aplica cupom de desconto ao carrinho
     * @param {string} cartId - ID do carrinho
     * @param {Coupon} coupon - Cupom a ser aplicado
     * @returns {boolean} True se aplicado com sucesso
     */
    async applyCouponToCart(cartId, coupon) {
        const cart = this.getCart(cartId);
        if (!cart) {
            throw new Error('Carrinho não encontrado');
        }

        const success = cart.applyCoupon(coupon);
        if (success) {
            coupon.apply();
            await this.saveCarts();
        }
        return success;
    }

    /**
     * Remove cupom do carrinho
     * @param {string} cartId - ID do carrinho
     * @param {string} couponCode - Código do cupom
     * @returns {boolean} True se removido com sucesso
     */
    async removeCouponFromCart(cartId, couponCode) {
        const cart = this.getCart(cartId);
        if (!cart) {
            throw new Error('Carrinho não encontrado');
        }

        const success = cart.removeCoupon(couponCode);
        if (success) {
            await this.saveCarts();
        }
        return success;
    }

    /**
     * Define endereço de entrega
     * @param {string} cartId - ID do carrinho
     * @param {Object} address - Endereço de entrega
     */
    async setShippingAddress(cartId, address) {
        const cart = this.getCart(cartId);
        if (!cart) {
            throw new Error('Carrinho não encontrado');
        }

        cart.setShippingAddress(address);
        await this.saveCarts();
    }

    /**
     * Define custo do frete
     * @param {string} cartId - ID do carrinho
     * @param {number} cost - Custo do frete
     */
    async setShippingCost(cartId, cost) {
        const cart = this.getCart(cartId);
        if (!cart) {
            throw new Error('Carrinho não encontrado');
        }

        cart.setShippingCost(cost);
        await this.saveCarts();
    }

    /**
     * Finaliza a compra processando o carrinho
     * @param {string} cartId - ID do carrinho
     * @returns {Object} Resumo da compra
     */
    async checkout(cartId) {
        const cart = this.getCart(cartId);
        if (!cart) {
            throw new Error('Carrinho não encontrado');
        }

        const validation = cart.validate();
        if (!validation.isValid) {
            throw new Error(`Carrinho inválido: ${validation.errors.join(', ')}`);
        }

        // Reduzir estoque dos produtos
        for (const item of cart.items) {
            const success = await this.productService.reduceStock(item.product.id, item.quantity);
            if (!success) {
                throw new Error(`Falha ao processar estoque do produto: ${item.product.name}`);
            }
        }

        // Criar resumo da compra
        const orderSummary = {
            orderId: `ORD-${Date.now()}`,
            cartId: cart.id,
            userId: cart.userId,
            items: cart.items.map(item => item.toJSON()),
            financialSummary: cart.getFinancialSummary(),
            shippingAddress: cart.shippingAddress,
            appliedCoupons: cart.appliedCoupons,
            processedAt: new Date(),
            status: 'confirmed'
        };

        // Limpar carrinho após checkout
        cart.clear();
        await this.saveCarts();

        return orderSummary;
    }

    /**
     * Obtém estatísticas do carrinho
     * @param {string} cartId - ID do carrinho
     * @returns {Object} Estatísticas do carrinho
     */
    getCartStatistics(cartId) {
        const cart = this.getCart(cartId);
        if (!cart) {
            return null;
        }

        const categories = new Map();
        let totalWeight = 0;

        for (const item of cart.items) {
            // Contar produtos por categoria
            const category = item.product.category;
            categories.set(category, (categories.get(category) || 0) + item.quantity);
            
            // Simular peso (assumindo 0.5kg por produto)
            totalWeight += item.quantity * 0.5;
        }

        return {
            totalItems: cart.getTotalItems(),
            uniqueProducts: cart.items.length,
            categoriesCount: categories.size,
            categoriesBreakdown: Object.fromEntries(categories),
            estimatedWeight: totalWeight,
            averageItemPrice: cart.items.length > 0 ? 
                cart.getSubtotal() / cart.getTotalItems() : 0,
            hasDiscounts: cart.getProductDiscounts() > 0 || cart.getCouponDiscounts() > 0,
            isEmpty: cart.isEmpty()
        };
    }

    /**
     * Remove carrinho
     * @param {string} cartId - ID do carrinho
     * @returns {boolean} True se removido com sucesso
     */
    async removeCart(cartId) {
        const deleted = this.carts.delete(cartId);
        if (deleted) {
            await this.saveCarts();
        }
        return deleted;
    }

    /**
     * Lista todos os carrinhos (para administração)
     * @returns {Array<ShoppingCart>} Lista de carrinhos
     */
    getAllCarts() {
        return Array.from(this.carts.values());
    }

    /**
     * Obtém carrinhos abandonados (sem atividade por X dias)
     * @param {number} days - Número de dias de inatividade
     * @returns {Array<ShoppingCart>} Carrinhos abandonados
     */
    getAbandonedCarts(days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.getAllCarts().filter(cart => 
            !cart.isEmpty() && cart.updatedAt < cutoffDate
        );
    }
}

module.exports = CartService;


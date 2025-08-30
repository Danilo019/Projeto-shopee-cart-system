const { v4: uuidv4 } = require('uuid');
const CartItem = require('./CartItem');

/**
 * Classe que representa o carrinho de compras
 */
class ShoppingCart {
    /**
     * Construtor da classe ShoppingCart
     * @param {string} userId - ID do usuário proprietário do carrinho
     */
    constructor(userId = null) {
        this.id = uuidv4();
        this.userId = userId;
        this.items = [];
        this.appliedCoupons = [];
        this.shippingAddress = null;
        this.shippingCost = 0;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Adiciona um produto ao carrinho
     * @param {Product} product - Produto a ser adicionado
     * @param {number} quantity - Quantidade do produto
     * @returns {boolean} True se adicionado com sucesso
     */
    addProduct(product, quantity = 1) {
        if (!product || quantity <= 0) {
            return false;
        }

        if (!product.isAvailable(quantity)) {
            return false;
        }

        // Verifica se o produto já existe no carrinho
        const existingItem = this.items.find(item => item.product.id === product.id);

        if (existingItem) {
            // Se existe, aumenta a quantidade
            const newQuantity = existingItem.quantity + quantity;
            if (product.isAvailable(newQuantity)) {
                existingItem.updateQuantity(newQuantity);
                this.updatedAt = new Date();
                return true;
            }
            return false;
        } else {
            // Se não existe, cria um novo item
            const newItem = new CartItem(product, quantity);
            const validation = newItem.validate();
            
            if (validation.isValid) {
                this.items.push(newItem);
                this.updatedAt = new Date();
                return true;
            }
            return false;
        }
    }

    /**
     * Remove um produto do carrinho
     * @param {string} productId - ID do produto a ser removido
     * @returns {boolean} True se removido com sucesso
     */
    removeProduct(productId) {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.product.id !== productId);
        
        if (this.items.length < initialLength) {
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    /**
     * Atualiza a quantidade de um produto no carrinho
     * @param {string} productId - ID do produto
     * @param {number} newQuantity - Nova quantidade
     * @returns {boolean} True se atualizado com sucesso
     */
    updateProductQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            return this.removeProduct(productId);
        }

        const item = this.items.find(item => item.product.id === productId);
        if (item) {
            const success = item.updateQuantity(newQuantity);
            if (success) {
                this.updatedAt = new Date();
            }
            return success;
        }
        return false;
    }

    /**
     * Limpa todos os itens do carrinho
     */
    clear() {
        this.items = [];
        this.appliedCoupons = [];
        this.updatedAt = new Date();
    }

    /**
     * Obtém um item específico do carrinho
     * @param {string} productId - ID do produto
     * @returns {CartItem|null} Item encontrado ou null
     */
    getItem(productId) {
        return this.items.find(item => item.product.id === productId) || null;
    }

    /**
     * Verifica se o carrinho está vazio
     * @returns {boolean} True se vazio
     */
    isEmpty() {
        return this.items.length === 0;
    }

    /**
     * Obtém o número total de itens no carrinho
     * @returns {number} Número total de itens
     */
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    /**
     * Calcula o subtotal do carrinho (sem frete e descontos de cupom)
     * @returns {number} Subtotal do carrinho
     */
    getSubtotal() {
        return this.items.reduce((total, item) => total + item.getSubtotal(), 0);
    }

    /**
     * Calcula o subtotal original (sem nenhum desconto)
     * @returns {number} Subtotal original
     */
    getOriginalSubtotal() {
        return this.items.reduce((total, item) => total + item.getOriginalSubtotal(), 0);
    }

    /**
     * Calcula o total de descontos dos produtos
     * @returns {number} Total de descontos
     */
    getProductDiscounts() {
        return this.items.reduce((total, item) => total + item.getTotalDiscount(), 0);
    }

    /**
     * Aplica um cupom de desconto
     * @param {Object} coupon - Cupom de desconto
     * @returns {boolean} True se aplicado com sucesso
     */
    applyCoupon(coupon) {
        if (!coupon || !coupon.code || !coupon.isValid()) {
            return false;
        }

        // Verifica se o cupom já foi aplicado
        const alreadyApplied = this.appliedCoupons.some(c => c.code === coupon.code);
        if (alreadyApplied) {
            return false;
        }

        // Verifica se atende aos requisitos mínimos
        if (coupon.minimumAmount && this.getSubtotal() < coupon.minimumAmount) {
            return false;
        }

        this.appliedCoupons.push(coupon);
        this.updatedAt = new Date();
        return true;
    }

    /**
     * Remove um cupom aplicado
     * @param {string} couponCode - Código do cupom
     * @returns {boolean} True se removido com sucesso
     */
    removeCoupon(couponCode) {
        const initialLength = this.appliedCoupons.length;
        this.appliedCoupons = this.appliedCoupons.filter(c => c.code !== couponCode);
        
        if (this.appliedCoupons.length < initialLength) {
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    /**
     * Calcula o desconto total dos cupons
     * @returns {number} Desconto total dos cupons
     */
    getCouponDiscounts() {
        const subtotal = this.getSubtotal();
        return this.appliedCoupons.reduce((total, coupon) => {
            return total + coupon.calculateDiscount(subtotal);
        }, 0);
    }

    /**
     * Define o endereço de entrega
     * @param {Object} address - Endereço de entrega
     */
    setShippingAddress(address) {
        this.shippingAddress = address;
        this.updatedAt = new Date();
    }

    /**
     * Define o custo do frete
     * @param {number} cost - Custo do frete
     */
    setShippingCost(cost) {
        this.shippingCost = Math.max(0, cost);
        this.updatedAt = new Date();
    }

    /**
     * Calcula o total final do carrinho
     * @returns {number} Total final
     */
    getTotal() {
        const subtotal = this.getSubtotal();
        const couponDiscounts = this.getCouponDiscounts();
        const total = subtotal - couponDiscounts + this.shippingCost;
        return Math.max(0, total);
    }

    /**
     * Obtém resumo financeiro do carrinho
     * @returns {Object} Resumo financeiro
     */
    getFinancialSummary() {
        return {
            originalSubtotal: this.getOriginalSubtotal(),
            productDiscounts: this.getProductDiscounts(),
            subtotal: this.getSubtotal(),
            couponDiscounts: this.getCouponDiscounts(),
            shippingCost: this.shippingCost,
            total: this.getTotal(),
            totalSavings: this.getProductDiscounts() + this.getCouponDiscounts()
        };
    }

    /**
     * Valida o carrinho
     * @returns {Object} Resultado da validação
     */
    validate() {
        const errors = [];

        if (this.isEmpty()) {
            errors.push('Carrinho está vazio');
        }

        // Valida cada item
        for (const item of this.items) {
            const itemValidation = item.validate();
            if (!itemValidation.isValid) {
                errors.push(`Item ${item.product.name}: ${itemValidation.errors.join(', ')}`);
            }
        }

        // Valida cupons
        for (const coupon of this.appliedCoupons) {
            if (!coupon.isValid()) {
                errors.push(`Cupom ${coupon.code} não é válido`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Converte o carrinho para objeto JSON
     * @returns {Object} Representação JSON do carrinho
     */
    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            items: this.items.map(item => item.toJSON()),
            appliedCoupons: this.appliedCoupons,
            shippingAddress: this.shippingAddress,
            shippingCost: this.shippingCost,
            financialSummary: this.getFinancialSummary(),
            totalItems: this.getTotalItems(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Cria um carrinho a partir de dados JSON
     * @param {Object} data - Dados do carrinho
     * @returns {ShoppingCart} Nova instância de ShoppingCart
     */
    static fromJSON(data) {
        const cart = new ShoppingCart(data.userId);
        
        if (data.id) cart.id = data.id;
        if (data.appliedCoupons) cart.appliedCoupons = data.appliedCoupons;
        if (data.shippingAddress) cart.shippingAddress = data.shippingAddress;
        if (data.shippingCost) cart.shippingCost = data.shippingCost;
        if (data.createdAt) cart.createdAt = new Date(data.createdAt);
        if (data.updatedAt) cart.updatedAt = new Date(data.updatedAt);
        
        return cart;
    }
}

module.exports = ShoppingCart;


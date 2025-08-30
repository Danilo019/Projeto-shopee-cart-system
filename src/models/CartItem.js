/**
 * Classe que representa um item no carrinho de compras
 */
class CartItem {
    /**
     * Construtor da classe CartItem
     * @param {Product} product - Produto do item
     * @param {number} quantity - Quantidade do produto
     */
    constructor(product, quantity = 1) {
        this.product = product;
        this.quantity = quantity;
        this.addedAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Calcula o subtotal do item (preço unitário × quantidade)
     * @returns {number} Subtotal do item
     */
    getSubtotal() {
        return this.product.getFinalPrice() * this.quantity;
    }

    /**
     * Calcula o valor total do desconto do item
     * @returns {number} Valor total do desconto
     */
    getTotalDiscount() {
        return this.product.getDiscountAmount() * this.quantity;
    }

    /**
     * Calcula o subtotal sem desconto
     * @returns {number} Subtotal original sem desconto
     */
    getOriginalSubtotal() {
        return this.product.price * this.quantity;
    }

    /**
     * Atualiza a quantidade do item
     * @param {number} newQuantity - Nova quantidade
     * @returns {boolean} True se a atualização foi bem-sucedida
     */
    updateQuantity(newQuantity) {
        if (newQuantity <= 0) {
            return false;
        }

        if (!this.product.isAvailable(newQuantity)) {
            return false;
        }

        this.quantity = newQuantity;
        this.updatedAt = new Date();
        return true;
    }

    /**
     * Aumenta a quantidade do item
     * @param {number} amount - Quantidade a ser adicionada
     * @returns {boolean} True se a operação foi bem-sucedida
     */
    increaseQuantity(amount = 1) {
        const newQuantity = this.quantity + amount;
        return this.updateQuantity(newQuantity);
    }

    /**
     * Diminui a quantidade do item
     * @param {number} amount - Quantidade a ser removida
     * @returns {boolean} True se a operação foi bem-sucedida
     */
    decreaseQuantity(amount = 1) {
        const newQuantity = this.quantity - amount;
        return this.updateQuantity(newQuantity);
    }

    /**
     * Verifica se o item é válido
     * @returns {Object} Resultado da validação
     */
    validate() {
        const errors = [];

        if (!this.product) {
            errors.push('Produto é obrigatório');
        } else {
            const productValidation = this.product.validate();
            if (!productValidation.isValid) {
                errors.push(...productValidation.errors);
            }
        }

        if (this.quantity <= 0) {
            errors.push('Quantidade deve ser maior que zero');
        }

        if (this.product && !this.product.isAvailable(this.quantity)) {
            errors.push(`Quantidade solicitada (${this.quantity}) não disponível em estoque (${this.product.stock})`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Verifica se dois itens são do mesmo produto
     * @param {CartItem} otherItem - Outro item para comparação
     * @returns {boolean} True se são do mesmo produto
     */
    isSameProduct(otherItem) {
        return this.product.id === otherItem.product.id;
    }

    /**
     * Combina este item com outro do mesmo produto
     * @param {CartItem} otherItem - Outro item do mesmo produto
     * @returns {boolean} True se a combinação foi bem-sucedida
     */
    combineWith(otherItem) {
        if (!this.isSameProduct(otherItem)) {
            return false;
        }

        const newQuantity = this.quantity + otherItem.quantity;
        return this.updateQuantity(newQuantity);
    }

    /**
     * Converte o item para objeto JSON
     * @returns {Object} Representação JSON do item
     */
    toJSON() {
        return {
            product: this.product.toJSON(),
            quantity: this.quantity,
            subtotal: this.getSubtotal(),
            originalSubtotal: this.getOriginalSubtotal(),
            totalDiscount: this.getTotalDiscount(),
            addedAt: this.addedAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Cria um CartItem a partir de dados JSON
     * @param {Object} data - Dados do item
     * @param {Product} product - Instância do produto
     * @returns {CartItem} Nova instância de CartItem
     */
    static fromJSON(data, product) {
        const item = new CartItem(product, data.quantity);
        
        if (data.addedAt) item.addedAt = new Date(data.addedAt);
        if (data.updatedAt) item.updatedAt = new Date(data.updatedAt);
        
        return item;
    }

    /**
     * Formata o item para exibição no terminal
     * @returns {Object} Dados formatados para exibição
     */
    getDisplayInfo() {
        const hasDiscount = this.product.discount > 0;
        
        return {
            name: this.product.name,
            category: this.product.category,
            unitPrice: `R$ ${this.product.price.toFixed(2)}`,
            finalPrice: `R$ ${this.product.getFinalPrice().toFixed(2)}`,
            quantity: this.quantity,
            subtotal: `R$ ${this.getSubtotal().toFixed(2)}`,
            discount: hasDiscount ? `${this.product.discount}%` : '-',
            savings: hasDiscount ? `R$ ${this.getTotalDiscount().toFixed(2)}` : '-'
        };
    }
}

module.exports = CartItem;


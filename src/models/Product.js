const { v4: uuidv4 } = require('uuid');

/**
 * Classe que representa um produto no sistema
 */
class Product {
    /**
     * Construtor da classe Product
     * @param {string} name - Nome do produto
     * @param {number} price - Preço do produto
     * @param {string} category - Categoria do produto
     * @param {string} description - Descrição do produto
     * @param {number} stock - Quantidade em estoque
     * @param {string} image - URL da imagem do produto
     * @param {number} rating - Avaliação do produto (0-5)
     * @param {number} discount - Desconto em porcentagem (0-100)
     */
    constructor(name, price, category, description = '', stock = 0, image = '', rating = 0, discount = 0) {
        this.id = uuidv4();
        this.name = name;
        this.price = price;
        this.category = category;
        this.description = description;
        this.stock = stock;
        this.image = image;
        this.rating = rating;
        this.discount = discount;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Calcula o preço com desconto aplicado
     * @returns {number} Preço final com desconto
     */
    getFinalPrice() {
        if (this.discount > 0) {
            return this.price * (1 - this.discount / 100);
        }
        return this.price;
    }

    /**
     * Calcula o valor do desconto em reais
     * @returns {number} Valor do desconto
     */
    getDiscountAmount() {
        return this.price - this.getFinalPrice();
    }

    /**
     * Verifica se o produto está disponível em estoque
     * @param {number} quantity - Quantidade desejada
     * @returns {boolean} True se disponível
     */
    isAvailable(quantity = 1) {
        return this.stock >= quantity;
    }

    /**
     * Reduz o estoque do produto
     * @param {number} quantity - Quantidade a ser reduzida
     * @returns {boolean} True se a operação foi bem-sucedida
     */
    reduceStock(quantity) {
        if (this.isAvailable(quantity)) {
            this.stock -= quantity;
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    /**
     * Aumenta o estoque do produto
     * @param {number} quantity - Quantidade a ser adicionada
     */
    increaseStock(quantity) {
        this.stock += quantity;
        this.updatedAt = new Date();
    }

    /**
     * Atualiza as informações do produto
     * @param {Object} updates - Objeto com as atualizações
     */
    update(updates) {
        const allowedFields = ['name', 'price', 'category', 'description', 'stock', 'image', 'rating', 'discount'];
        
        for (const field of allowedFields) {
            if (updates.hasOwnProperty(field)) {
                this[field] = updates[field];
            }
        }
        
        this.updatedAt = new Date();
    }

    /**
     * Valida se os dados do produto são válidos
     * @returns {Object} Objeto com resultado da validação
     */
    validate() {
        const errors = [];

        if (!this.name || this.name.trim().length === 0) {
            errors.push('Nome do produto é obrigatório');
        }

        if (this.price <= 0) {
            errors.push('Preço deve ser maior que zero');
        }

        if (!this.category || this.category.trim().length === 0) {
            errors.push('Categoria é obrigatória');
        }

        if (this.stock < 0) {
            errors.push('Estoque não pode ser negativo');
        }

        if (this.rating < 0 || this.rating > 5) {
            errors.push('Avaliação deve estar entre 0 e 5');
        }

        if (this.discount < 0 || this.discount > 100) {
            errors.push('Desconto deve estar entre 0 e 100%');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Converte o produto para objeto JSON
     * @returns {Object} Representação JSON do produto
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            price: this.price,
            finalPrice: this.getFinalPrice(),
            category: this.category,
            description: this.description,
            stock: this.stock,
            image: this.image,
            rating: this.rating,
            discount: this.discount,
            discountAmount: this.getDiscountAmount(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Cria um produto a partir de dados JSON
     * @param {Object} data - Dados do produto
     * @returns {Product} Nova instância de Product
     */
    static fromJSON(data) {
        const product = new Product(
            data.name,
            data.price,
            data.category,
            data.description,
            data.stock,
            data.image,
            data.rating,
            data.discount
        );
        
        if (data.id) product.id = data.id;
        if (data.createdAt) product.createdAt = new Date(data.createdAt);
        if (data.updatedAt) product.updatedAt = new Date(data.updatedAt);
        
        return product;
    }
}

module.exports = Product;


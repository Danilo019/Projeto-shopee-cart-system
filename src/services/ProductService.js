const fs = require('fs-extra');
const path = require('path');
const { Product } = require('../models');

/**
 * Serviço para gerenciamento de produtos
 */
class ProductService {
    constructor() {
        this.products = new Map();
        this.dataFile = path.join(__dirname, '../data/products.json');
        this.initialized = false;
    }

    /**
     * Inicializa o serviço carregando produtos do arquivo
     */
    async initialize() {
        if (this.initialized) return;

        try {
            await this.loadProducts();
            this.initialized = true;
        } catch (error) {
            console.error('Erro ao inicializar ProductService:', error.message);
            await this.createSampleProducts();
            this.initialized = true;
        }
    }

    /**
     * Carrega produtos do arquivo JSON
     */
    async loadProducts() {
        try {
            const data = await fs.readJSON(this.dataFile);
            this.products.clear();
            
            for (const productData of data.products) {
                const product = Product.fromJSON(productData);
                this.products.set(product.id, product);
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Arquivo não existe, criar produtos de exemplo
                await this.createSampleProducts();
            } else {
                throw error;
            }
        }
    }

    /**
     * Salva produtos no arquivo JSON
     */
    async saveProducts() {
        try {
            await fs.ensureDir(path.dirname(this.dataFile));
            
            const data = {
                products: Array.from(this.products.values()).map(product => product.toJSON()),
                lastUpdated: new Date().toISOString()
            };
            
            await fs.writeJSON(this.dataFile, data, { spaces: 2 });
        } catch (error) {
            console.error('Erro ao salvar produtos:', error.message);
            throw error;
        }
    }

    /**
     * Cria produtos de exemplo para demonstração
     */
    async createSampleProducts() {
        const sampleProducts = [
            // Eletrônicos
            new Product('Smartphone Samsung Galaxy A54', 1299.99, 'Eletrônicos', 
                'Smartphone com tela de 6.4", 128GB, câmera tripla 50MP', 15, '', 4.5, 10),
            new Product('Fone de Ouvido Bluetooth JBL', 199.99, 'Eletrônicos', 
                'Fone sem fio com cancelamento de ruído, bateria 30h', 25, '', 4.3, 15),
            new Product('Carregador Portátil 10000mAh', 89.99, 'Eletrônicos', 
                'Power bank com entrada USB-C e saída rápida', 30, '', 4.2, 0),
            new Product('Smart TV 43" 4K LG', 1899.99, 'Eletrônicos', 
                'TV LED 4K com WebOS, HDR10 e controle por voz', 8, '', 4.6, 20),

            // Roupas e Acessórios
            new Product('Camiseta Básica Algodão', 39.99, 'Roupas', 
                'Camiseta 100% algodão, várias cores disponíveis', 50, '', 4.1, 0),
            new Product('Tênis Esportivo Nike Air', 299.99, 'Calçados', 
                'Tênis para corrida com tecnologia Air Max', 20, '', 4.7, 25),
            new Product('Jaqueta Jeans Feminina', 129.99, 'Roupas', 
                'Jaqueta jeans clássica, tamanhos P ao GG', 18, '', 4.4, 30),
            new Product('Relógio Digital Casio', 159.99, 'Acessórios', 
                'Relógio resistente à água com cronômetro', 12, '', 4.3, 0),

            // Casa e Decoração
            new Product('Conjunto de Panelas Antiaderente', 249.99, 'Casa', 
                'Kit com 5 panelas antiaderente com tampas', 15, '', 4.5, 35),
            new Product('Luminária LED de Mesa', 79.99, 'Decoração', 
                'Luminária ajustável com 3 níveis de intensidade', 22, '', 4.2, 0),
            new Product('Aspirador de Pó Portátil', 189.99, 'Eletrodomésticos', 
                'Aspirador sem fio com filtro HEPA', 10, '', 4.4, 20),
            new Product('Jogo de Cama Casal 4 Peças', 99.99, 'Casa', 
                'Jogo de cama 100% algodão, várias estampas', 25, '', 4.1, 15),

            // Beleza e Cuidados
            new Product('Kit Shampoo e Condicionador', 49.99, 'Beleza', 
                'Kit para cabelos oleosos com extratos naturais', 35, '', 4.3, 0),
            new Product('Perfume Feminino 100ml', 159.99, 'Perfumaria', 
                'Fragrância floral com notas de jasmim', 18, '', 4.6, 40),
            new Product('Creme Hidratante Facial', 69.99, 'Cuidados', 
                'Creme anti-idade com ácido hialurônico', 28, '', 4.4, 25),

            // Livros e Educação
            new Product('Livro "O Poder do Hábito"', 34.99, 'Livros', 
                'Bestseller sobre como formar hábitos positivos', 40, '', 4.8, 0),
            new Product('Caderno Universitário 200 Folhas', 19.99, 'Papelaria', 
                'Caderno espiral com divisórias coloridas', 60, '', 4.0, 0),

            // Esportes e Lazer
            new Product('Bicicleta Aro 29 Mountain Bike', 899.99, 'Esportes', 
                'Bike com 21 marchas e freios a disco', 5, '', 4.5, 15),
            new Product('Bola de Futebol Oficial', 79.99, 'Esportes', 
                'Bola oficial FIFA com costura à mão', 25, '', 4.3, 0),
            new Product('Tapete de Yoga Premium', 89.99, 'Fitness', 
                'Tapete antiderrapante 6mm de espessura', 20, '', 4.4, 20)
        ];

        for (const product of sampleProducts) {
            this.products.set(product.id, product);
        }

        await this.saveProducts();
    }

    /**
     * Obtém todos os produtos
     * @returns {Array<Product>} Lista de produtos
     */
    getAllProducts() {
        return Array.from(this.products.values());
    }

    /**
     * Obtém um produto por ID
     * @param {string} productId - ID do produto
     * @returns {Product|null} Produto encontrado ou null
     */
    getProductById(productId) {
        return this.products.get(productId) || null;
    }

    /**
     * Busca produtos por nome ou categoria
     * @param {string} query - Termo de busca
     * @returns {Array<Product>} Produtos encontrados
     */
    searchProducts(query) {
        const searchTerm = query.toLowerCase();
        return this.getAllProducts().filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Filtra produtos por categoria
     * @param {string} category - Categoria desejada
     * @returns {Array<Product>} Produtos da categoria
     */
    getProductsByCategory(category) {
        return this.getAllProducts().filter(product => 
            product.category.toLowerCase() === category.toLowerCase()
        );
    }

    /**
     * Obtém produtos com desconto
     * @returns {Array<Product>} Produtos em promoção
     */
    getDiscountedProducts() {
        return this.getAllProducts().filter(product => product.discount > 0);
    }

    /**
     * Obtém produtos mais bem avaliados
     * @param {number} minRating - Avaliação mínima
     * @returns {Array<Product>} Produtos bem avaliados
     */
    getTopRatedProducts(minRating = 4.0) {
        return this.getAllProducts()
            .filter(product => product.rating >= minRating)
            .sort((a, b) => b.rating - a.rating);
    }

    /**
     * Obtém produtos por faixa de preço
     * @param {number} minPrice - Preço mínimo
     * @param {number} maxPrice - Preço máximo
     * @returns {Array<Product>} Produtos na faixa de preço
     */
    getProductsByPriceRange(minPrice, maxPrice) {
        return this.getAllProducts().filter(product => {
            const price = product.getFinalPrice();
            return price >= minPrice && price <= maxPrice;
        });
    }

    /**
     * Obtém todas as categorias disponíveis
     * @returns {Array<string>} Lista de categorias
     */
    getCategories() {
        const categories = new Set();
        this.getAllProducts().forEach(product => {
            categories.add(product.category);
        });
        return Array.from(categories).sort();
    }

    /**
     * Adiciona um novo produto
     * @param {Product} product - Produto a ser adicionado
     * @returns {boolean} True se adicionado com sucesso
     */
    async addProduct(product) {
        const validation = product.validate();
        if (!validation.isValid) {
            throw new Error(`Produto inválido: ${validation.errors.join(', ')}`);
        }

        this.products.set(product.id, product);
        await this.saveProducts();
        return true;
    }

    /**
     * Atualiza um produto existente
     * @param {string} productId - ID do produto
     * @param {Object} updates - Atualizações a serem aplicadas
     * @returns {boolean} True se atualizado com sucesso
     */
    async updateProduct(productId, updates) {
        const product = this.products.get(productId);
        if (!product) {
            throw new Error('Produto não encontrado');
        }

        product.update(updates);
        const validation = product.validate();
        if (!validation.isValid) {
            throw new Error(`Produto inválido: ${validation.errors.join(', ')}`);
        }

        await this.saveProducts();
        return true;
    }

    /**
     * Remove um produto
     * @param {string} productId - ID do produto
     * @returns {boolean} True se removido com sucesso
     */
    async removeProduct(productId) {
        const deleted = this.products.delete(productId);
        if (deleted) {
            await this.saveProducts();
        }
        return deleted;
    }

    /**
     * Verifica disponibilidade de estoque
     * @param {string} productId - ID do produto
     * @param {number} quantity - Quantidade desejada
     * @returns {boolean} True se disponível
     */
    checkStock(productId, quantity) {
        const product = this.products.get(productId);
        return product ? product.isAvailable(quantity) : false;
    }

    /**
     * Reduz estoque de um produto
     * @param {string} productId - ID do produto
     * @param {number} quantity - Quantidade a ser reduzida
     * @returns {boolean} True se operação foi bem-sucedida
     */
    async reduceStock(productId, quantity) {
        const product = this.products.get(productId);
        if (!product) {
            throw new Error('Produto não encontrado');
        }

        const success = product.reduceStock(quantity);
        if (success) {
            await this.saveProducts();
        }
        return success;
    }

    /**
     * Aumenta estoque de um produto
     * @param {string} productId - ID do produto
     * @param {number} quantity - Quantidade a ser adicionada
     */
    async increaseStock(productId, quantity) {
        const product = this.products.get(productId);
        if (!product) {
            throw new Error('Produto não encontrado');
        }

        product.increaseStock(quantity);
        await this.saveProducts();
    }
}

module.exports = ProductService;


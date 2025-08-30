/**
 * Testes básicos do sistema de carrinho de compras
 */

const { Product, CartItem, ShoppingCart, Coupon } = require('../src/models');
const { ProductService, CartService, DiscountService, ShippingService } = require('../src/services');
const { ValidationUtils } = require('../src/utils');

/**
 * Classe para executar testes
 */
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    /**
     * Adiciona um teste
     * @param {string} name - Nome do teste
     * @param {Function} testFn - Função do teste
     */
    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    /**
     * Executa todos os testes
     */
    async run() {
        console.log('🧪 Iniciando testes do sistema...\n');

        for (const { name, testFn } of this.tests) {
            try {
                await testFn();
                console.log(`✅ ${name}`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${name}: ${error.message}`);
                this.failed++;
            }
        }

        console.log(`\n📊 Resultados dos testes:`);
        console.log(`✅ Passou: ${this.passed}`);
        console.log(`❌ Falhou: ${this.failed}`);
        console.log(`📈 Total: ${this.tests.length}`);
        
        if (this.failed === 0) {
            console.log('\n🎉 Todos os testes passaram!');
        } else {
            console.log(`\n⚠️  ${this.failed} teste(s) falharam.`);
        }
    }

    /**
     * Assertion helper
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    /**
     * Assertion para igualdade
     */
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }

    /**
     * Assertion para arrays
     */
    assertArrayEqual(actual, expected, message) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(message || `Arrays are not equal`);
        }
    }
}

// Criar instância do test runner
const runner = new TestRunner();

// Testes dos modelos
runner.test('Product - Criação e validação', () => {
    const product = new Product('Teste', 100, 'Categoria', 'Descrição', 10);
    
    runner.assert(product.name === 'Teste', 'Nome do produto deve ser "Teste"');
    runner.assert(product.price === 100, 'Preço deve ser 100');
    runner.assert(product.category === 'Categoria', 'Categoria deve ser "Categoria"');
    runner.assert(product.stock === 10, 'Estoque deve ser 10');
    
    const validation = product.validate();
    runner.assert(validation.isValid, 'Produto deve ser válido');
});

runner.test('Product - Cálculo de preço com desconto', () => {
    const product = new Product('Teste', 100, 'Categoria', 'Descrição', 10, '', 0, 20);
    
    runner.assertEqual(product.getFinalPrice(), 80, 'Preço final deve ser 80 (20% de desconto)');
    runner.assertEqual(product.getDiscountAmount(), 20, 'Desconto deve ser 20');
});

runner.test('Product - Controle de estoque', () => {
    const product = new Product('Teste', 100, 'Categoria', 'Descrição', 5);
    
    runner.assert(product.isAvailable(3), 'Deve estar disponível para quantidade 3');
    runner.assert(!product.isAvailable(10), 'Não deve estar disponível para quantidade 10');
    
    runner.assert(product.reduceStock(3), 'Deve conseguir reduzir estoque em 3');
    runner.assertEqual(product.stock, 2, 'Estoque deve ser 2 após redução');
    
    runner.assert(!product.reduceStock(5), 'Não deve conseguir reduzir estoque em 5');
});

runner.test('CartItem - Criação e cálculos', () => {
    const product = new Product('Teste', 50, 'Categoria', 'Descrição', 10);
    const item = new CartItem(product, 2);
    
    runner.assertEqual(item.quantity, 2, 'Quantidade deve ser 2');
    runner.assertEqual(item.getSubtotal(), 100, 'Subtotal deve ser 100');
    runner.assertEqual(item.getOriginalSubtotal(), 100, 'Subtotal original deve ser 100');
});

runner.test('CartItem - Atualização de quantidade', () => {
    const product = new Product('Teste', 50, 'Categoria', 'Descrição', 10);
    const item = new CartItem(product, 2);
    
    runner.assert(item.updateQuantity(5), 'Deve conseguir atualizar quantidade para 5');
    runner.assertEqual(item.quantity, 5, 'Quantidade deve ser 5');
    
    runner.assert(!item.updateQuantity(15), 'Não deve conseguir atualizar para quantidade maior que estoque');
    runner.assert(!item.updateQuantity(0), 'Não deve conseguir atualizar para quantidade 0');
});

runner.test('ShoppingCart - Adição de produtos', () => {
    const cart = new ShoppingCart();
    const product = new Product('Teste', 50, 'Categoria', 'Descrição', 10);
    
    runner.assert(cart.isEmpty(), 'Carrinho deve estar vazio inicialmente');
    
    runner.assert(cart.addProduct(product, 2), 'Deve conseguir adicionar produto');
    runner.assertEqual(cart.items.length, 1, 'Carrinho deve ter 1 item');
    runner.assertEqual(cart.getTotalItems(), 2, 'Total de itens deve ser 2');
    
    // Adicionar mesmo produto novamente
    runner.assert(cart.addProduct(product, 1), 'Deve conseguir adicionar mesmo produto novamente');
    runner.assertEqual(cart.items.length, 1, 'Carrinho ainda deve ter 1 item único');
    runner.assertEqual(cart.getTotalItems(), 3, 'Total de itens deve ser 3');
});

runner.test('ShoppingCart - Cálculos financeiros', () => {
    const cart = new ShoppingCart();
    const product1 = new Product('Produto 1', 100, 'Cat1', 'Desc1', 10, '', 0, 10); // 10% desconto
    const product2 = new Product('Produto 2', 50, 'Cat2', 'Desc2', 10);
    
    cart.addProduct(product1, 2); // 2 x 90 = 180
    cart.addProduct(product2, 1); // 1 x 50 = 50
    
    runner.assertEqual(cart.getOriginalSubtotal(), 250, 'Subtotal original deve ser 250');
    runner.assertEqual(cart.getProductDiscounts(), 20, 'Desconto de produtos deve ser 20');
    runner.assertEqual(cart.getSubtotal(), 230, 'Subtotal deve ser 230');
});

runner.test('Coupon - Criação e validação', () => {
    const coupon = new Coupon('TEST10', 'percentage', 10, 50);
    
    runner.assert(coupon.isValid(), 'Cupom deve ser válido');
    runner.assertEqual(coupon.calculateDiscount(100), 10, 'Desconto deve ser 10 para valor 100');
    runner.assertEqual(coupon.calculateDiscount(30), 0, 'Desconto deve ser 0 para valor abaixo do mínimo');
});

runner.test('Coupon - Aplicação e uso', () => {
    const coupon = new Coupon('TEST20', 'fixed', 20, 0, null, 2);
    
    runner.assertEqual(coupon.usageCount, 0, 'Contador de uso deve ser 0 inicialmente');
    
    runner.assert(coupon.apply(), 'Deve conseguir aplicar cupom');
    runner.assertEqual(coupon.usageCount, 1, 'Contador deve ser 1 após aplicação');
    
    runner.assert(coupon.apply(), 'Deve conseguir aplicar cupom novamente');
    runner.assertEqual(coupon.usageCount, 2, 'Contador deve ser 2 após segunda aplicação');
    
    runner.assert(!coupon.apply(), 'Não deve conseguir aplicar cupom após limite');
});

runner.test('ValidationUtils - Validação de números', () => {
    const validPositive = ValidationUtils.validatePositiveNumber(10, 'Teste');
    runner.assert(validPositive.isValid, 'Número positivo deve ser válido');
    
    const invalidZero = ValidationUtils.validatePositiveNumber(0, 'Teste');
    runner.assert(!invalidZero.isValid, 'Zero não deve ser válido para número positivo');
    
    const invalidNegative = ValidationUtils.validatePositiveNumber(-5, 'Teste');
    runner.assert(!invalidNegative.isValid, 'Número negativo não deve ser válido');
});

runner.test('ValidationUtils - Validação de strings', () => {
    const validString = ValidationUtils.validateString('Teste', 'Campo', 1, 10);
    runner.assert(validString.isValid, 'String válida deve passar na validação');
    
    const emptyString = ValidationUtils.validateString('', 'Campo', 1, 10);
    runner.assert(!emptyString.isValid, 'String vazia não deve ser válida');
    
    const longString = ValidationUtils.validateString('a'.repeat(20), 'Campo', 1, 10);
    runner.assert(!longString.isValid, 'String muito longa não deve ser válida');
});

runner.test('ValidationUtils - Validação de CEP', () => {
    const validCEP = ValidationUtils.validateCEP('01234-567');
    runner.assert(validCEP.isValid, 'CEP válido deve passar na validação');
    
    const validCEPNoHyphen = ValidationUtils.validateCEP('01234567');
    runner.assert(validCEPNoHyphen.isValid, 'CEP sem hífen deve ser válido');
    
    const invalidCEP = ValidationUtils.validateCEP('123');
    runner.assert(!invalidCEP.isValid, 'CEP inválido não deve passar na validação');
    
    const invalidCEPPattern = ValidationUtils.validateCEP('00000000');
    runner.assert(!invalidCEPPattern.isValid, 'CEP com padrão inválido não deve passar');
});

// Testes de integração básicos
runner.test('Integração - ProductService inicialização', async () => {
    const productService = new ProductService();
    await productService.initialize();
    
    const products = productService.getAllProducts();
    runner.assert(products.length > 0, 'Deve ter produtos após inicialização');
    
    const categories = productService.getCategories();
    runner.assert(categories.length > 0, 'Deve ter categorias após inicialização');
});

runner.test('Integração - CartService operações básicas', async () => {
    const productService = new ProductService();
    await productService.initialize();
    
    const cartService = new CartService(productService);
    await cartService.initialize();
    
    const cart = await cartService.createCart('test-user');
    runner.assert(cart.isEmpty(), 'Carrinho novo deve estar vazio');
    
    const products = productService.getAllProducts();
    const firstProduct = products[0];
    
    const success = await cartService.addProductToCart(cart.id, firstProduct.id, 1);
    runner.assert(success, 'Deve conseguir adicionar produto ao carrinho');
    
    const updatedCart = cartService.getCart(cart.id);
    runner.assertEqual(updatedCart.items.length, 1, 'Carrinho deve ter 1 item após adição');
});

runner.test('Integração - DiscountService cupons', async () => {
    const discountService = new DiscountService();
    await discountService.initialize();
    
    const coupons = discountService.getActiveCoupons();
    runner.assert(coupons.length > 0, 'Deve ter cupons ativos após inicialização');
    
    const firstCoupon = coupons[0];
    const validation = discountService.validateCoupon(firstCoupon.code, 100);
    runner.assert(validation.isValid, 'Cupom válido deve passar na validação');
});

runner.test('Integração - ShippingService cálculo de frete', () => {
    const shippingService = new ShippingService();
    
    runner.assert(shippingService.validateCEP('01234-567'), 'CEP válido deve ser aceito');
    runner.assert(!shippingService.validateCEP('123'), 'CEP inválido deve ser rejeitado');
    
    const shipping = shippingService.calculateShipping('01234-567', 1, 100);
    runner.assert(shipping.cost >= 0, 'Custo de frete deve ser não negativo');
    runner.assert(shipping.deliveryDays > 0, 'Dias de entrega devem ser positivos');
});

// Executar todos os testes
async function runTests() {
    await runner.run();
    
    // Retornar código de saída apropriado
    process.exit(runner.failed > 0 ? 1 : 0);
}

// Executar se chamado diretamente
if (require.main === module) {
    runTests().catch(error => {
        console.error('❌ Erro ao executar testes:', error);
        process.exit(1);
    });
}

module.exports = { TestRunner, runTests };


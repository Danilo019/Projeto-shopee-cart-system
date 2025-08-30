/**
 * Arquivo de exportação dos serviços do sistema
 */

const ProductService = require('./ProductService');
const CartService = require('./CartService');
const DiscountService = require('./DiscountService');
const ShippingService = require('./ShippingService');

module.exports = {
    ProductService,
    CartService,
    DiscountService,
    ShippingService
};


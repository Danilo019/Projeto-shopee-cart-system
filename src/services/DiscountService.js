const fs = require('fs-extra');
const path = require('path');
const { Coupon } = require('../models');

/**
 * Serviço para gerenciamento de descontos e cupons
 */
class DiscountService {
    constructor() {
        this.coupons = new Map();
        this.dataFile = path.join(__dirname, '../data/coupons.json');
        this.initialized = false;
    }

    /**
     * Inicializa o serviço carregando cupons do arquivo
     */
    async initialize() {
        if (this.initialized) return;

        try {
            await this.loadCoupons();
            this.initialized = true;
        } catch (error) {
            console.error('Erro ao inicializar DiscountService:', error.message);
            await this.createSampleCoupons();
            this.initialized = true;
        }
    }

    /**
     * Carrega cupons do arquivo JSON
     */
    async loadCoupons() {
        try {
            const data = await fs.readJSON(this.dataFile);
            this.coupons.clear();
            
            for (const couponData of data.coupons) {
                const coupon = Coupon.fromJSON(couponData);
                this.coupons.set(coupon.code, coupon);
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Arquivo não existe, criar cupons de exemplo
                await this.createSampleCoupons();
            } else {
                throw error;
            }
        }
    }

    /**
     * Salva cupons no arquivo JSON
     */
    async saveCoupons() {
        try {
            await fs.ensureDir(path.dirname(this.dataFile));
            
            const data = {
                coupons: Array.from(this.coupons.values()).map(coupon => coupon.toJSON()),
                lastUpdated: new Date().toISOString()
            };
            
            await fs.writeJSON(this.dataFile, data, { spaces: 2 });
        } catch (error) {
            console.error('Erro ao salvar cupons:', error.message);
            throw error;
        }
    }

    /**
     * Cria cupons de exemplo para demonstração
     */
    async createSampleCoupons() {
        const sampleCoupons = Coupon.createSampleCoupons();
        
        // Adicionar mais cupons específicos
        const additionalCoupons = [
            new Coupon('PRIMEIRA10', 'percentage', 10, 0, null, 1, 'Desconto para primeira compra'),
            new Coupon('BLACKFRIDAY', 'percentage', 30, 150, new Date('2024-12-31'), 1000, 'Black Friday 2024'),
            new Coupon('FRETEGRATIS', 'fixed', 25, 80, null, 500, 'Frete grátis acima de R$ 80'),
            new Coupon('NATAL2024', 'percentage', 20, 100, new Date('2024-12-25'), 200, 'Promoção de Natal'),
            new Coupon('VOLTA5', 'fixed', 5, 30, null, null, 'Desconto volta às aulas')
        ];

        const allCoupons = [...sampleCoupons, ...additionalCoupons];
        
        for (const coupon of allCoupons) {
            this.coupons.set(coupon.code, coupon);
        }

        await this.saveCoupons();
    }

    /**
     * Obtém todos os cupons
     * @returns {Array<Coupon>} Lista de cupons
     */
    getAllCoupons() {
        return Array.from(this.coupons.values());
    }

    /**
     * Obtém cupons ativos
     * @returns {Array<Coupon>} Lista de cupons válidos
     */
    getActiveCoupons() {
        return this.getAllCoupons().filter(coupon => coupon.isValid());
    }

    /**
     * Obtém um cupom por código
     * @param {string} code - Código do cupom
     * @returns {Coupon|null} Cupom encontrado ou null
     */
    getCouponByCode(code) {
        return this.coupons.get(code.toUpperCase()) || null;
    }

    /**
     * Valida um cupom para um determinado valor
     * @param {string} code - Código do cupom
     * @param {number} amount - Valor para validação
     * @returns {Object} Resultado da validação
     */
    validateCoupon(code, amount) {
        const coupon = this.getCouponByCode(code);
        
        if (!coupon) {
            return {
                isValid: false,
                error: 'Cupom não encontrado',
                coupon: null
            };
        }

        if (!coupon.isValid()) {
            const status = coupon.getStatus();
            return {
                isValid: false,
                error: status.message,
                coupon: coupon
            };
        }

        if (amount < coupon.minimumAmount) {
            return {
                isValid: false,
                error: `Valor mínimo de R$ ${coupon.minimumAmount.toFixed(2)} não atingido`,
                coupon: coupon
            };
        }

        const discount = coupon.calculateDiscount(amount);
        
        return {
            isValid: true,
            error: null,
            coupon: coupon,
            discount: discount,
            finalAmount: Math.max(0, amount - discount)
        };
    }

    /**
     * Aplica um cupom (incrementa contador de uso)
     * @param {string} code - Código do cupom
     * @returns {boolean} True se aplicado com sucesso
     */
    async applyCoupon(code) {
        const coupon = this.getCouponByCode(code);
        if (!coupon) {
            return false;
        }

        const success = coupon.apply();
        if (success) {
            await this.saveCoupons();
        }
        return success;
    }

    /**
     * Reverte aplicação de um cupom
     * @param {string} code - Código do cupom
     */
    async revertCoupon(code) {
        const coupon = this.getCouponByCode(code);
        if (coupon) {
            coupon.revert();
            await this.saveCoupons();
        }
    }

    /**
     * Adiciona um novo cupom
     * @param {Coupon} coupon - Cupom a ser adicionado
     * @returns {boolean} True se adicionado com sucesso
     */
    async addCoupon(coupon) {
        const validation = coupon.validate();
        if (!validation.isValid) {
            throw new Error(`Cupom inválido: ${validation.errors.join(', ')}`);
        }

        if (this.coupons.has(coupon.code)) {
            throw new Error('Código de cupom já existe');
        }

        this.coupons.set(coupon.code, coupon);
        await this.saveCoupons();
        return true;
    }

    /**
     * Atualiza um cupom existente
     * @param {string} code - Código do cupom
     * @param {Object} updates - Atualizações a serem aplicadas
     * @returns {boolean} True se atualizado com sucesso
     */
    async updateCoupon(code, updates) {
        const coupon = this.getCouponByCode(code);
        if (!coupon) {
            throw new Error('Cupom não encontrado');
        }

        const allowedFields = ['type', 'value', 'minimumAmount', 'expiryDate', 'usageLimit', 'description', 'isActive'];
        
        for (const field of allowedFields) {
            if (updates.hasOwnProperty(field)) {
                coupon[field] = updates[field];
            }
        }

        coupon.updatedAt = new Date();

        const validation = coupon.validate();
        if (!validation.isValid) {
            throw new Error(`Cupom inválido: ${validation.errors.join(', ')}`);
        }

        await this.saveCoupons();
        return true;
    }

    /**
     * Remove um cupom
     * @param {string} code - Código do cupom
     * @returns {boolean} True se removido com sucesso
     */
    async removeCoupon(code) {
        const deleted = this.coupons.delete(code.toUpperCase());
        if (deleted) {
            await this.saveCoupons();
        }
        return deleted;
    }

    /**
     * Desativa um cupom
     * @param {string} code - Código do cupom
     * @returns {boolean} True se desativado com sucesso
     */
    async deactivateCoupon(code) {
        const coupon = this.getCouponByCode(code);
        if (!coupon) {
            return false;
        }

        coupon.deactivate();
        await this.saveCoupons();
        return true;
    }

    /**
     * Ativa um cupom
     * @param {string} code - Código do cupom
     * @returns {boolean} True se ativado com sucesso
     */
    async activateCoupon(code) {
        const coupon = this.getCouponByCode(code);
        if (!coupon) {
            return false;
        }

        coupon.activate();
        await this.saveCoupons();
        return true;
    }

    /**
     * Obtém cupons por tipo
     * @param {string} type - Tipo do cupom ('percentage' ou 'fixed')
     * @returns {Array<Coupon>} Cupons do tipo especificado
     */
    getCouponsByType(type) {
        return this.getAllCoupons().filter(coupon => coupon.type === type);
    }

    /**
     * Obtém cupons que expiram em breve
     * @param {number} days - Número de dias para considerar "em breve"
     * @returns {Array<Coupon>} Cupons que expiram em breve
     */
    getExpiringCoupons(days = 7) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        return this.getAllCoupons().filter(coupon => 
            coupon.expiryDate && 
            coupon.expiryDate <= futureDate && 
            coupon.isValid()
        );
    }

    /**
     * Obtém estatísticas de uso dos cupons
     * @returns {Object} Estatísticas dos cupons
     */
    getCouponStatistics() {
        const coupons = this.getAllCoupons();
        const active = coupons.filter(c => c.isValid());
        const expired = coupons.filter(c => c.expiryDate && new Date() > c.expiryDate);
        const limitReached = coupons.filter(c => c.usageLimit && c.usageCount >= c.usageLimit);

        const totalUsage = coupons.reduce((sum, c) => sum + c.usageCount, 0);
        const percentageCoupons = coupons.filter(c => c.type === 'percentage');
        const fixedCoupons = coupons.filter(c => c.type === 'fixed');

        return {
            total: coupons.length,
            active: active.length,
            expired: expired.length,
            limitReached: limitReached.length,
            totalUsage: totalUsage,
            averageUsage: coupons.length > 0 ? totalUsage / coupons.length : 0,
            byType: {
                percentage: percentageCoupons.length,
                fixed: fixedCoupons.length
            },
            mostUsed: coupons.sort((a, b) => b.usageCount - a.usageCount).slice(0, 5)
        };
    }

    /**
     * Busca cupons por termo
     * @param {string} query - Termo de busca
     * @returns {Array<Coupon>} Cupons encontrados
     */
    searchCoupons(query) {
        const searchTerm = query.toLowerCase();
        return this.getAllCoupons().filter(coupon => 
            coupon.code.toLowerCase().includes(searchTerm) ||
            coupon.description.toLowerCase().includes(searchTerm)
        );
    }
}

module.exports = DiscountService;


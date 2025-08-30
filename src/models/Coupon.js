const { v4: uuidv4 } = require('uuid');

/**
 * Classe que representa um cupom de desconto
 */
class Coupon {
    /**
     * Construtor da classe Coupon
     * @param {string} code - Código do cupom
     * @param {string} type - Tipo do desconto ('percentage' ou 'fixed')
     * @param {number} value - Valor do desconto
     * @param {number} minimumAmount - Valor mínimo para aplicar o cupom
     * @param {Date} expiryDate - Data de expiração do cupom
     * @param {number} usageLimit - Limite de uso do cupom
     * @param {string} description - Descrição do cupom
     */
    constructor(code, type, value, minimumAmount = 0, expiryDate = null, usageLimit = null, description = '') {
        this.id = uuidv4();
        this.code = code.toUpperCase();
        this.type = type; // 'percentage' ou 'fixed'
        this.value = value;
        this.minimumAmount = minimumAmount;
        this.expiryDate = expiryDate;
        this.usageLimit = usageLimit;
        this.usageCount = 0;
        this.description = description;
        this.isActive = true;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Verifica se o cupom é válido
     * @returns {boolean} True se válido
     */
    isValid() {
        // Verifica se está ativo
        if (!this.isActive) {
            return false;
        }

        // Verifica se não expirou
        if (this.expiryDate && new Date() > this.expiryDate) {
            return false;
        }

        // Verifica limite de uso
        if (this.usageLimit && this.usageCount >= this.usageLimit) {
            return false;
        }

        return true;
    }

    /**
     * Calcula o desconto para um determinado valor
     * @param {number} amount - Valor base para calcular o desconto
     * @returns {number} Valor do desconto
     */
    calculateDiscount(amount) {
        if (!this.isValid() || amount < this.minimumAmount) {
            return 0;
        }

        if (this.type === 'percentage') {
            return (amount * this.value) / 100;
        } else if (this.type === 'fixed') {
            return Math.min(this.value, amount);
        }

        return 0;
    }

    /**
     * Aplica o cupom (incrementa contador de uso)
     * @returns {boolean} True se aplicado com sucesso
     */
    apply() {
        if (!this.isValid()) {
            return false;
        }

        this.usageCount++;
        this.updatedAt = new Date();
        return true;
    }

    /**
     * Reverte a aplicação do cupom (decrementa contador de uso)
     */
    revert() {
        if (this.usageCount > 0) {
            this.usageCount--;
            this.updatedAt = new Date();
        }
    }

    /**
     * Desativa o cupom
     */
    deactivate() {
        this.isActive = false;
        this.updatedAt = new Date();
    }

    /**
     * Ativa o cupom
     */
    activate() {
        this.isActive = true;
        this.updatedAt = new Date();
    }

    /**
     * Obtém informações de status do cupom
     * @returns {Object} Status do cupom
     */
    getStatus() {
        const now = new Date();
        let status = 'active';
        let message = 'Cupom válido e ativo';

        if (!this.isActive) {
            status = 'inactive';
            message = 'Cupom desativado';
        } else if (this.expiryDate && now > this.expiryDate) {
            status = 'expired';
            message = 'Cupom expirado';
        } else if (this.usageLimit && this.usageCount >= this.usageLimit) {
            status = 'limit_reached';
            message = 'Limite de uso atingido';
        }

        return { status, message };
    }

    /**
     * Formata o cupom para exibição
     * @returns {string} Descrição formatada do cupom
     */
    getDisplayText() {
        let text = `${this.code}`;
        
        if (this.type === 'percentage') {
            text += ` - ${this.value}% de desconto`;
        } else {
            text += ` - R$ ${this.value.toFixed(2)} de desconto`;
        }

        if (this.minimumAmount > 0) {
            text += ` (mín. R$ ${this.minimumAmount.toFixed(2)})`;
        }

        return text;
    }

    /**
     * Valida os dados do cupom
     * @returns {Object} Resultado da validação
     */
    validate() {
        const errors = [];

        if (!this.code || this.code.trim().length === 0) {
            errors.push('Código do cupom é obrigatório');
        }

        if (!['percentage', 'fixed'].includes(this.type)) {
            errors.push('Tipo do cupom deve ser "percentage" ou "fixed"');
        }

        if (this.value <= 0) {
            errors.push('Valor do desconto deve ser maior que zero');
        }

        if (this.type === 'percentage' && this.value > 100) {
            errors.push('Desconto percentual não pode ser maior que 100%');
        }

        if (this.minimumAmount < 0) {
            errors.push('Valor mínimo não pode ser negativo');
        }

        if (this.usageLimit && this.usageLimit <= 0) {
            errors.push('Limite de uso deve ser maior que zero');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Converte o cupom para objeto JSON
     * @returns {Object} Representação JSON do cupom
     */
    toJSON() {
        return {
            id: this.id,
            code: this.code,
            type: this.type,
            value: this.value,
            minimumAmount: this.minimumAmount,
            expiryDate: this.expiryDate,
            usageLimit: this.usageLimit,
            usageCount: this.usageCount,
            description: this.description,
            isActive: this.isActive,
            status: this.getStatus(),
            displayText: this.getDisplayText(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Cria um cupom a partir de dados JSON
     * @param {Object} data - Dados do cupom
     * @returns {Coupon} Nova instância de Coupon
     */
    static fromJSON(data) {
        const coupon = new Coupon(
            data.code,
            data.type,
            data.value,
            data.minimumAmount,
            data.expiryDate ? new Date(data.expiryDate) : null,
            data.usageLimit,
            data.description
        );

        if (data.id) coupon.id = data.id;
        if (data.usageCount) coupon.usageCount = data.usageCount;
        if (data.isActive !== undefined) coupon.isActive = data.isActive;
        if (data.createdAt) coupon.createdAt = new Date(data.createdAt);
        if (data.updatedAt) coupon.updatedAt = new Date(data.updatedAt);

        return coupon;
    }

    /**
     * Cria cupons de exemplo para demonstração
     * @returns {Array<Coupon>} Array de cupons de exemplo
     */
    static createSampleCoupons() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        return [
            new Coupon('WELCOME10', 'percentage', 10, 50, nextWeek, 100, 'Desconto de boas-vindas'),
            new Coupon('FRETE20', 'fixed', 20, 100, nextWeek, 50, 'Desconto no frete'),
            new Coupon('MEGA50', 'percentage', 50, 200, tomorrow, 10, 'Mega desconto limitado'),
            new Coupon('SAVE15', 'fixed', 15, 0, null, null, 'Desconto fixo sem restrições')
        ];
    }
}

module.exports = Coupon;


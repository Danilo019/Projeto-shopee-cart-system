/**
 * Serviço para cálculo de frete e entrega
 */
class ShippingService {
    constructor() {
        this.shippingRates = new Map();
        this.initialize();
    }

    /**
     * Inicializa as taxas de frete por região
     */
    initialize() {
        // Simulação de taxas de frete por faixa de CEP
        this.shippingRates.set('01000-19999', { region: 'São Paulo - SP', rate: 15.90, days: 2 });
        this.shippingRates.set('20000-28999', { region: 'Rio de Janeiro - RJ', rate: 18.90, days: 3 });
        this.shippingRates.set('30000-39999', { region: 'Belo Horizonte - MG', rate: 22.90, days: 4 });
        this.shippingRates.set('40000-48999', { region: 'Salvador - BA', rate: 28.90, days: 5 });
        this.shippingRates.set('50000-56999', { region: 'Recife - PE', rate: 32.90, days: 6 });
        this.shippingRates.set('60000-63999', { region: 'Fortaleza - CE', rate: 35.90, days: 7 });
        this.shippingRates.set('70000-72999', { region: 'Brasília - DF', rate: 25.90, days: 4 });
        this.shippingRates.set('80000-87999', { region: 'Curitiba - PR', rate: 20.90, days: 3 });
        this.shippingRates.set('90000-99999', { region: 'Porto Alegre - RS', rate: 24.90, days: 4 });
        
        // Faixas adicionais para outras regiões
        this.shippingRates.set('65000-65999', { region: 'Palmas - TO', rate: 38.90, days: 8 });
        this.shippingRates.set('78000-78899', { region: 'Cuiabá - MT', rate: 42.90, days: 8 });
        this.shippingRates.set('69000-69920', { region: 'Manaus - AM', rate: 55.90, days: 10 });
        this.shippingRates.set('68000-68914', { region: 'Santarém - PA', rate: 48.90, days: 9 });
        
        // Taxa padrão para CEPs não mapeados
        this.defaultRate = { region: 'Outras localidades', rate: 35.90, days: 7 };
    }

    /**
     * Valida formato do CEP
     * @param {string} cep - CEP a ser validado
     * @returns {boolean} True se válido
     */
    validateCEP(cep) {
        if (!cep) return false;
        
        // Remove caracteres não numéricos
        const cleanCEP = cep.replace(/\D/g, '');
        
        // Verifica se tem 8 dígitos
        return cleanCEP.length === 8;
    }

    /**
     * Formata CEP para exibição
     * @param {string} cep - CEP a ser formatado
     * @returns {string} CEP formatado
     */
    formatCEP(cep) {
        const cleanCEP = cep.replace(/\D/g, '');
        if (cleanCEP.length === 8) {
            return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}`;
        }
        return cep;
    }

    /**
     * Encontra a taxa de frete para um CEP
     * @param {string} cep - CEP de destino
     * @returns {Object} Informações de frete
     */
    findShippingRate(cep) {
        const cleanCEP = cep.replace(/\D/g, '');
        const cepNumber = parseInt(cleanCEP);

        for (const [range, rateInfo] of this.shippingRates) {
            const [start, end] = range.split('-').map(c => parseInt(c.replace(/\D/g, '')));
            if (cepNumber >= start && cepNumber <= end) {
                return rateInfo;
            }
        }

        return this.defaultRate;
    }

    /**
     * Calcula frete baseado no CEP e peso
     * @param {string} cep - CEP de destino
     * @param {number} weight - Peso total em kg
     * @param {number} value - Valor total dos produtos
     * @returns {Object} Cálculo de frete
     */
    calculateShipping(cep, weight = 1, value = 0) {
        if (!this.validateCEP(cep)) {
            throw new Error('CEP inválido. Use o formato 00000-000 ou 00000000');
        }

        const rateInfo = this.findShippingRate(cep);
        let shippingCost = rateInfo.rate;

        // Ajuste por peso (taxa adicional para peso > 1kg)
        if (weight > 1) {
            const extraWeight = weight - 1;
            shippingCost += extraWeight * 3.50; // R$ 3,50 por kg adicional
        }

        // Frete grátis para compras acima de R$ 150
        const freeShippingThreshold = 150;
        const isFreeShipping = value >= freeShippingThreshold;

        if (isFreeShipping) {
            shippingCost = 0;
        }

        return {
            cep: this.formatCEP(cep),
            region: rateInfo.region,
            cost: shippingCost,
            originalCost: rateInfo.rate,
            deliveryDays: rateInfo.days,
            weight: weight,
            isFreeShipping: isFreeShipping,
            freeShippingThreshold: freeShippingThreshold,
            estimatedDelivery: this.calculateDeliveryDate(rateInfo.days)
        };
    }

    /**
     * Calcula data estimada de entrega
     * @param {number} days - Dias úteis para entrega
     * @returns {Date} Data estimada de entrega
     */
    calculateDeliveryDate(days) {
        const deliveryDate = new Date();
        let addedDays = 0;
        
        while (addedDays < days) {
            deliveryDate.setDate(deliveryDate.getDate() + 1);
            
            // Pula fins de semana (sábado = 6, domingo = 0)
            if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
                addedDays++;
            }
        }
        
        return deliveryDate;
    }

    /**
     * Obtém opções de entrega para um CEP
     * @param {string} cep - CEP de destino
     * @param {number} weight - Peso total
     * @param {number} value - Valor total
     * @returns {Array} Opções de entrega
     */
    getShippingOptions(cep, weight = 1, value = 0) {
        const standardShipping = this.calculateShipping(cep, weight, value);
        
        // Opção expressa (mais cara, mais rápida)
        const expressShipping = {
            ...standardShipping,
            type: 'express',
            cost: standardShipping.isFreeShipping ? 15.90 : standardShipping.cost + 15.90,
            deliveryDays: Math.max(1, standardShipping.deliveryDays - 2),
            estimatedDelivery: this.calculateDeliveryDate(Math.max(1, standardShipping.deliveryDays - 2))
        };

        // Opção econômica (mais barata, mais lenta)
        const economicShipping = {
            ...standardShipping,
            type: 'economic',
            cost: standardShipping.isFreeShipping ? 0 : Math.max(8.90, standardShipping.cost - 5.00),
            deliveryDays: standardShipping.deliveryDays + 3,
            estimatedDelivery: this.calculateDeliveryDate(standardShipping.deliveryDays + 3)
        };

        return [
            { ...economicShipping, name: 'Econômico' },
            { ...standardShipping, type: 'standard', name: 'Padrão' },
            { ...expressShipping, name: 'Expresso' }
        ];
    }

    /**
     * Calcula peso estimado baseado nos itens do carrinho
     * @param {Array} cartItems - Itens do carrinho
     * @returns {number} Peso total estimado em kg
     */
    calculateWeight(cartItems) {
        let totalWeight = 0;
        
        for (const item of cartItems) {
            // Peso estimado por categoria (em kg)
            const categoryWeights = {
                'Eletrônicos': 0.8,
                'Roupas': 0.3,
                'Calçados': 0.6,
                'Casa': 1.2,
                'Decoração': 0.5,
                'Eletrodomésticos': 2.5,
                'Beleza': 0.2,
                'Perfumaria': 0.3,
                'Cuidados': 0.25,
                'Livros': 0.4,
                'Papelaria': 0.1,
                'Esportes': 1.0,
                'Fitness': 0.8,
                'Acessórios': 0.2
            };
            
            const categoryWeight = categoryWeights[item.product.category] || 0.5;
            totalWeight += categoryWeight * item.quantity;
        }
        
        return Math.max(0.1, totalWeight); // Peso mínimo de 100g
    }

    /**
     * Verifica se CEP está em área de entrega
     * @param {string} cep - CEP a ser verificado
     * @returns {Object} Informações sobre disponibilidade
     */
    checkDeliveryAvailability(cep) {
        if (!this.validateCEP(cep)) {
            return {
                available: false,
                reason: 'CEP inválido'
            };
        }

        const rateInfo = this.findShippingRate(cep);
        
        // Simular algumas restrições
        const restrictedAreas = ['69000-69099']; // Exemplo: algumas áreas de Manaus
        const cleanCEP = cep.replace(/\D/g, '');
        
        for (const restricted of restrictedAreas) {
            const [start, end] = restricted.split('-').map(c => parseInt(c.replace(/\D/g, '')));
            const cepNumber = parseInt(cleanCEP);
            
            if (cepNumber >= start && cepNumber <= end) {
                return {
                    available: false,
                    reason: 'Área temporariamente sem cobertura de entrega'
                };
            }
        }

        return {
            available: true,
            region: rateInfo.region,
            estimatedDays: rateInfo.days
        };
    }

    /**
     * Obtém informações sobre frete grátis
     * @param {number} currentValue - Valor atual do carrinho
     * @returns {Object} Informações sobre frete grátis
     */
    getFreeShippingInfo(currentValue) {
        const threshold = 150;
        const remaining = Math.max(0, threshold - currentValue);
        
        return {
            threshold: threshold,
            currentValue: currentValue,
            remaining: remaining,
            qualified: currentValue >= threshold,
            percentage: Math.min(100, (currentValue / threshold) * 100)
        };
    }

    /**
     * Formata informações de entrega para exibição
     * @param {Object} shippingInfo - Informações de frete
     * @returns {Object} Informações formatadas
     */
    formatShippingInfo(shippingInfo) {
        return {
            region: shippingInfo.region,
            cost: `R$ ${shippingInfo.cost.toFixed(2)}`,
            days: `${shippingInfo.deliveryDays} dias úteis`,
            delivery: shippingInfo.estimatedDelivery.toLocaleDateString('pt-BR'),
            isFree: shippingInfo.isFreeShipping,
            type: shippingInfo.type || 'standard'
        };
    }
}

module.exports = ShippingService;


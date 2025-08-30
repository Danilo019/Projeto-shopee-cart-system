/**
 * Configurações centralizadas do sistema
 */
class Config {
    constructor() {
        this.settings = {
            // Configurações da aplicação
            app: {
                name: 'Sistema de Carrinho - Shopee Clone',
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                port: process.env.PORT || 3000
            },

            // Configurações do carrinho
            cart: {
                maxItems: 50,
                maxQuantityPerItem: 99,
                sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas em ms
                autoSaveInterval: 30 * 1000 // 30 segundos
            },

            // Configurações de frete
            shipping: {
                freeShippingThreshold: 150.00,
                defaultWeight: 0.5, // kg
                maxWeight: 30.0, // kg
                additionalWeightRate: 3.50, // R$ por kg adicional
                businessDaysOnly: true
            },

            // Configurações de cupons
            coupons: {
                maxActivePerCart: 5,
                maxUsagePerUser: 10,
                defaultExpiryDays: 30,
                minDiscountPercentage: 1,
                maxDiscountPercentage: 90,
                minFixedDiscount: 1.00,
                maxFixedDiscount: 500.00
            },

            // Configurações de produtos
            products: {
                maxNameLength: 100,
                maxDescriptionLength: 500,
                maxCategoryLength: 50,
                minPrice: 0.01,
                maxPrice: 99999.99,
                maxStock: 9999,
                maxRating: 5.0,
                minRating: 0.0
            },

            // Configurações de validação
            validation: {
                cep: {
                    pattern: /^\d{5}-?\d{3}$/,
                    invalidCEPs: ['00000000', '11111111', '22222222', '33333333', '44444444', '55555555', '66666666', '77777777', '88888888', '99999999']
                },
                phone: {
                    minLength: 10,
                    maxLength: 11
                },
                email: {
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                }
            },

            // Configurações de formatação
            formatting: {
                currency: {
                    locale: 'pt-BR',
                    currency: 'BRL',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                },
                date: {
                    locale: 'pt-BR',
                    options: {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }
                },
                datetime: {
                    locale: 'pt-BR',
                    options: {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }
                }
            },

            // Configurações de logging
            logging: {
                level: process.env.LOG_LEVEL || 'info',
                maxFileSize: 10 * 1024 * 1024, // 10MB
                maxFiles: 5,
                logRetentionDays: 30
            },

            // Configurações de performance
            performance: {
                cacheTimeout: 5 * 60 * 1000, // 5 minutos
                maxConcurrentOperations: 10,
                requestTimeout: 30 * 1000, // 30 segundos
                slowOperationThreshold: 1000 // 1 segundo
            },

            // Configurações de segurança
            security: {
                maxLoginAttempts: 5,
                lockoutDuration: 15 * 60 * 1000, // 15 minutos
                sessionSecret: process.env.SESSION_SECRET || 'shopee-cart-secret-key',
                encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key'
            },

            // Configurações de interface
            ui: {
                itemsPerPage: 10,
                maxSearchResults: 50,
                animationDuration: 100, // ms
                loadingTimeout: 5000, // ms
                colors: {
                    primary: '#ee4d2d',
                    secondary: '#f53d2d',
                    success: '#00c851',
                    warning: '#ffbb33',
                    error: '#ff4444',
                    info: '#33b5e5'
                }
            },

            // Configurações de dados
            data: {
                autoBackup: true,
                backupInterval: 60 * 60 * 1000, // 1 hora
                maxBackupFiles: 10,
                compressionEnabled: true
            }
        };
    }

    /**
     * Obtém uma configuração específica
     * @param {string} path - Caminho da configuração (ex: 'cart.maxItems')
     * @returns {any} Valor da configuração
     */
    get(path) {
        const keys = path.split('.');
        let value = this.settings;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }

        return value;
    }

    /**
     * Define uma configuração específica
     * @param {string} path - Caminho da configuração
     * @param {any} value - Novo valor
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let target = this.settings;

        for (const key of keys) {
            if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {};
            }
            target = target[key];
        }

        target[lastKey] = value;
    }

    /**
     * Verifica se uma configuração existe
     * @param {string} path - Caminho da configuração
     * @returns {boolean} True se existe
     */
    has(path) {
        return this.get(path) !== undefined;
    }

    /**
     * Obtém todas as configurações
     * @returns {Object} Todas as configurações
     */
    getAll() {
        return { ...this.settings };
    }

    /**
     * Carrega configurações de variáveis de ambiente
     */
    loadFromEnvironment() {
        // Configurações que podem ser sobrescritas por variáveis de ambiente
        const envMappings = {
            'NODE_ENV': 'app.environment',
            'PORT': 'app.port',
            'LOG_LEVEL': 'logging.level',
            'SESSION_SECRET': 'security.sessionSecret',
            'ENCRYPTION_KEY': 'security.encryptionKey',
            'FREE_SHIPPING_THRESHOLD': 'shipping.freeShippingThreshold',
            'MAX_CART_ITEMS': 'cart.maxItems',
            'CACHE_TIMEOUT': 'performance.cacheTimeout'
        };

        for (const [envVar, configPath] of Object.entries(envMappings)) {
            const envValue = process.env[envVar];
            if (envValue !== undefined) {
                // Converte string para o tipo apropriado
                let value = envValue;
                if (!isNaN(envValue)) {
                    value = Number(envValue);
                } else if (envValue.toLowerCase() === 'true') {
                    value = true;
                } else if (envValue.toLowerCase() === 'false') {
                    value = false;
                }
                
                this.set(configPath, value);
            }
        }
    }

    /**
     * Valida as configurações
     * @returns {Object} Resultado da validação
     */
    validate() {
        const errors = [];

        // Validações básicas
        if (this.get('cart.maxItems') <= 0) {
            errors.push('cart.maxItems deve ser maior que zero');
        }

        if (this.get('shipping.freeShippingThreshold') < 0) {
            errors.push('shipping.freeShippingThreshold não pode ser negativo');
        }

        if (this.get('products.minPrice') <= 0) {
            errors.push('products.minPrice deve ser maior que zero');
        }

        if (this.get('products.maxPrice') <= this.get('products.minPrice')) {
            errors.push('products.maxPrice deve ser maior que products.minPrice');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Formata valor monetário
     * @param {number} value - Valor a ser formatado
     * @returns {string} Valor formatado
     */
    formatCurrency(value) {
        const options = this.get('formatting.currency');
        return new Intl.NumberFormat(options.locale, {
            style: 'currency',
            currency: options.currency,
            minimumFractionDigits: options.minimumFractionDigits,
            maximumFractionDigits: options.maximumFractionDigits
        }).format(value);
    }

    /**
     * Formata data
     * @param {Date} date - Data a ser formatada
     * @param {boolean} includeTime - Se deve incluir horário
     * @returns {string} Data formatada
     */
    formatDate(date, includeTime = false) {
        const config = includeTime ? 
            this.get('formatting.datetime') : 
            this.get('formatting.date');
        
        return new Intl.DateTimeFormat(config.locale, config.options).format(date);
    }

    /**
     * Obtém configurações de uma seção específica
     * @param {string} section - Nome da seção
     * @returns {Object} Configurações da seção
     */
    getSection(section) {
        return this.get(section) || {};
    }

    /**
     * Reseta configurações para os valores padrão
     */
    reset() {
        this.__constructor();
    }

    /**
     * Exporta configurações para JSON
     * @returns {string} Configurações em JSON
     */
    toJSON() {
        return JSON.stringify(this.settings, null, 2);
    }

    /**
     * Importa configurações de JSON
     * @param {string} json - Configurações em JSON
     */
    fromJSON(json) {
        try {
            const parsed = JSON.parse(json);
            this.settings = { ...this.settings, ...parsed };
        } catch (error) {
            throw new Error('JSON de configuração inválido');
        }
    }
}

// Instância singleton da configuração
const config = new Config();

// Carrega configurações do ambiente na inicialização
config.loadFromEnvironment();

module.exports = config;


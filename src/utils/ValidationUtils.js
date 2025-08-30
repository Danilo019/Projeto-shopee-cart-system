/**
 * Utilitários para validação de dados
 */
class ValidationUtils {
    /**
     * Valida se um valor é um número positivo
     * @param {any} value - Valor a ser validado
     * @param {string} fieldName - Nome do campo para mensagem de erro
     * @returns {Object} Resultado da validação
     */
    static validatePositiveNumber(value, fieldName = 'Valor') {
        if (typeof value !== 'number' || isNaN(value)) {
            return {
                isValid: false,
                error: `${fieldName} deve ser um número válido`
            };
        }

        if (value <= 0) {
            return {
                isValid: false,
                error: `${fieldName} deve ser maior que zero`
            };
        }

        return { isValid: true };
    }

    /**
     * Valida se um valor é um número não negativo
     * @param {any} value - Valor a ser validado
     * @param {string} fieldName - Nome do campo para mensagem de erro
     * @returns {Object} Resultado da validação
     */
    static validateNonNegativeNumber(value, fieldName = 'Valor') {
        if (typeof value !== 'number' || isNaN(value)) {
            return {
                isValid: false,
                error: `${fieldName} deve ser um número válido`
            };
        }

        if (value < 0) {
            return {
                isValid: false,
                error: `${fieldName} não pode ser negativo`
            };
        }

        return { isValid: true };
    }

    /**
     * Valida se uma string não está vazia
     * @param {any} value - Valor a ser validado
     * @param {string} fieldName - Nome do campo para mensagem de erro
     * @param {number} minLength - Comprimento mínimo
     * @param {number} maxLength - Comprimento máximo
     * @returns {Object} Resultado da validação
     */
    static validateString(value, fieldName = 'Campo', minLength = 1, maxLength = 255) {
        if (typeof value !== 'string') {
            return {
                isValid: false,
                error: `${fieldName} deve ser um texto válido`
            };
        }

        const trimmedValue = value.trim();

        if (trimmedValue.length < minLength) {
            return {
                isValid: false,
                error: `${fieldName} deve ter pelo menos ${minLength} ${minLength === 1 ? 'caractere' : 'caracteres'}`
            };
        }

        if (trimmedValue.length > maxLength) {
            return {
                isValid: false,
                error: `${fieldName} deve ter no máximo ${maxLength} caracteres`
            };
        }

        return { isValid: true };
    }

    /**
     * Valida formato de email
     * @param {string} email - Email a ser validado
     * @returns {Object} Resultado da validação
     */
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email || typeof email !== 'string') {
            return {
                isValid: false,
                error: 'Email é obrigatório'
            };
        }

        if (!emailRegex.test(email.trim())) {
            return {
                isValid: false,
                error: 'Formato de email inválido'
            };
        }

        return { isValid: true };
    }

    /**
     * Valida formato de CEP brasileiro
     * @param {string} cep - CEP a ser validado
     * @returns {Object} Resultado da validação
     */
    static validateCEP(cep) {
        if (!cep || typeof cep !== 'string') {
            return {
                isValid: false,
                error: 'CEP é obrigatório'
            };
        }

        const cleanCEP = cep.replace(/\D/g, '');
        
        if (cleanCEP.length !== 8) {
            return {
                isValid: false,
                error: 'CEP deve ter 8 dígitos'
            };
        }

        // Verifica se não é um CEP inválido conhecido
        const invalidCEPs = ['00000000', '11111111', '22222222', '33333333', '44444444', '55555555', '66666666', '77777777', '88888888', '99999999'];
        
        if (invalidCEPs.includes(cleanCEP)) {
            return {
                isValid: false,
                error: 'CEP inválido'
            };
        }

        return { isValid: true };
    }

    /**
     * Valida formato de telefone brasileiro
     * @param {string} phone - Telefone a ser validado
     * @returns {Object} Resultado da validação
     */
    static validatePhone(phone) {
        if (!phone || typeof phone !== 'string') {
            return {
                isValid: false,
                error: 'Telefone é obrigatório'
            };
        }

        const cleanPhone = phone.replace(/\D/g, '');
        
        // Aceita telefones com 10 ou 11 dígitos (com ou sem 9 no celular)
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
            return {
                isValid: false,
                error: 'Telefone deve ter 10 ou 11 dígitos'
            };
        }

        return { isValid: true };
    }

    /**
     * Valida formato de CPF brasileiro
     * @param {string} cpf - CPF a ser validado
     * @returns {Object} Resultado da validação
     */
    static validateCPF(cpf) {
        if (!cpf || typeof cpf !== 'string') {
            return {
                isValid: false,
                error: 'CPF é obrigatório'
            };
        }

        const cleanCPF = cpf.replace(/\D/g, '');
        
        if (cleanCPF.length !== 11) {
            return {
                isValid: false,
                error: 'CPF deve ter 11 dígitos'
            };
        }

        // Verifica se não é um CPF inválido conhecido
        const invalidCPFs = [
            '00000000000', '11111111111', '22222222222', '33333333333',
            '44444444444', '55555555555', '66666666666', '77777777777',
            '88888888888', '99999999999'
        ];
        
        if (invalidCPFs.includes(cleanCPF)) {
            return {
                isValid: false,
                error: 'CPF inválido'
            };
        }

        // Validação do dígito verificador
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
        }
        
        let remainder = 11 - (sum % 11);
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanCPF.charAt(9))) {
            return {
                isValid: false,
                error: 'CPF inválido'
            };
        }

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
        }
        
        remainder = 11 - (sum % 11);
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanCPF.charAt(10))) {
            return {
                isValid: false,
                error: 'CPF inválido'
            };
        }

        return { isValid: true };
    }

    /**
     * Valida data
     * @param {Date|string} date - Data a ser validada
     * @param {boolean} allowFuture - Se permite datas futuras
     * @param {boolean} allowPast - Se permite datas passadas
     * @returns {Object} Resultado da validação
     */
    static validateDate(date, allowFuture = true, allowPast = true) {
        let dateObj;

        if (date instanceof Date) {
            dateObj = date;
        } else if (typeof date === 'string') {
            dateObj = new Date(date);
        } else {
            return {
                isValid: false,
                error: 'Data deve ser um objeto Date ou string válida'
            };
        }

        if (isNaN(dateObj.getTime())) {
            return {
                isValid: false,
                error: 'Data inválida'
            };
        }

        const now = new Date();
        
        if (!allowFuture && dateObj > now) {
            return {
                isValid: false,
                error: 'Data não pode ser no futuro'
            };
        }

        if (!allowPast && dateObj < now) {
            return {
                isValid: false,
                error: 'Data não pode ser no passado'
            };
        }

        return { isValid: true };
    }

    /**
     * Valida faixa de valores
     * @param {number} value - Valor a ser validado
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @param {string} fieldName - Nome do campo
     * @returns {Object} Resultado da validação
     */
    static validateRange(value, min, max, fieldName = 'Valor') {
        const numberValidation = this.validateNonNegativeNumber(value, fieldName);
        if (!numberValidation.isValid) {
            return numberValidation;
        }

        if (value < min || value > max) {
            return {
                isValid: false,
                error: `${fieldName} deve estar entre ${min} e ${max}`
            };
        }

        return { isValid: true };
    }

    /**
     * Valida array não vazio
     * @param {Array} array - Array a ser validado
     * @param {string} fieldName - Nome do campo
     * @param {number} minLength - Comprimento mínimo
     * @param {number} maxLength - Comprimento máximo
     * @returns {Object} Resultado da validação
     */
    static validateArray(array, fieldName = 'Lista', minLength = 1, maxLength = 1000) {
        if (!Array.isArray(array)) {
            return {
                isValid: false,
                error: `${fieldName} deve ser uma lista válida`
            };
        }

        if (array.length < minLength) {
            return {
                isValid: false,
                error: `${fieldName} deve ter pelo menos ${minLength} ${minLength === 1 ? 'item' : 'itens'}`
            };
        }

        if (array.length > maxLength) {
            return {
                isValid: false,
                error: `${fieldName} deve ter no máximo ${maxLength} itens`
            };
        }

        return { isValid: true };
    }

    /**
     * Valida objeto não nulo
     * @param {Object} obj - Objeto a ser validado
     * @param {string} fieldName - Nome do campo
     * @param {Array} requiredFields - Campos obrigatórios
     * @returns {Object} Resultado da validação
     */
    static validateObject(obj, fieldName = 'Objeto', requiredFields = []) {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
            return {
                isValid: false,
                error: `${fieldName} deve ser um objeto válido`
            };
        }

        for (const field of requiredFields) {
            if (!obj.hasOwnProperty(field) || obj[field] === null || obj[field] === undefined) {
                return {
                    isValid: false,
                    error: `Campo obrigatório '${field}' não encontrado em ${fieldName}`
                };
            }
        }

        return { isValid: true };
    }

    /**
     * Sanitiza string removendo caracteres perigosos
     * @param {string} str - String a ser sanitizada
     * @returns {string} String sanitizada
     */
    static sanitizeString(str) {
        if (typeof str !== 'string') return '';
        
        return str
            .trim()
            .replace(/[<>]/g, '') // Remove < e >
            .replace(/javascript:/gi, '') // Remove javascript:
            .replace(/on\w+=/gi, ''); // Remove eventos on*=
    }

    /**
     * Valida múltiplos campos de uma vez
     * @param {Object} data - Dados a serem validados
     * @param {Object} rules - Regras de validação
     * @returns {Object} Resultado da validação
     */
    static validateMultiple(data, rules) {
        const errors = [];

        for (const [field, rule] of Object.entries(rules)) {
            const value = data[field];
            
            if (rule.required && (value === null || value === undefined || value === '')) {
                errors.push(`${rule.label || field} é obrigatório`);
                continue;
            }

            if (value !== null && value !== undefined && value !== '') {
                if (rule.type === 'string') {
                    const validation = this.validateString(value, rule.label || field, rule.minLength, rule.maxLength);
                    if (!validation.isValid) errors.push(validation.error);
                }
                
                if (rule.type === 'number') {
                    const validation = rule.allowNegative ? 
                        this.validateNonNegativeNumber(value, rule.label || field) :
                        this.validatePositiveNumber(value, rule.label || field);
                    if (!validation.isValid) errors.push(validation.error);
                }
                
                if (rule.type === 'email') {
                    const validation = this.validateEmail(value);
                    if (!validation.isValid) errors.push(validation.error);
                }
                
                if (rule.type === 'cep') {
                    const validation = this.validateCEP(value);
                    if (!validation.isValid) errors.push(validation.error);
                }
                
                if (rule.type === 'phone') {
                    const validation = this.validatePhone(value);
                    if (!validation.isValid) errors.push(validation.error);
                }
                
                if (rule.type === 'cpf') {
                    const validation = this.validateCPF(value);
                    if (!validation.isValid) errors.push(validation.error);
                }
                
                if (rule.min !== undefined || rule.max !== undefined) {
                    const validation = this.validateRange(value, rule.min || 0, rule.max || Number.MAX_VALUE, rule.label || field);
                    if (!validation.isValid) errors.push(validation.error);
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = ValidationUtils;


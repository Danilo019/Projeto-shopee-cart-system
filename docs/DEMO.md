# Demonstração do Sistema de Carrinho de Compras

Este documento apresenta uma demonstração completa do sistema de carrinho de compras inspirado na Shopee.

## 🚀 Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar o sistema:**
   ```bash
   npm start
   ```

3. **Executar testes:**
   ```bash
   npm test
   ```

## 🎮 Funcionalidades Demonstradas

### 1. Navegação pelo Catálogo

Ao iniciar o sistema, você verá o menu principal com as seguintes opções:

- **📋 Ver Catálogo de Produtos**: Visualiza todos os produtos disponíveis
- **🔍 Buscar Produtos**: Permite buscar produtos por nome ou categoria
- **🛒 Ver Carrinho**: Exibe o conteúdo atual do carrinho

### 2. Gerenciamento do Carrinho

- **➕ Adicionar Produto ao Carrinho**: Adiciona produtos com quantidade desejada
- **✏️ Modificar Quantidade no Carrinho**: Altera quantidades de produtos já no carrinho
- **🗑️ Remover Item do Carrinho**: Remove produtos específicos do carrinho
- **🧹 Limpar Carrinho**: Remove todos os itens do carrinho

### 3. Sistema de Descontos

- **🎫 Ver Cupons Disponíveis**: Lista todos os cupons ativos
- **💳 Aplicar Cupom de Desconto**: Aplica cupons de desconto ao carrinho

### 4. Cálculo de Frete

- **🚚 Calcular Frete**: Calcula frete baseado no CEP de entrega
- Opções de entrega: Econômico, Padrão e Expresso
- Frete grátis para compras acima de R$ 150

### 5. Finalização da Compra

- **💰 Finalizar Compra**: Processa o pedido e gera resumo da compra

## 📊 Exemplo de Fluxo de Uso

### Cenário: Compra de Produtos Eletrônicos

1. **Iniciar o sistema**
   ```bash
   npm start
   ```

2. **Ver catálogo de produtos**
   - Escolha "📋 Ver Catálogo de Produtos"
   - Selecione "Eletrônicos" para filtrar por categoria
   - Visualize produtos como smartphones, fones de ouvido, etc.

3. **Adicionar produtos ao carrinho**
   - Escolha "➕ Adicionar Produto ao Carrinho"
   - Selecione "Smartphone Samsung Galaxy A54"
   - Digite quantidade: 1
   - Produto adicionado com sucesso!

4. **Adicionar mais produtos**
   - Repita o processo para "Fone de Ouvido Bluetooth JBL"
   - Quantidade: 2

5. **Ver carrinho**
   - Escolha "🛒 Ver Carrinho"
   - Visualize resumo com:
     - Produtos adicionados
     - Quantidades
     - Preços unitários e subtotais
     - Descontos aplicados
     - Total geral

6. **Aplicar cupom de desconto**
   - Escolha "🎫 Ver Cupons Disponíveis"
   - Note os cupons como "WELCOME10" (10% de desconto)
   - Escolha "💳 Aplicar Cupom de Desconto"
   - Digite: WELCOME10
   - Desconto aplicado!

7. **Calcular frete**
   - Escolha "🚚 Calcular Frete"
   - Digite CEP: 01234-567 (São Paulo)
   - Visualize opções de entrega:
     - Econômico: R$ 12,90 - 5 dias úteis
     - Padrão: R$ 15,90 - 2 dias úteis
     - Expresso: R$ 31,80 - 1 dia útil
   - Selecione uma opção

8. **Finalizar compra**
   - Escolha "💰 Finalizar Compra"
   - Confirme a compra
   - Visualize resumo do pedido com:
     - Número do pedido
     - Itens comprados
     - Valores e descontos
     - Informações de entrega

## 🛍️ Produtos de Exemplo

O sistema vem com um catálogo pré-carregado incluindo:

### Eletrônicos
- Smartphone Samsung Galaxy A54 - R$ 1.299,99 (10% OFF)
- Fone de Ouvido Bluetooth JBL - R$ 199,99 (15% OFF)
- Carregador Portátil 10000mAh - R$ 89,99
- Smart TV 43" 4K LG - R$ 1.899,99 (20% OFF)

### Roupas e Acessórios
- Camiseta Básica Algodão - R$ 39,99
- Tênis Esportivo Nike Air - R$ 299,99 (25% OFF)
- Jaqueta Jeans Feminina - R$ 129,99 (30% OFF)
- Relógio Digital Casio - R$ 159,99

### Casa e Decoração
- Conjunto de Panelas Antiaderente - R$ 249,99 (35% OFF)
- Luminária LED de Mesa - R$ 79,99
- Aspirador de Pó Portátil - R$ 189,99 (20% OFF)

## 🎫 Cupons Disponíveis

- **WELCOME10**: 10% de desconto (mín. R$ 50)
- **FRETE20**: R$ 20 de desconto no frete (mín. R$ 100)
- **MEGA50**: 50% de desconto (mín. R$ 200) - Limitado!
- **SAVE15**: R$ 15 de desconto fixo
- **PRIMEIRA10**: 10% para primeira compra

## 🚚 Regiões de Entrega

O sistema calcula frete para todo o Brasil:

- **São Paulo - SP**: R$ 15,90 - 2 dias úteis
- **Rio de Janeiro - RJ**: R$ 18,90 - 3 dias úteis
- **Belo Horizonte - MG**: R$ 22,90 - 4 dias úteis
- **Salvador - BA**: R$ 28,90 - 5 dias úteis
- **Outras localidades**: R$ 35,90 - 7 dias úteis

**Frete Grátis**: Para compras acima de R$ 150,00

## 💡 Dicas de Uso

1. **Aproveite os descontos**: Muitos produtos têm desconto automático
2. **Use cupons**: Combine descontos de produtos com cupons
3. **Frete grátis**: Adicione mais produtos para atingir R$ 150
4. **Estoque limitado**: Alguns produtos têm estoque baixo
5. **Navegação**: Use as setas do teclado para navegar nos menus

## 🔧 Funcionalidades Técnicas

### Persistência de Dados
- Produtos salvos em `src/data/products.json`
- Carrinhos salvos em `src/data/carts.json`
- Cupons salvos em `src/data/coupons.json`

### Validações
- Validação de CEP brasileiro
- Controle de estoque em tempo real
- Validação de cupons (validade, uso, valor mínimo)
- Cálculos automáticos de totais e descontos

### Interface
- Menu interativo com navegação por setas
- Tabelas formatadas para exibição de dados
- Cores e ícones para melhor experiência
- Mensagens de sucesso, erro e aviso

## 🧪 Testes Automatizados

O sistema inclui 16 testes automatizados que verificam:

- Criação e validação de produtos
- Cálculos de preços e descontos
- Operações do carrinho de compras
- Sistema de cupons
- Validações de dados
- Integração entre serviços

Execute os testes com:
```bash
npm test
```

## 📝 Logs do Sistema

O sistema gera logs automáticos em:
- `src/data/logs/app.log`: Log geral da aplicação
- `src/data/logs/error.log`: Log específico de erros

## 🎯 Próximos Passos

Para expandir o sistema, considere implementar:

1. **Autenticação de usuários**
2. **Histórico de pedidos**
3. **Sistema de avaliações**
4. **Notificações por email**
5. **API REST para integração**
6. **Interface web**
7. **Pagamento online**
8. **Rastreamento de entrega**

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique os logs em `src/data/logs/`
2. Execute os testes com `npm test`
3. Consulte a documentação no `README.md`

---

**Desenvolvido com ❤️ usando Node.js**


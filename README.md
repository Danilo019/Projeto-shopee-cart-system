# 🛒 Sistema de Carrinho de Compras - Shopee Clone

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

Um sistema de carrinho de compras robusto e interativo, inspirado na experiência da Shopee, desenvolvido em Node.js para ser executado diretamente no terminal. Este projeto simula uma jornada de compra completa, desde a navegação de produtos até a finalização do pedido, com cálculos automáticos e gerenciamento de estoque.

## ✨ Destaques do Projeto

- **Experiência de Compra Realista**: Simula um fluxo de e-commerce completo no terminal.
- **Lógica de Negócio Robusta**: Todo o gerenciamento do carrinho, produtos, descontos e frete é controlado no backend.
- **Interface Intuitiva**: Interação amigável via linha de comando com menus e tabelas formatadas.
- **Persistência de Dados**: Produtos, carrinhos e cupons são salvos em arquivos JSON para manter o estado.

## 🚀 Funcionalidades Principais

- ✅ **Catálogo de Produtos Dinâmico**: Navegue por uma vasta seleção de produtos com detalhes, preços e descontos.
- ✅ **Gerenciamento de Carrinho**: Adicione, remova e ajuste quantidades de itens no seu carrinho de forma eficiente.
- ✅ **Cálculos Automáticos**: Subtotais, descontos de produtos e totais são atualizados em tempo real.
- ✅ **Sistema de Cupons Flexível**: Aplique cupons de desconto (percentual ou fixo) com validações de uso e expiração.
- ✅ **Cálculo de Frete Inteligente**: Simulação de frete por CEP, com diferentes modalidades e frete grátis condicional.
- ✅ **Checkout Completo**: Finalize sua compra com um resumo detalhado do pedido.
- ✅ **Validações Robustas**: Garante a integridade dos dados e a consistência das operações.
- ✅ **Testes Automatizados**: Cobertura de testes para garantir a confiabilidade do sistema.

## 📁 Estrutura do Projeto

```
shopee-cart-system/
├── src/
│   ├── models/          # 📦 Definições de dados (Product, CartItem, ShoppingCart, Coupon)
│   ├── services/        # ⚙️ Lógica de negócio e manipulação de dados (ProductService, CartService, DiscountService, ShippingService)
│   ├── controllers/     # 🕹️ Gerenciamento da interação com o usuário (AppController)
│   ├── utils/           # 🛠️ Utilitários gerais (DisplayUtils, ValidationUtils, Logger, Config)
│   ├── data/           # 💾 Armazenamento persistente de dados (JSON)
│   └── app.js          # 🚀 Ponto de entrada principal da aplicação
├── tests/              # 🧪 Testes unitários e de integração
├── docs/               # 📄 Documentação adicional e demonstrações
├── package.json        # 📋 Metadados do projeto e dependências
└── README.md          # 📖 Este arquivo
```

## 🛠️ Instalação

Para configurar e executar o projeto em sua máquina, siga os passos abaixo:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/shopee-cart-system.git # Substitua pelo seu repositório
   cd shopee-cart-system
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

## 🎮 Como Usar

Após a instalação, você pode iniciar o sistema com o seguinte comando:

```bash
npm start
```

Isso abrirá o menu interativo no terminal, onde você poderá navegar pelas opções usando as setas do teclado e `Enter`.

### Exemplo de Interação:

```bash
🛒 Sistema de Carrinho de Compras - Shopee Clone

? O que você gostaria de fazer?
❯ Ver Catálogo de Produtos
  Adicionar Produto ao Carrinho
  Ver Carrinho
  Modificar Quantidade
  Remover Item do Carrinho
  Aplicar Cupom de Desconto
  Calcular Frete
  Finalizar Compra
  Sair

Produtos no carrinho: 3 itens
Total: R$ 299,90
```

## 🧪 Testes Automatizados

Para garantir a qualidade e o funcionamento correto de todas as funcionalidades, o projeto inclui um conjunto de testes automatizados. Você pode executá-los com:

```bash
npm test
```

## 📝 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE). Sinta-se à vontade para usar, modificar e distribuir.

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Se você tiver sugestões, encontrar bugs ou quiser adicionar novas funcionalidades, por favor, abra uma `issue` ou envie um `pull request`.

## 👨‍💻 Desenvolvido por

✨ **Danilo Silva**

---

_Feito com paixão e código!_ ❤️



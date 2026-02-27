Para realizar este desafio técnico, pedimos que você utilize uma conta AWS nova e dedicada apenas ao processo seletivo, para evitar qualquer risco de cobrança inesperada.
1. Criação de conta AWS (gratuita)
	Acesse: https://aws.amazon.com/free
	Crie uma nova conta AWS usando um e-mail que você possa descartar após o processo (ex.: seu_nome+vaga-minhaempresa@gmail.com).
	Essa conta terá acesso ao AWS Free Tier, que inclui cotas gratuitas mensais para serviços como Lambda, API Gateway, DynamoDB, S3 e outros usados neste desafio (desde que dentro dos limites do Free Tier).
2. Configuração de alarme de cobrança
	Após criar a conta, acesse o console AWS e vá em Billing > Billing preferences / Budgets.
	Crie um Budget/Alarme de custo com valor baixo (ex.: 5 USD) e configure para enviar e-mail para você se houver qualquer cobrança.
	Assim, se algo sair do esperado, você será notificado rapidamente e poderá remover os recursos.
3. Uso da conta apenas para o desafio
	Use essa conta exclusivamente para os recursos do desafio (Lambda, API Gateway, DynamoDB, S3, Cognito etc.).
	Não utilize essa conta para workloads pessoais ou de produção.
4. Encerramento ao final
	Ao concluir o desafio e nos enviar seu código, por favor: 
o	Delete os stacks/recursos criados (funções Lambda, tabelas DynamoDB, buckets S3, APIs, usuários Cognito etc.).
o	Opcionalmente, feche a conta ou deixe-a sem nenhum recurso ativo, apenas para garantir que não haja consumo futuro.
Importante
	A responsabilidade pelos custos gerados na conta é do próprio candidato.
	O desafio foi desenhado para rodar dentro do Free Tier, desde que: 
o	Você utilize apenas os recursos necessários,
o	Não gere tráfego excessivo ou testes de carga,
o	E remova os recursos ao final.


Desafio Técnico: Serverless Order Processor
O Cenário
A empresa precisa de um microsserviço para registrar pedidos de compra. O sistema deve receber um pedido via API, salvá-lo em um banco de dados e disparar um processo assíncrono para "processamento de pagamento" (simulado).
Requisitos Técnicos
Você deve utilizar o Serverless Framework para provisionar:
1.	API Gateway: Um endpoint POST /orders para criação de pedidos.
2.	Lambda "CreateOrder": Valida o payload e salva no DynamoDB.
3.	DynamoDB: Tabela para armazenar os pedidos (Status: PENDING, PROCESSED).
4.	Mensageria (SQS ou DynamoDB Streams): Ao inserir o pedido, um processo assíncrono deve ser disparado.
5.	Lambda "ProcessPayment": Consome a mensagem/evento, aguarda 2 segundos (simulando integração externa) e atualiza o status do pedido para PROCESSED no DynamoDB.
6.	Trace completo do pedido.
7.	Testes unitários e de integração.

Entregáveis esperados
1.	Código-fonte em um repositório Git.
2.	Arquivo serverless.yml completo (capaz de fazer o deploy com um único comando).
3.	Arquivo README.md explicando:
o	Como rodar o projeto localmente (ex: Serverless Offline).
o	Decisões arquiteturais tomadas.
o	Como testar o endpoint (ex: comando cURL ou arquivo do Insomnia/Postman).





Boa sorte!

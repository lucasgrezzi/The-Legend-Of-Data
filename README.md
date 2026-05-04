# DataQuest: A Guilda dos Arquivistas

Uma plataforma educacional gamificada estilo RPG de 8/16-bits voltada para o ensino de **Python, SQL, Manipulação de Dados e Data Visualization**. Inspirada no conceito do Codédex, o DataQuest transforma a jornada de aprendizado em Ciência de Dados em uma grande aventura de exploração e análise de relíquias de dados.

---

## 1. Visão Geral & Conceito

### O Problema
A maioria das plataformas de Ciência de Dados e Engenharia de Dados utiliza interfaces corporativas monótonas ou notebooks tradicionais (como Jupyter), o que pode tornar a curva de aprendizado inicial cansativa e desmotivadora.

### A Solução
O **DataQuest** une o ensino técnico a uma narrativa de RPG medieval/fantasia. O aluno assume o papel de um **Arquivista**, explorando ruínas do passado para decodificar registros, consultar depósitos de dados antigos e desenhar mapas visuais.

---

## 2. Pilares da Narrativa (A Jornada do Arquivista)

* **Python (A Linguagem dos Antigos):** O domínio da sintaxe e lógica para destravar mecanismos e portões trancados.
* **SQL (As Catacumbas de Dados):** A habilidade de minerar, filtrar e extrair relíquias valiosas de depósitos gigantescos.
* **Pandas (A Forja de Dados):** Onde os fragmentos de dados brutos são limpos, lapidados e transformados em informação útil.
* **Data Viz (O Farol da Verdade):** A criação de gráficos para iluminar os padrões e comunicar as descobertas para o restante do reino.

---

## 3. Arquitetura e Telas Principais

A interface é dividida no formato clássico de **duas colunas principais** para manter o foco na teoria e na prática simultaneamente.

### A. Tela de Missão (A IDE Gamificada)
* **Coluna da Esquerda (Narrativa & Teoria):**
    * Exibição do título do capítulo e da missão em fonte pixelada (ex: *Press Start 2P*).
    * Teoria curta e direta sobre o conceito de dados.
    * Instruções exatas da missão com ícones temáticos.
    * Visualização rápida do arquivo de dados disponível para a missão (ex: `vendas.csv`, `ruinas.db`).
* **Coluna da Esquerda (Rodapé):**
    * Barra de XP ganho e nível atual do jogador.
    * Botão de navegação ("Voltar" e "Próximo" bloqueado até a validação).
* **Coluna da Direita (Editor de Código & Sandbox):**
    * Abas dinâmicas: `script.py` ou `query.sql`.
    * Botões de ação rápida: `Copiar`, `Limpar`, `Executar Código` (Run).
* **Coluna da Direita (Terminal / Visualizador de Resultados):**
    * Exibe o output de texto (Terminal do Python).
    * Exibe uma prévia da tabela resultante da query SQL ou do DataFrame filtrado.
    * **Diferencial de Data Viz:** Renderiza o gráfico gerado (Matplotlib/Seaborn) diretamente em um painel popup ou aba de imagem.

### B. O Mapa do Mundo (Seletor de Fases)
* Visualização geográfica das fases desbloqueadas e bloqueadas.
* Progresso geral do usuário em cada "Bioma" (Python, SQL, Viz).

---

## 4. Estrutura Tecnológica Sugerida (Stack do MVP)

### Front-end & Interface
* **Framework:** React ou Next.js (facilidade de gerenciamento de estado e rotas).
* **Estilização:** Tailwind CSS combinado com fontes e bordas em estilo pixel art (ex: NES.css).
* **Ícones e Imagens:** Sprites de 8-bits/16-bits para os personagens ("Arquivistas", "Bugs", "Monstros de Dados").

### Execução de Código no Navegador (Client-side Sandbox)
Para garantir segurança e performance sem custos elevados de servidor:
* **Python & Pandas:** Utilizar o **Pyodide** (Python rodando via WebAssembly diretamente no navegador). Permite importar o Pandas e rodar scripts Python localmente.
* **SQL:** Utilizar o **DuckDB-Wasm** ou **SQLite em WebAssembly**. O banco de dados é carregado na memória do navegador do aluno para que ele execute as queries sem latência de rede.
* **Data Viz:** O Pyodide suporta renderização do **Matplotlib**, convertendo os gráficos para imagens base64 que o React exibe na aba de resultados.

---

## 5. Sistema de Gamificação & Progressão

### Como o XP é adquirido:
* **Completar uma missão teórica/básica:** +10 XP.
* **Exercício Prático Concluído (Código correto):** +20 XP.
* **Query SQL Complexa (Agregações/Filtros múltiplos):** +25 XP.
* **Visualização Clara de Dados (Data Viz Correta):** +30 XP.

### Regras de Desbloqueio:
1.  O aluno inicia no **Nível 1 (Aprendiz)**.
2.  A trilha de **SQL** só é liberada após a conclusão do módulo inicial de **Python Básico**.
3.  O módulo de **Data Visualization** só é liberado após o aluno ter acumulado pelo menos **150 XP** e concluído as missões de **Pandas**.
4.  O botão de "Próximo" nas missões só fica ativo após a validação bem-sucedida do código digitado pelo usuário.

---

## 6. Próximos Passos para o Desenvolvimento

1.  **Design das Telas:** Criar os wireframes do mapa de seleção e do editor de código em ferramentas como o Figma.
2.  **Desenvolvimento do MVP:**
    * Configurar a infraestrutura do Pyodide e DuckDB no front-end.
    * Testar a execução de uma linha de comando em Python e uma query SQL.
3.  **Criação de Conteúdo:** Escrever as primeiras 5 missões de teste (1 de introdução, 2 de Python, 1 de SQL e 1 de Pandas).
4.  **Testes de Usuário:** Validar a experiência da gamificação com estudantes e profissionais da área.

flowchart TB
    subgraph Inicializacao
        direction TB
        A[Inicio: Usuario aciona "Atualizar Arquivos"]
        B[Buscar emails na caixa Orange via Power Automate]
        C[Encontrar emails com anexos relevantes]
        D[Mover anexos para pasta ENTRADA]
        E[Organizar arquivos: Identifica tipo, renomeia e classifica]
        F[Verificar sucesso da organizacao]
        
        A --> B --> C --> D --> E --> F
    end
    
    G1[Mover para pastas especificas: R189, QPE, SPB, NFSERV]
    G2[Mover para site Contratos]
    
    F -- Sucesso --> G1
    F -- Sucesso --> G2
    F -- Falha --> K
    
    subgraph Extracao
        direction TB
        H1[Extrair R189: r189_extractor.py]
        H2[Extrair NF_SERV: qpe_extractor.py]
        H3[Extrair NF_SPB: spb_extractor.py]
        H4[Extrair Faturas: nfserv_extractor.py]
        H5[Extrair SRV_CODE: municipality_code_extractor.py]
    end
    
    G1 --> Extracao
    
    %% Adicionando espaço entre Extração e Consolidações
    subgraph EspacoEntreExtracaoConsolidacoes
        direction TB
        Space1[" "]
        style Space1 fill:none,stroke:none
    end
    
    Extracao --> EspacoEntreExtracaoConsolidacoes
    
    subgraph ConsolidacoesSecundarias
        direction TB
        C2[Consolidar Dados NF_QPE]
        C3[Consolidar Dados NF_SPB]
        C4[Consolidar Dados Faturas/NFSERV]
        C5[Consolidar Dados SRV_CODE]
    end
    
    subgraph ConsolidacaoPrincipal
        C1[Consolidar Dados R189]
    end
    
    EspacoEntreExtracaoConsolidacoes --> ConsolidacoesSecundarias
    EspacoEntreExtracaoConsolidacoes --> ConsolidacaoPrincipal
    
    H1 --> C1
    H2 --> C2
    H3 --> C3
    H4 --> C4
    H5 --> C5
    
    %% Adicionando espaço entre Consolidações e Validações
    subgraph EspacoEntreConsolidacoesValidacoes
        direction TB
        Space2[" "]
        style Space2 fill:none,stroke:none
    end
    
    ConsolidacoesSecundarias --> EspacoEntreConsolidacoesValidacoes
    ConsolidacaoPrincipal --> EspacoEntreConsolidacoesValidacoes
    
    subgraph Validacoes
        direction TB
        J1[Validar R189: Consistencia interna]
        J2[Validar SRV_CODE vs R189 Simples]
        J3[Validar SRV_CODE vs R189: CNPJs autorizados]
        J4[Validar NF_QPE vs R189: QPEs REN]
        J5[Validar NF_SPB vs R189: SPBs SRV]
        J6[Validar FATURAS vs R189: QPEs/SPBs vs NFSERV]
    end
    
    EspacoEntreConsolidacoesValidacoes --> Validacoes
    
    C1 --> J1
    C1 --> J2
    C5 --> J2
    C1 --> J3
    C5 --> J3
    C1 --> J4
    C2 --> J4
    C1 --> J5
    C3 --> J5
    C1 --> J6
    C4 --> J6
    
    L[Consolidar Relatorio: Reune divergencias]
    K[Fim: Apresenta resultados]
    
    Validacoes --> L
    L --> K
    G2 --> K

**Legenda:**  
- Verificação de Email: Via **Power Automate** (URL: prod-56.westus.logic.azure.com)
- "Base de Dados" = Pastas específicas `/R189`, `/QPE`, `/SPB`, `/NFSERV`
- "Arquivo Contratos" = `/teams/BR-TI-TIN/contratos/`

## Detalhamento das Etapas

### Extração e Processamento Inicial

#### Aba R189 (`r189_extractor.py`)
- Processa arquivos R189 no formato `.xlsb` da aba 'BRASIL'
- Extrai colunas específicas: 'CNPJ - WEG', 'Invoice number', 'Site Name - WEG 2', 'Total Geral'/'Grand Total', 'Account number', 'Invoice Type'
- Aceita variações do nome da coluna de total ('Total Geral' ou 'Grand Total')
- Preenche valores vazios usando a técnica de forward fill (ffill) para garantir consistência
- Remove linhas onde Account number contém a string 'Total' para evitar duplicação
- Agrupa os dados por CNPJ, Invoice number, Site Name e Invoice Type, somando os valores totais
- Gera um arquivo consolidado em formato Excel para uso nas validações posteriores

#### Aba NF_SERV (`qpe_extractor.py`)
- Processa arquivos QPE (Quadro de Pessoal)
- Extrai informações como CNPJ, QPE_ID, NOTA_FISCAL e valores totais
- Identifica registros com tipo 'REN' (Renovação) que devem ser validados contra NFSERV
- Agrupa dados por identificadores relevantes para garantir valores únicos
- Consolida as informações em um arquivo Excel para comparações futuras

#### Aba NF_SPB (`spb_extractor.py`)
- Processa arquivos SPB (Sistema de Pagamentos Brasileiro)
- Extrai dados como SPB_ID, CNPJ, Num_Nota e valores totais
- Identifica registros com tipo 'SRV' (Serviço) que devem ser validados de forma específica
- Registros sem tipo 'SRV' devem ser validados contra NFSERV
- Consolida as informações para uso nas validações cruzadas

#### Aba Faturas (`nfserv_extractor.py`)
- Processa arquivos de Notas Fiscais de Serviço (NFSERV)
- Extrai dados como NFSERV_ID, CNPJ, VALOR_TOTAL
- Identifica a origem do documento (QPE ou SPB) através do prefixo do ID
- Consolida as informações para validação cruzada com R189

#### Aba SRV_CODE (`municipality_code_extractor.py`)
- Processa arquivos com códigos de serviço por município
- Extrai colunas: 'CNPJ - WEG', 'Invoice number', 'Municipality Code', 'Invoice Type', 'Site Name - WEG 2', 'Total Geral'/'Grand Total'
- Aceita variações do nome da coluna de total ('Total Geral' ou 'Grand Total')
- Filtra apenas registros com 'Invoice Type' = 'SRV'
- Valida se os CNPJs estão autorizados para os códigos de serviço específicos
- Consolida as informações para uso nas validações

### Validações e Relatórios
- **Divergências R189**: Analisa inconsistências internas, campos obrigatórios, formatos de CNPJ e valores, duplicações de Invoice number.
- **SRV_CODE vs R189 (Simples)**: Verificação básica de códigos de município presentes no R189, sem validação detalhada.
- **SRV_CODE vs R189**: Verifica CNPJs autorizados para códigos de serviço específicos (14.02, 17.01, 14.01, etc.), com mapeamentos predefinidos.
- **NF_QPE vs R189**: Compara QPEs tipo 'REN' entre as fontes, valida CNPJs e valores totais, identifica registros ausentes.
- **NF_SPB vs R189**: Compara SPBs tipo 'SRV' entre as fontes, verifica consistência de dados e identifica registros ausentes.
- **Faturas vs R189**: Compara QPEs 'REN' e SPBs não-'SRV' com NFSERV, valida presença em ambas fontes, CNPJs e valores.
- **Relatório Consolidado**: Reúne todos os relatórios de divergência, organiza por tipo e gravidade, gera estatísticas.

### Organização de Arquivos
- Monitora pasta `ENTRADA` para novos arquivos
- Identifica tipo de arquivo (PDF, XLSB) baseado em conteúdo e nome
- Renomeia seguindo regras específicas (prefixos QPE-, SPB-, R189-)
- Move para pastas correspondentes (/R189, /QPE, /SPB, /NFSERV)
- Registra operações para auditoria

### Verificação de Email Orange
- Serviço externo (Power Automate) verifica chegada de emails específicos
- Aciona backend para download de anexos quando há notificações
- Disponibiliza endpoints para verificação e validação

---

> Este fluxograma representa o fluxo completo e atualizado do sistema de automação financeira, incluindo as regras de negócio mais relevantes para cada etapa.

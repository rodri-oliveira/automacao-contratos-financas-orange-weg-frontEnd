'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Button, Paper, Tabs, Tab, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, FormControlLabel, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, AppBar, Toolbar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';

// URL da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AutomacaoFinancas() {
  // Estados básicos
  const [activeTab, setActiveTab] = useState('R189');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fileListKey, setFileListKey] = useState(0);
  
  // Novo estado para controlar o tipo de processamento atual
  const [processingType, setProcessingType] = useState("");
  
  // Adicione estes estados para controlar o processo de atualização
  const [updateProcessRunning, setUpdateProcessRunning] = useState(false);
  const [updateStatusMessage, setUpdateStatusMessage] = useState("");
  
  // Estado para controlar quais abas estão habilitadas
  const [enabledTabs, setEnabledTabs] = useState({
    R189: true, QPE: false, SPB: false, NFSERV: false, MUN_CODE: false
  });
  
  // Estado para controlar o status de cada etapa
  const [status, setStatus] = useState({
    R189: 'Aguardando processamento',
    QPE: 'Aguardando processamento',
    SPB: 'Aguardando processamento',
    NFSERV: 'Aguardando processamento',
    MUN_CODE: 'Aguardando processamento'
  });
  
  // Estado para controlar se os botões de validação estão habilitados
  const [validationEnabled, setValidationEnabled] = useState(false);
  
  // Adicione um novo estado específico para o carregamento do botão Atualizar Arquivos
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Lista de empresas disponíveis
  const companies = [
    { id: 'orange', name: 'Orange', color: '#00579d' },
    { id: 'future1', name: 'Empresa Futura 1', color: '#00579d' },
    { id: 'future2', name: 'Empresa Futura 2', color: '#00579d' },
  ];
  
  // Função para selecionar empresa
  const handleCompanySelect = (companyId) => {
    if (selectedCompany === companyId) return;
    
    if (companyId !== 'orange' && companyId !== null) {
      window.alert('Esta empresa será implementada em breve.');
      return;
    }
    
    setSelectedCompany(companyId);
    
    if (companyId === null) {
      handleResetProcess();
    }
  };

  // Funções para o modal de confirmação
  const handleBackButtonClick = () => setShowConfirmModal(true);
  const confirmBackToDashboard = () => {
    setSelectedCompany(null);
    handleResetProcess();
    setShowConfirmModal(false);
  };
  const cancelBackToDashboard = () => setShowConfirmModal(false);
  
  // Função para mudar de aba
  const handleTabChange = (tab) => {
    if (enabledTabs[tab]) {
      setFiles([]);
      setSelectedFiles([]);
      setError(null);
      setActiveTab(tab);
      setFileListKey(prevKey => prevKey + 1);
    }
  };

  // Função para buscar arquivos
  const handleSearchFiles = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/backend/arquivos/${activeTab}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            if (data.arquivos) {
                setFiles(data.arquivos);
            } else {
                throw new Error(data.detail || 'Erro desconhecido');
            }
        } else {
            throw new Error(data.detail || 'Erro na requisição');
        }
    } catch (error) {
        setError(`Erro ao buscar arquivos: ${error.message}`);
        setFiles([]);
    } finally {
        setLoading(false);
    }
  }, [activeTab]);

  // Função para processar arquivos
  const handleProcessFiles = async () => {
        if (selectedFiles.length === 0) {
            setError("Por favor, selecione pelo menos um arquivo para processar.");
            return;
        }

    try {
        setLoading(true);
      
      // Determinar endpoint e próxima aba
      let endpoint, nextTab;
        switch(activeTab) {
        case 'QPE': endpoint = `${API_URL}/backend/qpe/process`; nextTab = 'SPB'; break;
        case 'SPB': endpoint = `${API_URL}/backend/spb/process`; nextTab = 'NFSERV'; break;
        case 'NFSERV': endpoint = `${API_URL}/backend/nfserv/process`; nextTab = 'MUN_CODE'; break;
        case 'MUN_CODE': endpoint = `${API_URL}/backend/mun_code/process`; nextTab = 'R189'; break;
        default: endpoint = `${API_URL}/backend/processar/r189`; nextTab = 'QPE';
      }

        const response = await fetch(endpoint, {
            method: 'POST',
        headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedFiles)
        });

        const data = await response.json();
        
        if (data.success) {
            setStatus(prevStatus => ({
                ...prevStatus,
                [activeTab]: 'Processamento concluído'
            }));
            
            setFiles([]);
            setSelectedFiles([]);
            setFileListKey(prevKey => prevKey + 1);
            
            if (activeTab === 'MUN_CODE') {
                setValidationEnabled(true);
          setActiveTab('R189');
            } else {
                setEnabledTabs(prevState => ({
                    ...prevState,
                    [nextTab]: true
                }));
                setActiveTab(nextTab);
            }
            
            alert('Arquivos processados com sucesso!');
        } else {
            throw new Error(data.error || 'Erro no processamento');
        }
    } catch (error) {
        setStatus(prevStatus => ({
            ...prevStatus,
            [activeTab]: 'Erro no processamento'
        }));
        setError(`Erro ao processar arquivos: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };

  // Função para resetar o processo
  const handleResetProcess = () => {
    try {
      // Resetar estados básicos de arquivos e seleção
      setFiles([]);
      setSelectedFiles([]);
      setError(null);
      
      // Resetar o status das abas
      setStatus({
        R189: 'Aguardando processamento',
        QPE: 'Aguardando processamento',
        SPB: 'Aguardando processamento',
        NFSERV: 'Aguardando processamento',
        MUN_CODE: 'Aguardando processamento'
      });
      
      // Resetar abas habilitadas
      setEnabledTabs({
        R189: true, QPE: false, SPB: false, NFSERV: false, MUN_CODE: false
      });
      
      // Resetar validação e aba ativa
      setValidationEnabled(false);
      setActiveTab('R189');
      setFileListKey(prevKey => prevKey + 1);
      
      // Se houver estados adicionais que foram adicionados e precisam ser resetados
      if (typeof setOperationInProgress === 'function') {
        setOperationInProgress(null);
      }
      
      console.log("Processo resetado com sucesso!");
    } catch (error) {
      console.error("Erro ao resetar processo:", error);
    }
  };

  // Funções para seleção de arquivos
  const handleFileSelection = (fileName) => {
    if (selectedFiles.includes(fileName)) {
      setSelectedFiles(selectedFiles.filter((file) => file !== fileName));
    } else {
      setSelectedFiles([...selectedFiles, fileName]);
    }
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
        setSelectedFiles([]);
    } else {
        const allFileNames = files.map(file => file.nome);
        setSelectedFiles(allFileNames);
    }
  };

  // Funções de validação (simplificadas para economizar espaço)
  const handleValidation = async (type) => {
    try {
      setLoading(true);
      setError(null);
      
      // Define o tipo de processamento para mostrar a mensagem correta
      setProcessingType(type === 'consolidate_reports' ? 'consolidation' : 'validation');
      
      const endpoint = `${API_URL}/backend/validations/${type}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message || 'Validação concluída com sucesso!');
      } else {
        throw new Error(data.error || 'Erro na validação');
      }
    } catch (error) {
      setError(`Erro na validação: ${error.message}`);
      alert(`Erro na validação: ${error.message}`);
    } finally {
      setLoading(false);
      setProcessingType(""); // Limpa o tipo de processamento ao finalizar
    }
  };

  // Função para iniciar ou cancelar o processo de atualização (ATUALIZADA)
  const handleUpdateFiles = async () => {
    if (updateProcessRunning) {
      // Se o processo está em andamento, tenta cancelá-lo
      await cancelUpdateProcess();
    } else {
      // Se não há processo em andamento, inicia um
      if (window.confirm('Iniciar o processo completo de atualização (inclui renomear, organizar e copiar para repositório)?')) {
        await startUpdateProcess();
      }
    }
  };
  
  // Inicia o processo de atualização (COM LÓGICA DE RETENTATIVA REAL NA ETAPA 1)
  const startUpdateProcess = async () => {
    // Contador local para retentativas da Etapa 1
    let etapa1RetryCount = 0;
    const MAX_ETAPA1_RETRIES = 3;
    let etapa1Success = false; // Flag para saber se a etapa 1 foi concluída com sucesso
    let finalRenameResult = null; // Para guardar o resultado final da Etapa 1 bem-sucedida

    try {
      // Configurar estados iniciais
      setUpdateProcessRunning(true);
      setLoading(true);
      setProcessingType("update");
      setUpdateStatusMessage("Iniciando processo de atualização...");

      // ETAPA 0: Resetar (limpar pastas intermediárias)
      console.log("ETAPA 0: Resetando processo...");
      setUpdateStatusMessage("ETAPA 0: Limpando pastas...");
      try {
      const resetResponse = await fetch(`${API_URL}/backend/files/reset-process`, {
        method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });
      if (!resetResponse.ok) {
              console.warn(`Aviso: Falha ao chamar /reset-process (Status: ${resetResponse.status}). Continuando...`);
      } else {
        const resetResult = await resetResponse.json();
              if (!resetResult.success) console.warn(`Aviso: Reset não foi bem sucedido (${resetResult.message || 'sem detalhes'}). Continuando...`);
              else console.log("ETAPA 0: Reset concluído.");
          }
      } catch (resetError) {
           console.error("Erro na ETAPA 0 (Reset):", resetError);
           // Decide se quer parar ou continuar mesmo se o reset falhar
           // Continuar pode ser aceitável se o reset não for sempre necessário
           // throw new Error("Falha crítica ao resetar o processo."); // Descomente para parar
      }


      // --- INÍCIO DO LOOP DE RETENTATIVA PARA ETAPA 1 ---
      while (etapa1RetryCount < MAX_ETAPA1_RETRIES && !etapa1Success) {
        const currentAttempt = etapa1RetryCount + 1;
        console.log(`ETAPA 1: Iniciando tentativa ${currentAttempt}/${MAX_ETAPA1_RETRIES}...`);
        setUpdateStatusMessage(`ETAPA 1 (Tentativa ${currentAttempt}/${MAX_ETAPA1_RETRIES}): Renomeando e organizando...`);

        try {
          // 1. Executar Rename/Clean
      const renameResponse = await fetch(`${API_URL}/backend/files/rename-clean`, {
        method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });

      if (!renameResponse.ok) {
            throw new Error(`Erro HTTP na ETAPA 1 (Tentativa ${currentAttempt}): ${renameResponse.status}`);
      }

      const renameResult = await renameResponse.json();
          finalRenameResult = renameResult; // Guarda o último resultado (pode ser sobrescrito)

      if (!renameResult.success) {
        if (renameResult.cancelled) {
              setUpdateStatusMessage(`Processo cancelado durante ETAPA 1 (Tentativa ${currentAttempt})`);
          resetUpdateButton();
              return; // Sai da função inteira
            }
            throw new Error(`Erro na ETAPA 1 (Tentativa ${currentAttempt}): ${renameResult.message || 'Falha desconhecida'}`);
          }
          console.log(`ETAPA 1 (Tentativa ${currentAttempt}) - Rename/Clean executado.`);

          // 2. Verificar Pasta ENTRADA com o novo endpoint (COM URL CORRIGIDA E HEADERS DE CACHE)
          console.log(`ETAPA 1 (Tentativa ${currentAttempt}): Verificando pasta ENTRADA...`);
          setUpdateStatusMessage(`ETAPA 1 (Tentativa ${currentAttempt}): Verificando arquivos restantes...`);
          
          const checkEndpointUrl = `${API_URL}/backend/files/check-entrada`;
          console.log("Chamando endpoint de verificação:", checkEndpointUrl); 
          
          const checkResponse = await fetch(checkEndpointUrl, {
              method: 'GET',
              headers: {
                  'Accept': 'application/json',
                  // Adicionar headers para prevenir cache
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache',
                  'Expires': '0'
              }
          });

          if (!checkResponse.ok) {
              console.error(`Falha ao verificar pasta ENTRADA. URL: ${checkEndpointUrl}, Status: ${checkResponse.status}`);
              throw new Error(`Erro HTTP ao verificar pasta ENTRADA (Status: ${checkResponse.status})`);
          }

          const checkResult = await checkResponse.json();
          console.log("Resultado da verificação:", checkResult);

          if (!checkResult.success) {
              throw new Error(`Erro retornado pela API ao verificar pasta ENTRADA: ${checkResult.message || 'Falha desconhecida'}`);
          }

          // --- Lógica de Retentativa Baseada no /check-entrada ---
          if (checkResult.total_files === 0 || (checkResult.files && checkResult.files.length === 0)) {
            console.log(`ETAPA 1 (Tentativa ${currentAttempt}) bem-sucedida. Pasta ENTRADA está vazia.`);
            etapa1Success = true; // Marca sucesso para sair do loop
          } else {
            // Arquivos permaneceram
            const remainingCount = checkResult.total_files || checkResult.files?.length || 'N/A';
            console.warn(`Arquivos restantes na pasta ENTRADA: ${remainingCount}`);
            etapa1RetryCount++; // Incrementa contador ANTES de perguntar

            if (etapa1RetryCount < MAX_ETAPA1_RETRIES) {
              const userWantsRetry = window.confirm(
                `ETAPA 1 (Tentativa ${currentAttempt}) concluída, mas ${remainingCount} arquivo(s) permaneceram na pasta ENTRADA.\n\nTodos os arquivos precisam ser processados.\n\nDeseja tentar novamente (${etapa1RetryCount + 1}/${MAX_ETAPA1_RETRIES})?`
              );
              if (!userWantsRetry) {
                throw new Error(`Processo interrompido pelo usuário. ${remainingCount} arquivo(s) não processados na ETAPA 1.`);
              }
              // Se userWantsRetry for true, o loop continua
            } else {
              // Atingiu o máximo de retentativas
              throw new Error(`ETAPA 1 falhou após ${MAX_ETAPA1_RETRIES} tentativas. ${remainingCount} arquivo(s) ainda permanecem na pasta ENTRADA. Verifique os logs do backend ou os arquivos manualmente.`);
            }
          }

        } catch (innerError) {
          // Erro durante uma tentativa específica da ETAPA 1 (seja no rename ou no check)
          console.error(`Erro na Tentativa ${currentAttempt} da ETAPA 1:`, innerError);
          // Parar direto em caso de erro na tentativa.
          throw innerError; // Re-lança o erro para ser pego pelo catch externo
        }
      } // --- FIM DO LOOP DE RETENTATIVA PARA ETAPA 1 ---

      // Se saiu do loop sem sucesso (ex: usuário cancelou retentativa ou erro)
      if (!etapa1Success) {
         console.log("ETAPA 1 não concluída com sucesso após retentativas.");
         // A mensagem de erro já foi setada ou será pega pelo catch externo.
         resetUpdateButton(); // Garante reset do botão
         return; // Interrompe a função startUpdateProcess
      }

      // --- Prosseguir para ETAPA 2 apenas se ETAPA 1 foi bem-sucedida ---
      console.log("ETAPA 1 concluída com sucesso. Prosseguindo para ETAPA 2.");

      // Re-calcular totais da Etapa 1 com base no último resultado bem-sucedido
      const finalTotaisRename = finalRenameResult.totais || {};
      const finalTotalRenomeados = (finalTotaisRename.qpe_sem_letra || 0) +
                                  (finalTotaisRename.qpe_com_letra || 0) +
                                  (finalTotaisRename.spb_sem_letra || 0) +
                                  (finalTotaisRename.telecom || 0);
      const finalTotalMovidosInternamente = (finalTotaisRename.movidos || 0);

      setUpdateStatusMessage(`ETAPA 1 concluída: ${finalTotalRenomeados} renomeados, ${finalTotalMovidosInternamente} movidos. Iniciando ETAPA 2...`);


      // ETAPA 2: Copiar arquivos das pastas intermediárias para o repositório final
      console.log("ETAPA 2: Iniciando processo copy-to-repository");
      setUpdateStatusMessage("ETAPA 2: Copiando arquivos para repositório...");
      const copyResponse = await fetch(`${API_URL}/backend/files-repository/copy-to-repository`, {
        method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });

      if (!copyResponse.ok) {
        throw new Error(`Erro HTTP na ETAPA 2 (Copy to Repository): ${copyResponse.status}`);
      }
      const copyResult = await copyResponse.json();
      if (!copyResult.success) {
        if (copyResult.cancelled) {
          setUpdateStatusMessage("Processo cancelado durante ETAPA 2");
          resetUpdateButton();
          return;
        }
        throw new Error(`Erro na ETAPA 2 (Copy to Repository): ${copyResult.message || 'Falha desconhecida'}`);
      }
      const copyDetails = copyResult.details || {};
      const totalCopiadosRepositorio = copyDetails.copied_files || 0;
      const totalFalhasCopia = copyDetails.failed_files || 0;
      const finalMessage = `Processo de atualização finalizado com sucesso!\n\n` +
                         `ETAPA 1 (Organização Interna): ${finalTotalRenomeados} arquivos renomeados e ${finalTotalMovidosInternamente} movidos para pastas intermediárias.\n` +
                           `ETAPA 2 (Cópia para Repositório Final): ${totalCopiadosRepositorio} arquivos copiados para o repositório.` +
                           (totalFalhasCopia > 0 ? ` (${totalFalhasCopia} falhas na cópia)` : '');
      setUpdateStatusMessage(`Processo concluído! Etapa 1: ${finalTotalMovidosInternamente} processados, Etapa 2: ${totalCopiadosRepositorio} copiados.`);
      alert(finalMessage);
      resetUpdateButton();


    } catch (error) { // Catch externo para erros não tratados
      console.error('Erro geral no processo de atualização:', error);
      // Garante que a mensagem de erro seja exibida
      if (!updateStatusMessage || (!updateStatusMessage.includes("cancelado") && !updateStatusMessage.includes("interrompido"))) {
          setUpdateStatusMessage(`Erro: ${error.message}`);
          alert(`Erro: ${error.message}`);
      }
      resetUpdateButton();
    }
  };
  
  // Cancela o processo em andamento (ATUALIZADA para cancelar ambos)
  const cancelUpdateProcess = async () => {
    try {
      setUpdateStatusMessage("Cancelando processo...");
      console.log("Enviando solicitação de cancelamento");
      
      // Primeiro, tentamos cancelar o processo rename-clean
      const cancelRenameResponse = await fetch(`${API_URL}/backend/files/cancel-process`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      let renameResult;
      if (cancelRenameResponse.ok) {
        renameResult = await cancelRenameResponse.json();
        console.log("Resposta do cancelamento rename-clean:", renameResult);
      } else {
        console.warn("Falha ao cancelar rename-clean:", cancelRenameResponse.status);
      }
      
      // Em seguida, tentamos cancelar o processo copy-to-repository
      const cancelCopyResponse = await fetch(`${API_URL}/backend/files-repository/cancel-process`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      let copyResult;
      if (cancelCopyResponse.ok) {
        copyResult = await cancelCopyResponse.json();
        console.log("Resposta do cancelamento copy-to-repository:", copyResult);
      } else {
        console.warn("Falha ao cancelar copy-to-repository:", cancelCopyResponse.status);
      }
      
      // Se pelo menos um dos cancelamentos teve sucesso
      if ((renameResult && renameResult.success) || (copyResult && copyResult.success)) {
        setUpdateStatusMessage("Processo cancelado com sucesso!");
        alert("Processo cancelado com sucesso!");
      } else {
        setUpdateStatusMessage("Falha ao cancelar processos. Tente novamente ou aguarde a conclusão.");
        alert("Falha ao cancelar processos. Tente novamente ou aguarde a conclusão.");
      }
      
      // Sempre resetar o botão após tentativa de cancelamento
      resetUpdateButton();
      
    } catch (error) {
      console.error('Erro ao cancelar processos:', error);
      setUpdateStatusMessage(`Erro ao comunicar com o servidor: ${error.message}`);
      alert(`Erro ao comunicar com o servidor: ${error.message}`);
      resetUpdateButton();
    }
  };

  // Reset do botão definido fora do useEffect
  const resetUpdateButton = () => {
    setUpdateProcessRunning(false);
    setLoading(false);
    setProcessingType("");
    // Limpar a mensagem de status ao resetar
    setUpdateStatusMessage(""); 
  };

  // Componente FileList
  const FileList = () => {
    if (error) return <Typography color="error">{error}</Typography>;
    if (files.length === 0 && !error && !loading) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f7fa' }}>
          <Typography>
            Nenhum arquivo carregado. Clique em Buscar Arquivos para listar os arquivos disponíveis para esta etapa.
          </Typography>
          <Typography sx={{ mt: 1 }}>
            Aba atual: <strong>{activeTab}</strong>
          </Typography>
        </Paper>
      );
    }
    if (files.length === 0) return <Typography>Nenhum arquivo encontrado</Typography>;

    return (
      <Paper>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f7fa' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedFiles.length === files.length && files.length > 0}
                onChange={handleSelectAll}
              />
            }
            label="Selecionar Todos"
          />
          <Typography>
            ({selectedFiles.length} de {files.length} selecionados)
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"></TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Tamanho</TableCell>
                <TableCell>Modificado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file, index) => (
                <TableRow 
                  key={index}
                  selected={selectedFiles.includes(file.nome)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedFiles.includes(file.nome)}
                      onChange={() => handleFileSelection(file.nome)}
                    />
                  </TableCell>
                  <TableCell>{file.nome}</TableCell>
                  <TableCell>{(file.tamanho / 1024).toFixed(2)} KB</TableCell>
                  <TableCell>{new Date(file.modificado).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  // Componente para a tela inicial
  const WelcomeScreen = () => (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      height: '100%'
    }}>
      <Paper sx={{ p: 3, mb: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white', borderRadius: 1, boxShadow: 3 }}>
          <Box component="img" src="/images/weg-logo.png" alt="WEG Logo" sx={{ maxWidth: 250 }} />
        </Paper>
        
        <Typography variant="h3" component="h1" sx={{ mb: 5, color: '#00579d', fontWeight: 600 }}>
          Automação de Processos-Contratos
        </Typography>
        
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4, mt: 3 }}>
          {companies.map(company => (
            <Paper 
              key={company.id}
              sx={{ 
                width: 300,
                borderRadius: 1,
                overflow: 'hidden',
                boxShadow: 3,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                },
                cursor: 'pointer'
              }}
              onClick={() => handleCompanySelect(company.id)}
            >
              <Box sx={{ p: 2.5, bgcolor: '#00579d', color: 'white' }}>
                <Typography variant="h5">{company.name}</Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <Typography sx={{ mb: 3, color: '#666' }}>
                  {company.id === 'orange' ? 'Automação de Contratos Financeiros' : 'Em desenvolvimento'}
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ bgcolor: '#00579d', '&:hover': { bgcolor: '#004a84' } }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompanySelect(company.id);
                  }}
                >
                  Acessar
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    );
  
  // Componente para o modal de confirmação
  const ConfirmationModal = () => (
    <Dialog open={showConfirmModal} onClose={cancelBackToDashboard}>
      <DialogTitle>Confirmar Ação</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Deseja voltar para o dashboard? Os dados não salvos serão perdidos.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelBackToDashboard} color="primary">Cancelar</Button>
        <Button onClick={confirmBackToDashboard} color="primary" variant="contained">Confirmar</Button>
      </DialogActions>
    </Dialog>
  );

  // Componente para a aplicação Orange
  const OrangeApp = () => (
      <>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Automação de Contratos Financeiros
            </Typography>
            <Button 
            startIcon={<ArrowBackIcon />}
              variant="outlined"
              color="primary"
            onClick={handleBackButtonClick}
            sx={{ mr: 2 }}
            >
              Voltar para Dashboard
            </Button>
          <Button 
            startIcon={<RefreshIcon />}
            variant="contained"
            color="error"
            onClick={handleResetProcess}
          >
            Resetar Processo
          </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: 2.5, overflowY: 'auto' }}>
          <Paper sx={{ mb: 2.5 }}>
          <Tabs value={activeTab}>
              {['R189', 'QPE', 'SPB', 'NFSERV', 'MUN_CODE'].map(tab => (
              <Tab 
                key={tab}
                label={tab}
                value={tab}
                onClick={() => handleTabChange(tab)}
                disabled={!enabledTabs[tab]}
                sx={{
                  flex: 1,
                  ...(activeTab === tab && {
                    color: '#00579d',
                    borderBottom: '2px solid #00579d'
                  })
                }}
              />
              ))}
            </Tabs>

          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
              <Box sx={{ bgcolor: '#00579d', color: 'white', p: 1.5, fontWeight: 500 }}>
                Arquivos
              </Box>
            <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, justifyContent: 'center' }}>
                  <Button 
                    variant="contained" 
                    onClick={handleSearchFiles} 
                    disabled={loading}
                    sx={{ bgcolor: '#00579d', '&:hover': { bgcolor: '#004a84' } }}
                  >
                    Buscar Arquivos
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleProcessFiles} 
                    disabled={loading || selectedFiles.length === 0}
                    sx={{ bgcolor: '#00579d', '&:hover': { bgcolor: '#004a84' } }}
                  >
                    Processar Arquivos
                  </Button>
                </Box>
                
                {loading && (
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 3, 
                    bgcolor: '#f5f7fa', 
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    my: 2
                  }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#00579d', 
                        fontWeight: 500 
                      }}
                    >
                      {processingType === 'consolidation' 
                        ? 'Consolidando todos os relatórios em um único arquivo...' 
                        : processingType === 'validation'
                        ? 'Executando validação...'
                        : processingType === 'update'
                        ? updateStatusMessage || 'Atualizando arquivos do sistema...'
                        : activeTab === 'R189' 
                          ? 'Carregando arquivos R189...' 
                          : `Carregando arquivos ${activeTab}...`
                      }
                    </Typography>
                  </Box>
                )}
                
                {loading && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block',
                      mt: 1,
                      textAlign: 'center',
                      color: '#666'
                    }}
                  >
                    {processingType === 'consolidation' 
                      ? 'Aguarde enquanto os relatórios são consolidados...' 
                      : processingType === 'validation'
                      ? 'Aguarde enquanto a validação é processada...'
                      : processingType === 'update'
                      ? 'Aguarde enquanto os arquivos são atualizados e processados...'
                      : activeTab === 'R189' 
                        ? 'Aguarde enquanto os arquivos R189 são carregados...' 
                        : `Aguarde enquanto os arquivos ${activeTab} são carregados...`
                    }
                  </Typography>
                )}
                
                {!loading && <FileList key={fileListKey} />}
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
              <Box sx={{ bgcolor: '#00579d', color: 'white', p: 1.5, fontWeight: 500 }}>
                Validações
              </Box>
              <Box sx={{ p: 2.5 }}>
                {validationEnabled ? (
                  <>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      sx={{ mb: 1, justifyContent: 'flex-start', p: 1.5, textAlign: 'left' }}
                      onClick={() => handleValidation('mun_code_r189')}
                    >
                      1. Verificar Divergências MUN_CODE vs R189
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      sx={{ mb: 1, justifyContent: 'flex-start', p: 1.5, textAlign: 'left' }}
                      onClick={() => handleValidation('r189')}
                    >
                      2. Verificar Divergências R189
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      sx={{ mb: 1, justifyContent: 'flex-start', p: 1.5, textAlign: 'left' }}
                      onClick={() => handleValidation('qpe_r189')}
                    >
                      3. Verificar Divergências QPE vs R189
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      sx={{ mb: 1, justifyContent: 'flex-start', p: 1.5, textAlign: 'left' }}
                      onClick={() => handleValidation('spb_r189')}
                    >
                      4. Verificar Divergências SPB vs R189
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      sx={{ mb: 3, justifyContent: 'flex-start', p: 1.5, textAlign: 'left' }}
                      onClick={() => handleValidation('nfserv_r189')}
                    >
                      5. Verificar Divergências NFSERV vs R189
                    </Button>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      my: 3,
                      color: '#00579d',
                      fontWeight: 500,
                      '&::before, &::after': {
                        content: '""',
                        flex: 1,
                        borderBottom: '1px solid #e0e0e0'
                      },
                      '&::before': { mr: 2 },
                      '&::after': { ml: 2 }
                    }}>
                      <Typography>Relatórios</Typography>
                    </Box>
                    
                    <Button 
                      fullWidth 
                      variant="contained" 
                      onClick={() => handleValidation('consolidate_reports')}
                      disabled={loading}
                      sx={{ p: 2, bgcolor: '#00579d', '&:hover': { bgcolor: '#004a84' } }}
                    >
                      Consolidar Todos os Relatórios em um Único Arquivo
                    </Button>
                  </>
                ) : (
                  <Typography sx={{ p: 2, textAlign: 'center' }}>
                    Complete o processamento de todos os arquivos para habilitar as validações.
                  </Typography>
                )}
              </Box>
            </Paper>
            </Box>
          </Paper>
        </Box>

      <Box sx={{ 
        bgcolor: '#f5f7fa', 
        p: 1.5, 
        display: 'flex', 
        justifyContent: 'space-between',
        borderTop: '1px solid #e0e0e0',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        {Object.entries(status).map(([key, value]) => (
          <Box key={key} sx={{ display: 'flex', alignItems: 'center' }}>
            Status {key}: {value}
          </Box>
        ))}
      </Box>
      </>
    );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar com cores WEG */}
      <Box sx={{ 
        width: 250, 
        bgcolor: '#00579d', 
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 1
      }}>
        <Box 
          sx={{ 
            p: 2.5, 
            bgcolor: '#004a84', 
            textAlign: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            '&:hover': { bgcolor: '#00579d' }
          }}
          onClick={() => handleCompanySelect(null)}
        >
          <Box sx={{ 
            bgcolor: 'white',
            p: 1.5,
            borderRadius: 1,
            mb: 2,
            mx: 'auto',
            width: 120,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 1
          }}>
            <Box component="img" src="/images/weg-logo.png" alt="WEG Logo" sx={{ width: '100%', maxHeight: 60, objectFit: 'contain' }} />
          </Box>
          <Typography sx={{ mt: 1, fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.3 }}>
            Automação de Processos-Contratos
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1, overflowY: 'auto', py: 2.5 }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ 
              px: 2.5, 
              mb: 1.5, 
              fontSize: '0.9rem', 
              textTransform: 'uppercase',
              letterSpacing: 1,
              opacity: 0.8
            }}>
              Empresas
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {companies.map(company => (
                <Box key={company.id}>
                  {/* Botão principal da empresa */}
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      py: 1.5,
                      px: 2.5,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                      ...(selectedCompany === company.id && {
                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                        borderLeft: '4px solid white'
                      })
                    }}
                    onClick={() => handleCompanySelect(company.id)}
                  >
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      mr: 1.5, 
                      bgcolor: 'white' 
                    }} />
                    <Typography sx={{ fontWeight: 500 }}>
                      {company.name}
                    </Typography>
                  </Box>

                  {/* Submenu de Orange */}
                  {selectedCompany === company.id && company.id === 'orange' && (
                    <Box sx={{ pl: 4 }}>
                      {/* Botão Atualizar Arquivos com mensagem de status */}
                      <Box sx={{ position: 'relative' }}>
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            py: 1.2,
                            px: 2,
                            // Lógica de cursor/hover ajustada para updateProcessRunning
                            cursor: updateProcessRunning ? 'default' : 'pointer',
                            transition: 'background-color 0.2s',
                            '&:hover': updateProcessRunning ? {} : { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                            borderLeft: '2px solid rgba(255, 255, 255, 0.3)',
                            ...(updateProcessRunning && {
                              bgcolor: 'rgba(220, 53, 69, 0.3)', // Vermelho mais escuro quando processo em andamento
                            })
                          }}
                          onClick={handleUpdateFiles} // Agora sempre chama handleUpdateFiles
                        >
                          <Box sx={{ 
                            width: 6, 
                            height: 6, 
                            borderRadius: '50%', 
                            mr: 1.5, 
                            bgcolor: updateProcessRunning ? 'rgba(220, 53, 69, 0.8)' : 'rgba(255, 255, 255, 0.7)' 
                          }} />
                          <Typography sx={{ fontSize: '0.9rem' }}>
                            {updateStatusMessage && updateStatusMessage.startsWith("Cancelando...") 
                              ? 'Cancelando...' 
                              : updateProcessRunning 
                                ? 'Cancelar Atualização' 
                                : 'Atualizar Arquivos'}
                          </Typography>
                          {/* Indicador de loading ajustado para updateProcessRunning */}
                          {updateProcessRunning && (
                            <CircularProgress size={14} sx={{ ml: 1, color: 'white' }} />
                          )}
                        </Box>
                      </Box>
                      
                      {/* REMOVER O BOTÃO MOVER ARQUIVOS */}
                      {/* 
                      <Box sx={{ position: 'relative', mt: 1 }}>
                        // ... JSX do botão Mover Arquivos ...
                      </Box> 
                      */} {/* REMOVIDO */}
                      
                      {/* Você pode adicionar outros submenus de Orange aqui */}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Conteúdo principal */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#f5f7fa' }}>
        {selectedCompany === 'orange' ? (
          <OrangeApp />
        ) : (
          <WelcomeScreen />
        )}
        
        {/* Modal de confirmação */}
        <ConfirmationModal />
      </Box>
    </Box>
  );
}
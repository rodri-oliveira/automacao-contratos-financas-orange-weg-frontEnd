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
  
  // Estado para controlar quais abas estão habilitadas - Habilitando todas por padrão
  const [enabledTabs, setEnabledTabs] = useState({
    R189: true, NF_QPE: true, NF_SPB: true, FATURAS: true, SRV_CODE: true
  });
  
  // Estado para controlar o status de cada etapa - Atualizando para os novos nomes
  const [status, setStatus] = useState({
    R189: 'Aguardando processamento',
    NF_QPE: 'Aguardando processamento',
    NF_SPB: 'Aguardando processamento',
    FATURAS: 'Aguardando processamento',
    SRV_CODE: 'Aguardando processamento'
  });
  
  // Habilitando validações por padrão
  const [validationEnabled, setValidationEnabled] = useState(true);
  
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

  // Função para buscar arquivos - Atualizado para mapear novos nomes para o backend
  const handleSearchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mapeamento de novos nomes para os nomes esperados pelo backend
      let endpointType;
      switch(activeTab) {
        case 'NF_QPE': endpointType = 'QPE'; break;
        case 'NF_SPB': endpointType = 'SPB'; break;
        case 'FATURAS': endpointType = 'NFSERV'; break;
        case 'SRV_CODE': endpointType = 'MUN_CODE'; break;
        default: endpointType = 'R189';
      }
      
      console.log(`Buscando arquivos para tipo: ${endpointType}`);
      
      const response = await fetch(`${API_URL}/backend/arquivos/${endpointType}`, {
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

  // Função para processar arquivos - Atualizando para compatibilidade com backend
  const handleProcessFiles = async () => {
    if (selectedFiles.length === 0) {
      setError("Por favor, selecione pelo menos um arquivo para processar.");
      return;
    }

    try {
      setLoading(true);
      
      // Mapeamento de novos nomes para os nomes esperados pelo backend
      let endpointType;
      switch(activeTab) {
        case 'NF_QPE': endpointType = 'QPE'; break;
        case 'NF_SPB': endpointType = 'SPB'; break;
        case 'FATURAS': endpointType = 'NFSERV'; break;
        case 'SRV_CODE': endpointType = 'MUN_CODE'; break;
        default: endpointType = 'R189';
      }
      
      // Construir o endpoint com o tipo mapeado
      const endpoint = endpointType === 'R189' 
        ? `${API_URL}/backend/processar/r189`
        : `${API_URL}/backend/${endpointType.toLowerCase()}/process`;

      console.log(`Enviando requisição para endpoint: ${endpoint}`);
      
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
        
        // Apenas mostrando mensagem de sucesso
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

  // Função para resetar o processo - Atualizando para novos nomes
  const handleResetProcess = () => {
    try {
      // Resetar estados básicos de arquivos e seleção
      setFiles([]);
      setSelectedFiles([]);
      setError(null);
      
      // Resetar o status das abas com novos nomes
      setStatus({
        R189: 'Aguardando processamento',
        NF_QPE: 'Aguardando processamento',
        NF_SPB: 'Aguardando processamento',
        FATURAS: 'Aguardando processamento',
        SRV_CODE: 'Aguardando processamento'
      });
      
      // Resetar abas habilitadas (todas continuam habilitadas)
      setEnabledTabs({
        R189: true, NF_QPE: true, NF_SPB: true, FATURAS: true, SRV_CODE: true
      });
      
      // Não reseta validationEnabled pois agora está sempre habilitado
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
      
      // Alguns endpoints de validação podem usar os nomes das abas, então vamos 
      // certificar de que estamos usando os nomes corretos para o backend
      let adjustedType = type;
      
      // Ajustar endpoints de validação que possam usar nomes de abas
      if (type === 'qpe_r189' || type === 'spb_r189' || type === 'nfserv_r189') {
        console.log(`Enviando validação para endpoint: ${adjustedType}`);
      }
      
      const endpoint = `${API_URL}/backend/validations/${adjustedType}`;
      console.log(`Enviando validação para endpoint: ${endpoint}`);
      
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

  // Função para iniciar ou cancelar o processo de atualização
  const handleUpdateFiles = async () => {
    if (updateProcessRunning) {
      // Se o processo está em andamento, tenta cancelá-lo
      await cancelUpdateProcess();
    } else {
      // Se não há processo em andamento, inicia um
      if (window.confirm('Iniciar o processo de atualização de arquivos?')) {
        await startUpdateProcess();
      }
    }
  };
  
  // Inicia o processo de atualização
  const startUpdateProcess = async () => {
    try {
      // Configura os estados iniciais
      setUpdateProcessRunning(true);
      setLoading(true);
      setProcessingType("update");
      setUpdateStatusMessage("Processo iniciado...");
      
      console.log("Iniciando processo com o endpoint rename-clean");
      
      // Chamando o novo endpoint unificado /backend/files/rename-clean
      const response = await fetch(`${API_URL}/backend/files/rename-clean`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // Adicionamos parâmetros que indicam que este processo pode ser cancelado
        body: JSON.stringify({ 
          cancelable: true,
          process_id: new Date().getTime(), // Geramos um ID único para o processo
          process_type: 'rename-clean'  // Identificador para o cancelamento
        })
      });
      
      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      // Clonar a resposta para poder lê-la várias vezes (para debug)
      const responseClone = response.clone();
      let responseText = await responseClone.text();
      console.log("Resposta bruta:", responseText);
      
      // Tentar analisar como JSON
      let result;
      try {
        // Convertemos o texto para JSON
        result = JSON.parse(responseText);
        console.log("Resposta como JSON:", result);
      } catch (jsonError) {
        console.error("Erro ao analisar JSON:", jsonError);
        throw new Error("Resposta inválida do servidor");
      }
      
      // Verificar se o processo foi cancelado imediatamente
      if (result.cancelled) {
        setUpdateStatusMessage("Processo cancelado pelo usuário");
        alert("Processo cancelado pelo usuário");
        // Não resetamos o botão imediatamente para evitar problemas de estado
        setTimeout(() => resetUpdateButton(), 1000);
        return;
      }
      
      // Verificar se o processo foi iniciado com sucesso
      if (result.success) {
        // Se o backend indicar que o processo é assíncrono
        if (result.async === true || result.status === 'processing') {
          setUpdateStatusMessage(result.message || "Processando arquivos...");
          console.log("Processo assíncrono iniciado, aguardando via polling");
          // Não fazemos nada aqui, deixamos o useEffect checar o status
        } else {
          // Se o processo já foi concluído sincronamente
          setUpdateStatusMessage("Processo finalizado com sucesso!");
          
          // Detalhes específicos do processamento, se disponíveis
          const detalhes = result.details ? 
            `\n${result.details.files_processed || 0} arquivos processados.` : 
            '';
            
          // Mostrar alert apenas DEPOIS de resetar o botão para evitar problemas de UI
          setTimeout(() => {
            alert(`Processo de atualização finalizado com sucesso!${detalhes}`);
            resetUpdateButton();
          }, 100);
        }
      } else {
        // Se o processo não foi bem-sucedido, mostramos o erro
        setUpdateStatusMessage(`Erro no processamento: ${result.message || 'Falha desconhecida'}`);
        alert(`Erro no processamento: ${result.message || 'Falha desconhecida'}`);
        setTimeout(() => resetUpdateButton(), 1000);
      }
      
    } catch (error) {
      console.error('Erro ao executar o processo:', error);
      setUpdateStatusMessage(`Erro ao executar o processo: ${error.message}`);
      alert(`Erro ao executar o processo: ${error.message}`);
      resetUpdateButton();
    }
  };
  
  // Cancela o processo em andamento (adaptado para o novo endpoint)
  const cancelUpdateProcess = async () => {
    try {
      console.log("Tentando cancelar o processo rename-clean");
      
      // Mostrar indicador visual de que estamos tentando cancelar
      setUpdateStatusMessage("Cancelando...");
      
      // Chamar endpoint de cancelamento, adaptado para o novo processo
      const response = await fetch(`${API_URL}/backend/files/cancel-process`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // Indicamos o tipo de processo que estamos cancelando
        body: JSON.stringify({
          process_type: 'rename-clean'
        })
      });
      
      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Resposta do cancelamento:", result);
      
      if (result.success) {
        setUpdateStatusMessage("Processo cancelado com sucesso!");
        
        // Atualizar a interface
        atualizarInterfaceAposCancelamento();
        
        // Alertar usuário (depois de um pequeno delay para garantir que o estado da UI foi atualizado)
        setTimeout(() => {
          alert("Processo cancelado com sucesso!");
          // Resetamos o botão DEPOIS de mostrar o alert para evitar problemas de UI
          resetUpdateButton();
        }, 100);
      } else {
        setUpdateStatusMessage(`Falha ao cancelar processo: ${result.message}`);
        alert(`Falha ao cancelar processo: ${result.message}`);
        resetUpdateButton();
      }
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      setUpdateStatusMessage(`Erro ao comunicar com o servidor: ${error.message}`);
      alert(`Erro ao comunicar com o servidor: ${error.message}`);
      resetUpdateButton();
    }
  };
  
  // Função para atualizar a interface após cancelar
  const atualizarInterfaceAposCancelamento = () => {
    // Resetar o status das abas para o estado inicial
    setStatus({
      R189: 'Aguardando processamento',
      NF_QPE: 'Aguardando processamento',
      NF_SPB: 'Aguardando processamento',
      FATURAS: 'Aguardando processamento',
      SRV_CODE: 'Aguardando processamento'
    });
    
    // Resetar possíveis arquivos carregados
    setFiles([]);
    setSelectedFiles([]);
    
    // Recarregar a lista de arquivos (se necessário)
    setFileListKey(prevKey => prevKey + 1);
    
    // Limpar qualquer mensagem de erro existente
    setError(null);
  };
  
  // Reset do botão para estado inicial - função atualizada
  const resetUpdateButton = () => {
    setUpdateProcessRunning(false);
    setLoading(false);
    setProcessingType("");
  };
  
  // Verificador de status periódico
  useEffect(() => {
    let statusCheckInterval;
    
    if (updateProcessRunning) {
      console.log("Iniciando verificação periódica de status");
      
      statusCheckInterval = setInterval(async () => {
        if (!updateProcessRunning) {
          console.log("Processo não está mais em execução, parando verificação");
          clearInterval(statusCheckInterval);
          return;
        }
        
        try {
          console.log("Verificando status do processo...");
          
          const response = await fetch(`${API_URL}/backend/files/process-status`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            // Adicionamos o parâmetro para identificar o tipo de processo
            body: JSON.stringify({
              process_type: 'rename-clean'
            })
          });
          
          if (!response.ok) {
            console.error("Erro ao verificar status:", response.status, response.statusText);
            return;
          }
          
          const status = await response.json();
          console.log("Status recebido:", status);
          
          // Atualiza a mensagem de status se houver uma no servidor
          if (status.message) {
            setUpdateStatusMessage(status.message);
          }
          
          // Se o processo terminou no servidor, atualiza a interface
          // Verificamos explicitamente se running é false para evitar problemas com valores undefined
          if (status.running === false) {
            console.log("Processo não está mais em execução");
            
            if (status.success) {
              setUpdateStatusMessage("Processo concluído com sucesso!");
              
              // Mostramos o alerta apenas APÓS o processo ser realmente concluído
              const detalhes = status.details ? 
                `\n${status.details.files_processed || 0} arquivos processados.` : 
                '';
                
              setTimeout(() => {
                alert(`Processo de atualização finalizado com sucesso!${detalhes}`);
                resetUpdateButton();
              }, 100);
            } else if (status.cancelled) {
              setUpdateStatusMessage("Processo cancelado pelo usuário");
              setTimeout(() => resetUpdateButton(), 500);
            } else {
              setUpdateStatusMessage("Processo concluído");
              setTimeout(() => resetUpdateButton(), 500);
            }
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
        }
      }, 3000); // Verifica a cada 3 segundos
    }
    
    // Limpa o intervalo quando o componente é desmontado ou o estado muda
    return () => {
      if (statusCheckInterval) {
        console.log("Limpando intervalo de verificação de status");
        clearInterval(statusCheckInterval);
      }
    };
  }, [updateProcessRunning, API_URL]);

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
              {['R189', 'NF_QPE', 'NF_SPB', 'FATURAS', 'SRV_CODE'].map(tab => (
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
                      onClick={() => handleValidation('r189')}
                    >
                      1. Verificar Divergências R189
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      sx={{ mb: 1, justifyContent: 'flex-start', p: 1.5, textAlign: 'left' }}
                      onClick={() => handleValidation('mun_code_r189_simple')}
                    >
                      2. Verificar Divergências SRV_CODE_SIMPLE
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      sx={{ mb: 1, justifyContent: 'flex-start', p: 1.5, textAlign: 'left' }}
                      onClick={() => handleValidation('mun_code_r189')}
                    >
                      3. Verificar Divergências SRV_CODE
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      sx={{ mb: 1, justifyContent: 'flex-start', p: 1.5, textAlign: 'left' }}
                      onClick={() => handleValidation('qpe_r189')}
                    >
                      4. Verificar Divergências NF_QPE vs R189
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      sx={{ mb: 1, justifyContent: 'flex-start', p: 1.5, textAlign: 'left' }}
                      onClick={() => handleValidation('spb_r189')}
                    >
                      5. Verificar Divergências NF_SPB vs R189
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      sx={{ mb: 3, justifyContent: 'flex-start', p: 1.5, textAlign: 'left' }}
                      onClick={() => handleValidation('nfserv_r189')}
                    >
                      6. Verificar Divergências FATURAS vs R189
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
                            cursor: loading && processingType === 'update' ? 'default' : 'pointer',
                            transition: 'background-color 0.2s',
                            '&:hover': (loading && processingType === 'update') ? {} : { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                            borderLeft: '2px solid rgba(255, 255, 255, 0.3)',
                            ...(updateProcessRunning && {
                              bgcolor: 'rgba(220, 53, 69, 0.3)', // Vermelho mais escuro quando processo em andamento
                            })
                          }}
                          onClick={(loading && processingType === 'update' && updateStatusMessage === "Cancelando...") ? null : handleUpdateFiles}
                        >
                          <Box sx={{ 
                            width: 6, 
                            height: 6, 
                            borderRadius: '50%', 
                            mr: 1.5, 
                            bgcolor: updateProcessRunning ? 'rgba(220, 53, 69, 0.8)' : 'rgba(255, 255, 255, 0.7)' 
                          }} />
                          <Typography sx={{ fontSize: '0.9rem' }}>
                            {updateStatusMessage === "Cancelando..." 
                              ? 'Cancelando...' 
                              : updateProcessRunning 
                                ? 'Cancelar Atualização' 
                                : 'Atualizar Arquivos'}
                          </Typography>
                          {loading && processingType === "update" && (
                            <CircularProgress size={14} sx={{ ml: 1, color: 'white' }} />
                          )}
                        </Box>
                      </Box>
                      
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
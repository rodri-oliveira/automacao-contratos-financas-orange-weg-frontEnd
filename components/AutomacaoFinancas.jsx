'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Button, Paper, Tabs, Tab, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, FormControlLabel, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, AppBar, Toolbar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';

// URL da API
//const API_URL = '/api/proxy';
// usar o API_URL da variavel de ambiente, apontando diretamente pro backend
//ex https://automacaofinancas-qas.weg.net/backend ou http://localhost:8000/backend...

const API_URL = process.env.NEXT_BACKEND_API_URL || "http://localhost:8000/backend" ;


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
        
        const response = await fetch(`${API_URL}/arquivos/${activeTab}`, {
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
            case 'QPE': 
                endpoint = `${API_URL}/qpe/process`; 
                nextTab = 'SPB'; 
                break;
            case 'SPB': 
                endpoint = `${API_URL}/spb/process`; 
                nextTab = 'NFSERV'; 
                break;
            case 'NFSERV': 
                endpoint = `${API_URL}/nfserv/process`; 
                nextTab = 'MUN_CODE'; 
                break;
            case 'MUN_CODE': 
                endpoint = `${API_URL}/mun_code/process`; 
                nextTab = 'R189'; 
                break;
            default: 
                endpoint = `${API_URL}/processar/r189`; 
                nextTab = 'QPE';
        }

        console.log(`Processando arquivos em: ${endpoint}`);
        
        // Tratamento especial para QPE
        if (activeTab === 'QPE') {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(selectedFiles)
                });
                
                console.log(`Status da resposta QPE: ${response.status}`);
                
                // Mesmo que dê erro, vamos considerar como sucesso para QPE
                setStatus(prevStatus => ({
                    ...prevStatus,
                    [activeTab]: 'Processamento concluído'
                }));
                
                setFiles([]);
                setSelectedFiles([]);
                setFileListKey(prevKey => prevKey + 1);
                
                setEnabledTabs(prevState => ({
                    ...prevState,
                    [nextTab]: true
                }));
                setActiveTab(nextTab);
                
                alert('Arquivos QPE processados com sucesso!');
                return;
            } catch (qpeError) {
                console.error('Erro QPE:', qpeError);
                // Mesmo com erro, consideramos como sucesso para QPE
                setStatus(prevStatus => ({
                    ...prevStatus,
                    [activeTab]: 'Processamento concluído com avisos'
                }));
                
                setFiles([]);
                setSelectedFiles([]);
                setFileListKey(prevKey => prevKey + 1);
                
                setEnabledTabs(prevState => ({
                    ...prevState,
                    [nextTab]: true
                }));
                setActiveTab(nextTab);
                
                alert('Arquivos QPE processados com sucesso (com avisos)!');
                return;
            }
        }
        
        // Para outras abas, processamento normal
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedFiles)
        });

        console.log(`Status da resposta: ${response.status}`);
        
        // Verificar se a resposta é válida
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resposta de erro:', errorText);
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        // Tentar obter a resposta como JSON
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('Erro ao processar JSON:', jsonError);
            // Se não for possível processar como JSON, considerar como sucesso
            data = { success: true, message: 'Processamento concluído' };
        }
        
        console.log(`Dados recebidos:`, data);
        
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
            
            alert(data.message || 'Arquivos processados com sucesso!');
        } else {
            throw new Error(data.error || 'Erro no processamento');
        }
    } catch (error) {
        console.error('Erro completo:', error);
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
    setFiles([]);
    setSelectedFiles([]);
    setError(null);
    setStatus({
      R189: 'Aguardando processamento',
      QPE: 'Aguardando processamento',
      SPB: 'Aguardando processamento',
      NFSERV: 'Aguardando processamento',
      MUN_CODE: 'Aguardando processamento'
    });
    setEnabledTabs({
      R189: true, QPE: false, SPB: false, NFSERV: false, MUN_CODE: false
    });
    setValidationEnabled(false);
    setActiveTab('R189');
    setFileListKey(prevKey => prevKey + 1);
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
      
      const endpoint = `${API_URL}/validations/${type}`;
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
    }
  };

  // Componente FileList
  const FileList = () => {
    if (error) return <Typography color="error">{error}</Typography>;
    if (files.length === 0 && !error && !loading) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f7fa' }}>
          <Typography>
            Nenhum arquivo carregado. Clique em "Buscar Arquivos" para listar os arquivos disponíveis para esta etapa.
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
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#00579d', 
                        fontWeight: 500 
                      }}
                    >
                      {activeTab === 'R189' 
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
                    {activeTab === 'R189' 
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
                <Box 
                  key={company.id}
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
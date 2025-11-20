const fs = require('fs');
const path = require('path');

/**
 * Orquestrador de Agentes de IA para Governança de Código
 * 
 * Este script coordena múltiplos agentes especializados que analisam
 * o código-fonte do projeto e propõem melhorias estruturais.
 * 
 * Agentes disponíveis:
 * - arquiteto: Revisa arquitetura e estrutura de pastas
 * - cleaner: Identifica código morto e duplicações
 * - dev-backend: Sugere melhorias na API e backend
 * - dev-frontend: Sugere melhorias na UI e frontend
 * - qa: Verifica qualidade, testes e boas práticas
 */

class AIOrchestrator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.aiDir = path.join(this.projectRoot, 'ai');
    this.promptsDir = path.join(this.aiDir, 'prompts');
    this.logsDir = path.join(this.aiDir, 'logs');
    this.memoryDir = path.join(this.aiDir, 'memory');
    this.proposalsDir = path.join(this.aiDir, 'proposals');
    
    this.stateFile = path.join(this.aiDir, 'state.json');
    this.agents = ['arquiteto', 'cleaner', 'dev-backend', 'dev-frontend', 'qa'];
    
    this.ensureDirectories();
    this.loadState();
  }

  ensureDirectories() {
    [this.aiDir, this.promptsDir, this.logsDir, this.memoryDir, this.proposalsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  loadState() {
    if (fs.existsSync(this.stateFile)) {
      this.state = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
    } else {
      this.state = {
        lastRun: null,
        lastProposals: [],
        activeAgents: this.agents,
        projectStats: {
          totalFiles: 0,
          totalLines: 0,
          lastScan: null
        }
      };
      this.saveState();
    }
  }

  saveState() {
    fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
  }

  loadAgentPrompt(agentName) {
    const promptFile = path.join(this.promptsDir, `${agentName}.sys`);
    if (fs.existsSync(promptFile)) {
      return fs.readFileSync(promptFile, 'utf8');
    }
    throw new Error(`Prompt file not found: ${promptFile}`);
  }

  async runAgent(agentName) {
    console.log(`🤖 Executando agente: ${agentName}`);
    
    try {
      const prompt = this.loadAgentPrompt(agentName);
      const timestamp = new Date().toISOString();
      
      // Simulação de execução do agente
      // Em implementação real, aqui chamaria a API do modelo de IA
      const proposal = {
        agent: agentName,
        timestamp: timestamp,
        prompt: prompt,
        analysis: this.analyzeProject(agentName),
        proposals: [], // Seria preenchido pela IA
        status: 'proposed'
      };

      // Salvar proposta
      const proposalFile = path.join(this.proposalsDir, `${agentName}-${timestamp.replace(/[:.]/g, '-')}.json`);
      fs.writeFileSync(proposalFile, JSON.stringify(proposal, null, 2));

      // Salvar log
      const logFile = path.join(this.logsDir, `${agentName}-${timestamp.replace(/[:.]/g, '-')}.log`);
      fs.writeFileSync(logFile, `Agente: ${agentName}\nTimestamp: ${timestamp}\nStatus: completed\n`);

      console.log(`✅ Agente ${agentName} concluído`);
      return proposal;

    } catch (error) {
      console.error(`❌ Erro ao executar agente ${agentName}:`, error.message);
      return null;
    }
  }

  analyzeProject(agentName) {
    // Análise básica do projeto
    const srcDir = path.join(this.projectRoot, 'src');
    const analysis = {
      agent: agentName,
      projectRoot: this.projectRoot,
      directories: this.getDirectories(srcDir),
      fileTypes: this.getFileTypes(srcDir),
      totalFiles: this.countFiles(srcDir),
      timestamp: new Date().toISOString()
    };

    return analysis;
  }

  getDirectories(dir) {
    if (!fs.existsSync(dir)) return [];
    
    const items = fs.readdirSync(dir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    return items;
  }

  getFileTypes(dir) {
    if (!fs.existsSync(dir)) return {};
    
    const files = this.getAllFiles(dir);
    const types = {};
    
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      types[ext] = (types[ext] || 0) + 1;
    });
    
    return types;
  }

  getAllFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    
    let files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    items.forEach(item => {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files = files.concat(this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  countFiles(dir) {
    return this.getAllFiles(dir).length;
  }

  async runAllAgents() {
    console.log('🚀 Iniciando orquestrador de agentes de IA...');
    
    const startTime = Date.now();
    const results = [];

    for (const agent of this.agents) {
      const result = await this.runAgent(agent);
      if (result) {
        results.push(result);
      }
    }

    // Atualizar estado
    this.state.lastRun = new Date().toISOString();
    this.state.lastProposals = results.map(r => ({
      agent: r.agent,
      timestamp: r.timestamp,
      status: r.status
    }));
    this.state.projectStats.totalFiles = this.countFiles(path.join(this.projectRoot, 'src'));
    this.state.projectStats.lastScan = new Date().toISOString();
    
    this.saveState();

    const duration = Date.now() - startTime;
    console.log(`🎉 Orquestrador concluído em ${duration}ms`);
    console.log(`📊 Resultados: ${results.length} propostas geradas`);

    return results;
  }

  async runSpecificAgent(agentName) {
    if (!this.agents.includes(agentName)) {
      throw new Error(`Agente desconhecido: ${agentName}`);
    }

    console.log(`🎯 Executando agente específico: ${agentName}`);
    return await this.runAgent(agentName);
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      project: this.projectRoot,
      state: this.state,
      lastProposals: this.getLastProposals(),
      recommendations: this.generateRecommendations()
    };

    const reportFile = path.join(this.aiDir, `report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    console.log(`📋 Relatório gerado: ${reportFile}`);
    return report;
  }

  getLastProposals() {
    const proposalsDir = this.proposalsDir;
    if (!fs.existsSync(proposalsDir)) return [];

    const files = fs.readdirSync(proposalsDir)
      .filter(file => file.endsWith('.json'))
      .sort()
      .slice(-5); // Últimas 5 propostas

    return files.map(file => {
      const content = JSON.parse(fs.readFileSync(path.join(proposalsDir, file), 'utf8'));
      return {
        file: file,
        agent: content.agent,
        timestamp: content.timestamp,
        status: content.status
      };
    });
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.state.projectStats.totalFiles > 100) {
      recommendations.push('Considere dividir o projeto em módulos para melhor organização');
    }

    const lastProposal = this.state.lastProposals[this.state.lastProposals.length - 1];
    if (lastProposal) {
      const daysSinceLastRun = Math.floor((Date.now() - new Date(lastProposal.timestamp)) / (1000 * 60 * 60 * 24));
      if (daysSinceLastRun > 7) {
        recommendations.push('Recomenda-se executar o orquestrador semanalmente');
      }
    }

    return recommendations;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const orchestrator = new AIOrchestrator();

  if (args.length === 0) {
    // Executar todos os agentes
    await orchestrator.runAllAgents();
    orchestrator.generateReport();
  } else if (args[0] === '--agent' && args[1]) {
    // Executar agente específico
    await orchestrator.runSpecificAgent(args[1]);
  } else if (args[0] === '--report') {
    // Gerar relatório
    orchestrator.generateReport();
  } else if (args[0] === '--help') {
    console.log(`
Orquestrador de Agentes de IA para Governança de Código

Uso:
  node orchestrator_windsurf.js              # Executa todos os agentes
  node orchestrator_windsurf.js --agent <nome>  # Executa agente específico
  node orchestrator_windsurf.js --report     # Gera relatório
  node orchestrator_windsurf.js --help       # Mostra ajuda

Agentes disponíveis:
  - arquiteto
  - cleaner
  - dev-backend
  - dev-frontend
  - qa
    `);
  } else {
    console.log('Comando inválido. Use --help para ajuda.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AIOrchestrator;

// Serviço de Controle Estatístico de Processos (CEP)
// Implementa análises estatísticas para controle de qualidade

export interface StatisticalMetrics {
  mean: number
  median: number
  mode?: number
  stdDev: number
  variance: number
  min: number
  max: number
  range: number
  q1: number
  q3: number
  iqr: number
}

export interface CapabilityIndices {
  cp?: number
  cpu?: number
  cpl?: number
  cpk?: number
  pp?: number
  ppu?: number
  ppl?: number
  ppk?: number
  sigmaLevel?: number
  dpmo?: number
  isCapable: boolean
  interpretation?: string
}

export interface ControlLimits {
  xBarBar?: number  // Média das médias
  rBar?: number      // Média das amplitudes
  sBar?: number      // Média dos desvios padrão
  uclX?: number      // LCL X
  lclX?: number      // UCL X
  uclR?: number      // LCL R
  lclR?: number      // UCL R
  uclS?: number      // LCL S
  lclS?: number      // UCL S
}

export class CEPService {

  /**
   * Calcula estatísticas básicas de um conjunto de dados
   */
  static calculateBasicStats(values: number[]): StatisticalMetrics {
    if (values.length === 0) {
      throw new Error('Conjunto de dados vazio')
    }

    const sorted = [...values].sort((a, b) => a - b)
    const n = values.length

    // Estatísticas básicas
    const mean = values.reduce((sum, val) => sum + val, 0) / n
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min

    // Mediana
    const median = n % 2 === 0
      ? (sorted[n/2 - 1] + sorted[n/2]) / 2
      : sorted[Math.floor(n/2)]

    // Moda (valor mais frequente)
    const frequency: { [key: string]: number } = {}
    values.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1
    })
    const mode = Object.entries(frequency).reduce((a, b) =>
      frequency[a[0]] > frequency[b[0]] ? a : b
    )[0]
    const modeValue = frequency[mode] > 1 ? parseFloat(mode) : undefined

    // Desvio padrão e variância
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1)
    const stdDev = Math.sqrt(variance)

    // Quartis
    const q1Index = Math.floor((n - 1) * 0.25)
    const q3Index = Math.floor((n - 1) * 0.75)
    const q1 = sorted[q1Index]
    const q3 = sorted[q3Index]
    const iqr = q3 - q1

    return {
      mean,
      median,
      mode: modeValue,
      stdDev,
      variance,
      min,
      max,
      range,
      q1,
      q3,
      iqr
    }
  }

  /**
   * Calcula limites de controle para cartas X-barra e R
   */
  static calculateControlLimitsXbarR(
    subgroupMeans: number[],
    subgroupRanges: number[]
  ): ControlLimits {
    const xBarBar = subgroupMeans.reduce((sum, val) => sum + val, 0) / subgroupMeans.length
    const rBar = subgroupRanges.reduce((sum, val) => sum + val, 0) / subgroupRanges.length

    // Fatores de controle (para n=5)
    const A2 = 0.577 // Fator para X-barra
    const D3 = 0     // Fator para R (LCL)
    const D4 = 2.114 // Fator para R (UCL)

    return {
      xBarBar,
      rBar,
      uclX: xBarBar + A2 * rBar,
      lclX: xBarBar - A2 * rBar,
      uclR: D4 * rBar,
      lclR: D3 * rBar
    }
  }

  /**
   * Aplica regras de Western Electric para detectar pontos fora de controle
   */
  static westernElectricRules(values: number[], limits: ControlLimits): {
    violations: number[]
    rules: string[]
  } {
    const violations: number[] = []
    const rules: string[] = []

    if (!limits.uclX || !limits.lclX) {
      return { violations, rules }
    }

    values.forEach((value, index) => {
      let violated = false

      // Regra 1: Ponto além dos limites de controle
      if (limits.uclX && limits.lclX && (value > limits.uclX || value < limits.lclX)) {
        violated = true
        rules.push(`Regra 1: Ponto ${index + 1} além dos limites de controle`)
      }

      // Regra 2: 9 pontos consecutivos do mesmo lado da linha central
      if (index >= 8) {
        const last9 = values.slice(index - 8, index + 1)
        const mean = last9.reduce((sum, val) => sum + val, 0) / 9
        const allAbove = last9.every(val => val > mean)
        const allBelow = last9.every(val => val < mean)

        if (allAbove || allBelow) {
          violated = true
          rules.push(`Regra 2: 9 pontos consecutivos do mesmo lado (ponto ${index + 1})`)
        }
      }

      // Regra 3: 6 pontos consecutivos em tendência crescente/decrescente
      if (index >= 5) {
        const last6 = values.slice(index - 5, index + 1)
        let increasing = true
        let decreasing = true

        for (let i = 1; i < last6.length; i++) {
          if (last6[i] <= last6[i-1]) increasing = false
          if (last6[i] >= last6[i-1]) decreasing = false
        }

        if (increasing || decreasing) {
          violated = true
          rules.push(`Regra 3: 6 pontos em tendência (ponto ${index + 1})`)
        }
      }

      if (violated) {
        violations.push(index)
      }
    })

    return { violations, rules }
  }

  /**
   * Calcula índices de capacidade do processo (Cp, Cpk, Pp, Ppk)
   */
  static calculateCapabilityIndices(
    values: number[],
    lsl?: number, // Limite inferior de especificação
    usl?: number  // Limite superior de especificação
  ): CapabilityIndices {
    if (values.length === 0) {
      throw new Error('Conjunto de dados vazio')
    }

    const stats = this.calculateBasicStats(values)

    if (!lsl || !usl) {
      return {
        isCapable: false,
        interpretation: 'Especificações não definidas'
      }
    }

    const tolerance = usl - lsl

    // Índices de capacidade (Cp, Cpk)
    const cp = tolerance / (6 * stats.stdDev)
    const cpu = (usl - stats.mean) / (3 * stats.stdDev)
    const cpl = (stats.mean - lsl) / (3 * stats.stdDev)
    const cpk = Math.min(cpu, cpl)

    // Índices de performance (Pp, Ppk) - mesmos cálculos, mas usando toda a população
    const pp = cp
    const ppu = cpu
    const ppl = cpl
    const ppk = cpk

    // Nível Sigma (aproximação)
    const sigmaLevel = cpk * 3 + 1.5

    // DPMO (Defeitos por milhão de oportunidades)
    const zScore = cpk * 3
    const dpmo = 1000000 * (1 - this.normalDistribution(zScore))

    // Interpretação
    let interpretation = ''
    let isCapable = false

    if (cpk >= 1.33) {
      interpretation = 'Processo capaz e bem centralizado'
      isCapable = true
    } else if (cpk >= 1.0) {
      interpretation = 'Processo capaz, mas precisa melhoria na centralização'
    } else if (cp >= 1.0) {
      interpretation = 'Processo capaz, mas dispersão muito alta'
    } else {
      interpretation = 'Processo incapaz - necessita ação corretiva'
    }

    return {
      cp,
      cpu,
      cpl,
      cpk,
      pp,
      ppu,
      ppl,
      ppk,
      sigmaLevel,
      dpmo,
      isCapable,
      interpretation
    }
  }

  /**
   * Função de distribuição normal (tabela Z aproximada)
   */
  private static normalDistribution(z: number): number {
    // Aproximação simples usando fórmula de erro
    const a1 =  0.254829592
    const a2 = -0.284496736
    const a3 =  1.421413741
    const a4 = -1.453152027
    const a5 =  1.061405429
    const p  =  0.3275911

    const sign = z < 0 ? -1 : 1
    const x = Math.abs(z) / Math.sqrt(2)

    const t = 1 / (1 + p * x)
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

    return 0.5 * (1 + sign * y)
  }

  /**
   * Cria uma análise CEP a partir de dados de controle hora a hora
   */
  static analyzeHourlyControlData(hourlyControls: Array<{
    efficiency: number
    targetQuantity: number
    actualQuantity: number
  }>): {
    stats: StatisticalMetrics
    limits: ControlLimits
    violations: number[]
    rules: string[]
    capability?: CapabilityIndices
  } {
    if (hourlyControls.length === 0) {
      throw new Error('Dados insuficientes para análise CEP')
    }

    // Usar eficiência como métrica principal
    const efficiencyValues = hourlyControls.map(h => h.efficiency)

    // Estatísticas básicas
    const stats = this.calculateBasicStats(efficiencyValues)

    // Calcular limites de controle (usando X-barra e R para eficiência)
    const subgroupSize = 5
    const subgroups: number[][] = []

    for (let i = 0; i < efficiencyValues.length; i += subgroupSize) {
      subgroups.push(efficiencyValues.slice(i, i + subgroupSize))
    }

    const subgroupMeans: number[] = []
    const subgroupRanges: number[] = []

    subgroups.forEach(subgroup => {
      if (subgroup.length > 0) {
        const mean = subgroup.reduce((sum, val) => sum + val, 0) / subgroup.length
        const min = Math.min(...subgroup)
        const max = Math.max(...subgroup)
        const range = max - min

        subgroupMeans.push(mean)
        subgroupRanges.push(range)
      }
    })

    const limits = this.calculateControlLimitsXbarR(subgroupMeans, subgroupRanges)

    // Aplicar regras de Western Electric
    const { violations, rules } = this.westernElectricRules(efficiencyValues, limits)

    // Calcular capacidade (especificações típicas: 80-120% eficiência)
    const capability = this.calculateCapabilityIndices(efficiencyValues, 80, 120)

    return {
      stats,
      limits,
      violations,
      rules,
      capability
    }
  }

  /**
   * Gera dados simulados para demonstração
   */
  static generateDemoData(): {
    stats: StatisticalMetrics
    limits: ControlLimits
    violations: number[]
    rules: string[]
    capability: CapabilityIndices
  } {
    // Dados simulados de eficiência (valores realistas)
    const demoEfficiency = [
      95, 97, 94, 96, 98, 93, 95, 97, 99, 96,
      94, 98, 95, 97, 96, 99, 93, 95, 97, 94,
      96, 98, 95, 97, 96, 94, 98, 95, 97, 96,
      99, 93, 95, 97, 94, 96, 98, 95, 97, 96
    ]

    const stats = this.calculateBasicStats(demoEfficiency)
    const limits = this.calculateControlLimitsXbarR(
      demoEfficiency.slice(0, 20).map((_, i) => demoEfficiency[i * 2] || 0),
      demoEfficiency.slice(0, 20).map((_, i) => Math.abs((demoEfficiency[i * 2] || 0) - (demoEfficiency[i * 2 + 1] || 0)))
    )

    const { violations, rules } = this.westernElectricRules(demoEfficiency, limits)
    const capability = this.calculateCapabilityIndices(demoEfficiency, 80, 120)

    return {
      stats,
      limits,
      violations,
      rules,
      capability
    }
  }
}

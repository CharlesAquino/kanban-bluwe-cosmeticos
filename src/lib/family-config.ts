export interface FamilyConfig {
  name: string
  containers: ContainerType[]
  color: string
}

export interface ContainerType {
  id: string
  name: string
  capacityMl: number
  capacityWeightG: number
  description: string
}

export const FAMILIES_CONFIG: Record<string, FamilyConfig> = {
  'Géis': {
    name: 'Géis',
    color: '#dbeafe',
    containers: [
      {
        id: 'pote_30g',
        name: 'Pote 30g',
        capacityMl: 0,
        capacityWeightG: 30,
        description: 'Pote plástico de 30 gramas'
      }
    ]
  },
  'TopCoats': {
    name: 'TopCoats',
    color: '#dcfce7',
    containers: [
      {
        id: 'frasco_11ml',
        name: 'Frasco 11ml',
        capacityMl: 11,
        capacityWeightG: 0,
        description: 'Frasco de vidro 11ml'
      }
    ]
  },
  'Base Estrutural': {
    name: 'Base Estrutural',
    color: '#fef3c7',
    containers: [
      {
        id: 'frasco_11ml',
        name: 'Frasco 11ml',
        capacityMl: 11,
        capacityWeightG: 0,
        description: 'Frasco de vidro 11ml'
      }
    ]
  },
  'Higienizadores': {
    name: 'Higienizadores',
    color: '#fce7f3',
    containers: [
      {
        id: 'frasco_11ml',
        name: 'Frasco 11ml',
        capacityMl: 11,
        capacityWeightG: 0,
        description: 'Frasco de vidro 11ml'
      },
      {
        id: 'frasco_500ml',
        name: 'Frasco 500ml',
        capacityMl: 500,
        capacityWeightG: 0,
        description: 'Frasco plástico 500ml'
      },
      {
        id: 'frasco_130ml',
        name: 'Frasco 130ml',
        capacityMl: 130,
        capacityWeightG: 0,
        description: 'Frasco plástico 130ml'
      }
    ]
  },
  'Esmaltes': {
    name: 'Esmaltes',
    color: '#e9d5ff',
    containers: [
      {
        id: 'frasco_9ml',
        name: 'Frasco 9ml',
        capacityMl: 9,
        capacityWeightG: 0,
        description: 'Frasco de vidro 9ml'
      }
    ]
  },
  'Sem Família': {
    name: 'Sem Família',
    color: '#f8fafc',
    containers: []
  }
}

export function getFamilyContainers(family: string): ContainerType[] {
  return FAMILIES_CONFIG[family]?.containers || []
}

export function getFamilyColor(family: string): string {
  return FAMILIES_CONFIG[family]?.color || '#f8fafc'
}

export function getContainerType(containerId: string): ContainerType | null {
  for (const family of Object.values(FAMILIES_CONFIG)) {
    const container = family.containers.find(c => c.id === containerId)
    if (container) return container
  }
  return null
}

export function calculateContainersNeeded(
  family: string,
  containerId: string,
  totalQuantityKg: number
): number {
  const container = getContainerType(containerId)
  if (!container) return 0
  
  // Converter kg para gramas ou ml conforme o tipo
  const totalCapacity = container.capacityWeightG > 0 
    ? totalQuantityKg * 1000 // kg para gramas
    : totalQuantityKg * 1000 // kg para ml (aproximação)
  
  const containerCapacity = container.capacityWeightG > 0 
    ? container.capacityWeightG 
    : container.capacityMl
  
  return Math.ceil(totalCapacity / containerCapacity)
}

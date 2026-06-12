export interface Vaga {
  id: number;
  codigo: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  latitude: number;
  longitude: number;
  tamanho?: string;
  horariosDisponiveis?: string;
  tiposVeiculos?: string;
  valorMinuto?: number;
  limiteTempo: number;
  ativa: boolean;
  status: "LIVRE" | "OCUPADA" | "IRREGULAR";
  sessaoAtual?: SessaoAtual;
}

export interface SessaoAtual {
  id: number;
  iniciadaEm: string;
  minutosRestantes: number;
  veiculo: {
    placa: string;
  };
}

export interface Veiculo {
  id: number;
  placa: string;
  renavam: string;
  tipo: "CAMINHAO" | "VAN" | "UTILITARIO";
  empresaId?: number;
  motoristaId?: number;
}

export interface Sessao {
  id: number;
  vagaId: number;
  veiculoId: number;
  motoristaId?: number;
  iniciadaEm: string;
  encerradaEm: string | null;
  status: "ATIVA" | "ENCERRADA" | "EXPIRADA";
  valorCobrado?: number;
  minutosRestantes?: number;
  valorAtual?: number;
  vaga?: Vaga;
  veiculo?: Veiculo;
}

export interface Infracao {
  id: number;
  vagaId: number;
  veiculoId?: number;
  placaAvulsa: string | null;
  motivo: "SEM_CHECKIN" | "TEMPO_EXPIRADO" | "VEICULO_NAO_AUTORIZADO";
  observacao: string | null;
  registradaEm: string;
  vaga?: Vaga;
  veiculo?: Veiculo;
}

export interface ResumoRelatorio {
  totalVagas: number;
  vagasLivres: number;
  vagasOcupadas: number;
  vagasIrregulares: number;
  totalSessoesHoje: number;
  totalInfracoesHoje: number;
  vagaMaisUsada: string | null;
}

export interface MapaCalorItem {
  vagaId: number;
  codigo: string;
  lat: number;
  lng: number;
  totalSessoes30dias: number;
}

export interface Empresa {
  id: number;
  cnpj: string;
  nome: string;
  tipo: string;
  creditos: number;
  veiculos?: Veiculo[];
}

export interface Motorista {
  id: number;
  cpf: string;
  nome: string;
  creditos: number;
  status: string;
  veiculos?: Veiculo[];
}

export interface Vaga {
  id: number;
  codigo: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  latitude: number;
  longitude: number;
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
    empresa: string;
  };
}

export interface Veiculo {
  id: number;
  placa: string;
  renavam: string;
  cnpj: string;
  empresa: string;
  tipo: "CAMINHAO" | "VAN" | "UTILITARIO";
}

export interface Fiscal {
  id: number;
  nome: string;
  matricula: string;
  setor: string;
}

export interface Sessao {
  id: number;
  vagaId: number;
  veiculoId: number;
  iniciadaEm: string;
  encerradaEm: string | null;
  status: "ATIVA" | "ENCERRADA" | "EXPIRADA";
  minutosRestantes?: number;
  vaga?: Vaga;
  veiculo?: Veiculo;
}

export interface Infracao {
  id: number;
  vagaId: number;
  fiscalId: number;
  placaAvulsa: string | null;
  motivo: "SEM_CHECKIN" | "TEMPO_EXPIRADO" | "VEICULO_NAO_AUTORIZADO";
  observacao: string | null;
  registradaEm: string;
  vaga?: Vaga;
  fiscal?: Fiscal;
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

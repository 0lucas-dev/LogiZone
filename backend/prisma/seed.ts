import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  // Limpa banco (ordem correta para respeitar FKs)
  await prisma.atribuicaoVeiculo.deleteMany();
  await prisma.infracao.deleteMany();
  await prisma.sessao.deleteMany();
  await prisma.vinculo.deleteMany();
  await prisma.veiculo.deleteMany();
  await prisma.motorista.deleteMany();
  await prisma.empresa.deleteMany();

  await prisma.vaga.deleteMany();



  // Empresas
  const empresa1 = await prisma.empresa.create({
    data: { cnpj: "00.000.000/0001-00", nome: "TransLog", tipo: "EMPRESA", senha: "123456", creditos: 500.0 },
  });
  const empresa2 = await prisma.empresa.create({
    data: { cnpj: "11.111.111/0001-11", nome: "LogExpress", tipo: "EMPRESA", senha: "123456", creditos: 300.0 },
  });

  // Motoristas
  const motorista1 = await prisma.motorista.create({
    data: { cpf: "111.111.111-11", nome: "Carlos Motorista", senha: "123456", idade: 35, creditos: 100.0 },
  });
  const motorista2 = await prisma.motorista.create({
    data: { cpf: "222.222.222-22", nome: "Ana Motorista", senha: "123456", idade: 28, creditos: 50.0 },
  });

  // Veículos (vinculados a empresas)
  const veiculo1 = await prisma.veiculo.create({
    data: { placa: "ABC1234", renavam: "11111111111", empresaId: empresa1.id, tipo: "CAMINHAO" },
  });
  const veiculo2 = await prisma.veiculo.create({
    data: { placa: "XYZ9876", renavam: "22222222222", empresaId: empresa2.id, tipo: "VAN" },
  });
  // Veículo pessoal do motorista
  const veiculo3 = await prisma.veiculo.create({
    data: { placa: "DEF5678", renavam: "33333333333", motoristaId: motorista1.id, tipo: "UTILITARIO" },
  });

  // Vincular motoristas a empresas
  await prisma.vinculo.create({
    data: { motoristaId: motorista1.id, empresaId: empresa1.id, status: "ATIVO", tipoAcesso: "FIXO" },
  });
  await prisma.vinculo.create({
    data: { motoristaId: motorista2.id, empresaId: empresa2.id, status: "ATIVO", tipoAcesso: "FIXO" },
  });

  // Atribuir veículos de empresa a motoristas
  await prisma.atribuicaoVeiculo.create({
    data: { veiculoId: veiculo1.id, motoristaId: motorista1.id },
  });
  await prisma.atribuicaoVeiculo.create({
    data: { veiculoId: veiculo2.id, motoristaId: motorista2.id },
  });

  // Vagas
  const vagasData = [
    { codigo: "VAGA-001", logradouro: "Av. Sampaio Vidal", numero: "100", bairro: "Centro", cidade: "Marília", latitude: -22.2139, longitude: -49.9458, tamanho: "CAMINHAO", valorMinuto: 1.50, limiteTempo: 45, horariosDisponiveis: "08:00 - 18:00", tiposVeiculos: "CAMINHAO" },
    { codigo: "VAGA-002", logradouro: "Rua São Luiz", numero: "200", bairro: "Centro", cidade: "Marília", latitude: -22.2150, longitude: -49.9470, tamanho: "VAN", valorMinuto: 1.00, limiteTempo: 45, horariosDisponiveis: "08:00 - 18:00", tiposVeiculos: "VAN, UTILITARIO" },
    { codigo: "VAGA-003", logradouro: "Rua Nove de Julho", numero: "300", bairro: "Centro", cidade: "Marília", latitude: -22.2145, longitude: -49.9460, tamanho: "UTILITARIO", valorMinuto: 0.75, limiteTempo: 30, horariosDisponiveis: "08:00 - 18:00", tiposVeiculos: "UTILITARIO" },
    { codigo: "VAGA-004", logradouro: "Av. Tiradentes", numero: "400", bairro: "Fragata", cidade: "Marília", latitude: -22.2180, longitude: -49.9480, tamanho: "CAMINHAO", valorMinuto: 2.00, limiteTempo: 60, horariosDisponiveis: "08:00 - 18:00", tiposVeiculos: "TODOS" },
    { codigo: "VAGA-005", logradouro: "Av. Rio Branco", numero: "500", bairro: "Alto Cafezal", cidade: "Marília", latitude: -22.2120, longitude: -49.9500, tamanho: "VAN", valorMinuto: 1.25, limiteTempo: 45, horariosDisponiveis: "08:00 - 18:00", tiposVeiculos: "VAN" },
    { codigo: "VAGA-006", logradouro: "Rua Bahia", numero: "600", bairro: "Cascata", cidade: "Marília", latitude: -22.2110, longitude: -49.9490, tamanho: "UTILITARIO", valorMinuto: 0.50, limiteTempo: 30, horariosDisponiveis: "08:00 - 18:00", tiposVeiculos: "UTILITARIO" },
    { codigo: "VAGA-007", logradouro: "Rua Paraná", numero: "700", bairro: "Centro", cidade: "Marília", latitude: -22.2160, longitude: -49.9450, tamanho: "CAMINHAO", valorMinuto: 1.75, limiteTempo: 45, horariosDisponiveis: "08:00 - 18:00", tiposVeiculos: "CAMINHAO" },
    { codigo: "VAGA-008", logradouro: "Av. Santo Antônio", numero: "800", bairro: "Polonês", cidade: "Marília", latitude: -22.2200, longitude: -49.9550, tamanho: "VAN", valorMinuto: 1.00, limiteTempo: 45, horariosDisponiveis: "08:00 - 18:00", tiposVeiculos: "VAN, UTILITARIO" },
  ];

  const vagas = [];
  for (const v of vagasData) {
    vagas.push(await prisma.vaga.create({ data: v }));
  }

  // Sessões
  // Sessão 1: ATIVA (dentro do tempo) - vaga 1, veiculo 1, motorista 1 paga pela empresa
  await prisma.sessao.create({
    data: {
      vagaId: vagas[0].id,
      veiculoId: veiculo1.id,
      motoristaId: motorista1.id,
      pagadorTipo: "EMPRESA",
      pagadorId: empresa1.id,
      status: "ATIVA",
      iniciadaEm: new Date(Date.now() - 10 * 60 * 1000) // 10 min atrás
    }
  });

  // Sessão 2: ENCERRADA - vaga 3, veiculo 3, motorista 1 pagou pessoalmente
  await prisma.sessao.create({
    data: {
      vagaId: vagas[2].id,
      veiculoId: veiculo3.id,
      motoristaId: motorista1.id,
      pagadorTipo: "MOTORISTA",
      pagadorId: motorista1.id,
      status: "ENCERRADA",
      valorCobrado: 22.50,
      iniciadaEm: new Date(Date.now() - 60 * 60 * 1000),
      encerradaEm: new Date(Date.now() - 30 * 60 * 1000)
    }
  });

  // Infrações
  await prisma.infracao.create({
    data: {
      vagaId: vagas[1].id,
      veiculoId: veiculo2.id,
      motivo: "TEMPO_EXPIRADO",
      observacao: "Sessão expirada identificada durante patrulha."
    }
  });

  await prisma.infracao.create({
    data: {
      vagaId: vagas[3].id,
      placaAvulsa: "KKK0000",
      motivo: "SEM_CHECKIN",
      observacao: "Carro de passeio estacionado em vaga de carga/descarga."
    }
  });

  console.log("Seed concluído!");
  console.log("---");
  console.log("Motorista 1: CPF=111.111.111-11, Senha=123456");
  console.log("Motorista 2: CPF=222.222.222-22, Senha=123456");
  console.log("Empresa 1: CNPJ=00.000.000/0001-00, Senha=123456");
  console.log("Empresa 2: CNPJ=11.111.111/0001-11, Senha=123456");
  console.log("Prefeitura: Qualquer login funciona");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

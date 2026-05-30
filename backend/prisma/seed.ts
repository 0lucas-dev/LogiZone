import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  // Limpa banco
  await prisma.infracao.deleteMany();
  await prisma.sessao.deleteMany();
  await prisma.veiculo.deleteMany();
  await prisma.fiscal.deleteMany();
  await prisma.vaga.deleteMany();

  // Fiscais
  const fiscal1 = await prisma.fiscal.create({
    data: { nome: "João Fiscal", matricula: "F123", setor: "Zona Sul" },
  });
  const fiscal2 = await prisma.fiscal.create({
    data: { nome: "Maria Fiscal", matricula: "F456", setor: "Centro" },
  });

  // Veículos
  const veiculo1 = await prisma.veiculo.create({
    data: { placa: "ABC1234", renavam: "11111111111", cnpj: "00.000.000/0001-00", empresa: "TransLog", tipo: "CAMINHAO" },
  });
  const veiculo2 = await prisma.veiculo.create({
    data: { placa: "XYZ9876", renavam: "22222222222", cnpj: "11.111.111/0001-11", empresa: "LogExpress", tipo: "VAN" },
  });
  const veiculo3 = await prisma.veiculo.create({
    data: { placa: "DEF5678", renavam: "33333333333", cnpj: "22.222.222/0001-22", empresa: "RápidoCarga", tipo: "UTILITARIO" },
  });

  // Vagas
  const vagasData = [
    { codigo: "VAGA-001", logradouro: "Av. Paulista", numero: "1000", bairro: "Bela Vista", cidade: "São Paulo", latitude: -23.565, longitude: -46.652 },
    { codigo: "VAGA-002", logradouro: "Av. Paulista", numero: "2000", bairro: "Consolação", cidade: "São Paulo", latitude: -23.559, longitude: -46.659 },
    { codigo: "VAGA-003", logradouro: "Rua Augusta", numero: "1500", bairro: "Consolação", cidade: "São Paulo", latitude: -23.556, longitude: -46.657 },
    { codigo: "VAGA-004", logradouro: "Rua Oscar Freire", numero: "800", bairro: "Jardim Paulista", cidade: "São Paulo", latitude: -23.564, longitude: -46.666 },
    { codigo: "VAGA-005", logradouro: "Av. Brigadeiro Faria Lima", numero: "3000", bairro: "Itaim Bibi", cidade: "São Paulo", latitude: -23.582, longitude: -46.680 },
    { codigo: "VAGA-006", logradouro: "Rua Amauri", numero: "200", bairro: "Itaim Bibi", cidade: "São Paulo", latitude: -23.581, longitude: -46.682 },
    { codigo: "VAGA-007", logradouro: "Av. Eng. Luís Carlos Berrini", numero: "1500", bairro: "Cidade Monções", cidade: "São Paulo", latitude: -23.606, longitude: -46.694 },
    { codigo: "VAGA-008", logradouro: "Av. das Nações Unidas", numero: "12901", bairro: "Brooklin Paulista", cidade: "São Paulo", latitude: -23.608, longitude: -46.697 },
  ];

  const vagas = [];
  for (const v of vagasData) {
    vagas.push(await prisma.vaga.create({ data: v }));
  }

  // Sessões
  // Sessão 1: ATIVA (dentro do tempo) - usa vaga 1, veiculo 1
  const sessaoAtiva = await prisma.sessao.create({
    data: {
      vagaId: vagas[0].id,
      veiculoId: veiculo1.id,
      status: "ATIVA",
      iniciadaEm: new Date(Date.now() - 10 * 60 * 1000) // 10 min atrás
    }
  });

  // Sessão 2: EXPIRADA (passou do tempo, limite é 45) - usa vaga 2, veiculo 2
  const sessaoExpirada = await prisma.sessao.create({
    data: {
      vagaId: vagas[1].id,
      veiculoId: veiculo2.id,
      status: "EXPIRADA",
      iniciadaEm: new Date(Date.now() - 120 * 60 * 1000) // 2h atrás
    }
  });

  // Sessão 3: ENCERRADA
  const sessaoEncerrada = await prisma.sessao.create({
    data: {
      vagaId: vagas[2].id,
      veiculoId: veiculo3.id,
      status: "ENCERRADA",
      iniciadaEm: new Date(Date.now() - 60 * 60 * 1000), // 1h atrás
      encerradaEm: new Date(Date.now() - 30 * 60 * 1000) // 30 min atrás
    }
  });

  // Infrações
  await prisma.infracao.create({
    data: {
      vagaId: vagas[1].id,
      veiculoId: veiculo2.id,
      fiscalId: fiscal1.id,
      motivo: "TEMPO_EXPIRADO",
      observacao: "Sessão expirada identificada durante patrulha."
    }
  });

  await prisma.infracao.create({
    data: {
      vagaId: vagas[3].id,
      fiscalId: fiscal2.id,
      placaAvulsa: "KKK0000",
      motivo: "SEM_CHECKIN",
      observacao: "Carro de passeio estacionado em vaga de carga/descarga."
    }
  });

  console.log("Seed concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Script para criar 20 personais fictícios para teste
// Executar com: npx tsx scripts/seed-personals.ts

import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";

const PERSONAIS = [
  // 10 mulheres
  { nome: "Ana", sobrenome: "Oliveira", sexo: "feminino", email: "ana.oliveira@teste.com", telefone: "(11) 91001-0001", cpf: "111.111.111-01", cref: "012345-G/SP", modalidades: ["Musculação", "Funcional", "Yoga"], regioes: ["Alphaville, Barueri - SP"], disponibilidade: { seg: ["06:00","07:00","08:00","18:00","19:00","20:00"], ter: ["06:00","07:00","08:00"], qua: ["06:00","07:00","08:00","18:00","19:00","20:00"], qui: ["06:00","07:00","08:00"], sex: ["06:00","07:00","08:00","18:00","19:00","20:00"], sab: ["08:00","09:00","10:00"], dom: [] } },
  { nome: "Beatriz", sobrenome: "Santos", sexo: "feminino", email: "bia.santos@teste.com", telefone: "(11) 91001-0002", cpf: "111.111.111-02", cref: "012346-G/SP", modalidades: ["Pilates", "Alongamento", "Funcional"], regioes: ["Tamboré, Barueri - SP"], disponibilidade: { seg: ["07:00","08:00","09:00","10:00"], ter: ["07:00","08:00","09:00","10:00"], qua: ["07:00","08:00","09:00","10:00"], qui: ["07:00","08:00","09:00","10:00"], sex: ["07:00","08:00","09:00","10:00"], sab: [], dom: [] } },
  { nome: "Camila", sobrenome: "Ferreira", sexo: "feminino", email: "camila.f@teste.com", telefone: "(11) 91001-0003", cpf: "111.111.111-03", cref: "012347-G/SP", modalidades: ["Musculação", "Hipertrofia", "Emagrecimento"], regioes: ["Moema, São Paulo - SP"], disponibilidade: { seg: ["14:00","15:00","16:00","17:00","18:00"], ter: [], qua: ["14:00","15:00","16:00","17:00","18:00"], qui: [], sex: ["14:00","15:00","16:00","17:00","18:00"], sab: ["09:00","10:00","11:00"], dom: [] } },
  { nome: "Daniela", sobrenome: "Costa", sexo: "feminino", email: "dani.costa@teste.com", telefone: "(11) 91001-0004", cpf: "111.111.111-04", cref: "012348-G/SP", modalidades: ["Crossfit", "Funcional", "Preparação Física"], regioes: ["Vila Olímpia, São Paulo - SP"], disponibilidade: { seg: ["05:00","06:00","07:00"], ter: ["05:00","06:00","07:00"], qua: ["05:00","06:00","07:00"], qui: ["05:00","06:00","07:00"], sex: ["05:00","06:00","07:00"], sab: ["07:00","08:00","09:00"], dom: ["07:00","08:00"] } },
  { nome: "Eduarda", sobrenome: "Lima", sexo: "feminino", email: "edu.lima@teste.com", telefone: "(11) 91001-0005", cpf: "111.111.111-05", cref: "012349-G/SP", modalidades: ["Yoga", "Pilates", "Alongamento", "Reabilitação"], regioes: ["Pinheiros, São Paulo - SP"], disponibilidade: { seg: ["09:00","10:00","11:00","14:00","15:00"], ter: ["09:00","10:00","11:00","14:00","15:00"], qua: ["09:00","10:00","11:00"], qui: ["09:00","10:00","11:00","14:00","15:00"], sex: ["09:00","10:00","11:00"], sab: [], dom: [] } },
  { nome: "Fernanda", sobrenome: "Souza", sexo: "feminino", email: "fer.souza@teste.com", telefone: "(11) 91001-0006", cpf: "111.111.111-06", cref: "012350-G/SP", modalidades: ["Dança", "Funcional", "Emagrecimento"], regioes: ["Itaim Bibi, São Paulo - SP"], disponibilidade: { seg: ["17:00","18:00","19:00","20:00","21:00"], ter: ["17:00","18:00","19:00","20:00","21:00"], qua: ["17:00","18:00","19:00","20:00","21:00"], qui: ["17:00","18:00","19:00","20:00","21:00"], sex: ["17:00","18:00","19:00","20:00","21:00"], sab: [], dom: [] } },
  { nome: "Gabriela", sobrenome: "Almeida", sexo: "feminino", email: "gabi.almeida@teste.com", telefone: "(11) 91001-0007", cpf: "111.111.111-07", cref: "012351-G/SP", modalidades: ["Musculação", "Funcional", "Corrida"], regioes: ["Alphaville, Barueri - SP", "Tamboré, Barueri - SP"], disponibilidade: { seg: ["06:00","07:00","08:00","09:00","10:00","11:00"], ter: ["06:00","07:00","08:00","09:00","10:00","11:00"], qua: ["06:00","07:00","08:00","09:00","10:00","11:00"], qui: ["06:00","07:00","08:00","09:00","10:00","11:00"], sex: ["06:00","07:00","08:00","09:00","10:00","11:00"], sab: ["07:00","08:00","09:00","10:00"], dom: [] } },
  { nome: "Helena", sobrenome: "Ribeiro", sexo: "feminino", email: "helena.r@teste.com", telefone: "(11) 91001-0008", cpf: "111.111.111-08", cref: "012352-G/SP", modalidades: ["Natação", "Funcional", "Reabilitação"], regioes: ["Santana, São Paulo - SP"], disponibilidade: { seg: ["08:00","09:00","10:00"], ter: ["08:00","09:00","10:00","14:00","15:00"], qua: ["08:00","09:00","10:00"], qui: ["08:00","09:00","10:00","14:00","15:00"], sex: ["08:00","09:00","10:00"], sab: ["08:00","09:00"], dom: [] } },
  { nome: "Isabela", sobrenome: "Rodrigues", sexo: "feminino", email: "isa.rodrigues@teste.com", telefone: "(11) 91001-0009", cpf: "111.111.111-09", cref: "012353-G/SP", modalidades: ["Luta / Artes Marciais", "Funcional", "Preparação Física"], regioes: ["Perdizes, São Paulo - SP"], disponibilidade: { seg: ["16:00","17:00","18:00","19:00"], ter: ["16:00","17:00","18:00","19:00"], qua: ["16:00","17:00","18:00","19:00"], qui: ["16:00","17:00","18:00","19:00"], sex: ["16:00","17:00","18:00","19:00"], sab: ["10:00","11:00","12:00"], dom: [] } },
  { nome: "Juliana", sobrenome: "Pereira", sexo: "feminino", email: "ju.pereira@teste.com", telefone: "(11) 91001-0010", cpf: "111.111.111-10", cref: "012354-G/SP", modalidades: ["Musculação", "Emagrecimento", "Hipertrofia"], regioes: ["Brooklin, São Paulo - SP"], disponibilidade: { seg: ["06:00","07:00","08:00","18:00","19:00"], ter: ["06:00","07:00","08:00","18:00","19:00"], qua: ["06:00","07:00","08:00","18:00","19:00"], qui: ["06:00","07:00","08:00","18:00","19:00"], sex: ["06:00","07:00","08:00"], sab: ["08:00","09:00","10:00"], dom: [] } },
  // 10 homens
  { nome: "Rafael", sobrenome: "Mendes", sexo: "masculino", email: "rafa.mendes@teste.com", telefone: "(11) 91001-0011", cpf: "111.111.111-11", cref: "012355-G/SP", modalidades: ["Musculação", "Hipertrofia", "Preparação Física"], regioes: ["Alphaville, Barueri - SP"], disponibilidade: { seg: ["05:00","06:00","07:00","08:00","17:00","18:00","19:00","20:00"], ter: ["05:00","06:00","07:00","08:00","17:00","18:00","19:00","20:00"], qua: ["05:00","06:00","07:00","08:00","17:00","18:00","19:00","20:00"], qui: ["05:00","06:00","07:00","08:00","17:00","18:00","19:00","20:00"], sex: ["05:00","06:00","07:00","08:00","17:00","18:00","19:00","20:00"], sab: ["07:00","08:00","09:00","10:00"], dom: [] } },
  { nome: "Lucas", sobrenome: "Carvalho", sexo: "masculino", email: "lucas.c@teste.com", telefone: "(11) 91001-0012", cpf: "111.111.111-12", cref: "012356-G/SP", modalidades: ["Crossfit", "Funcional", "Corrida"], regioes: ["Tamboré, Barueri - SP", "Alphaville, Barueri - SP"], disponibilidade: { seg: ["06:00","07:00","08:00","09:00"], ter: ["06:00","07:00","08:00","09:00"], qua: ["06:00","07:00","08:00","09:00"], qui: ["06:00","07:00","08:00","09:00"], sex: ["06:00","07:00","08:00","09:00"], sab: ["08:00","09:00","10:00","11:00"], dom: ["08:00","09:00"] } },
  { nome: "Pedro", sobrenome: "Gomes", sexo: "masculino", email: "pedro.g@teste.com", telefone: "(11) 91001-0013", cpf: "111.111.111-13", cref: "012357-G/SP", modalidades: ["Musculação", "Funcional", "Emagrecimento"], regioes: ["Moema, São Paulo - SP", "Vila Olímpia, São Paulo - SP"], disponibilidade: { seg: ["10:00","11:00","12:00","13:00","14:00"], ter: ["10:00","11:00","12:00","13:00","14:00"], qua: ["10:00","11:00","12:00","13:00","14:00"], qui: ["10:00","11:00","12:00","13:00","14:00"], sex: ["10:00","11:00","12:00","13:00","14:00"], sab: [], dom: [] } },
  { nome: "Thiago", sobrenome: "Araújo", sexo: "masculino", email: "thiago.a@teste.com", telefone: "(11) 91001-0014", cpf: "111.111.111-14", cref: "012358-G/SP", modalidades: ["Luta / Artes Marciais", "Preparação Física", "Funcional"], regioes: ["Pinheiros, São Paulo - SP"], disponibilidade: { seg: ["18:00","19:00","20:00","21:00"], ter: ["18:00","19:00","20:00","21:00"], qua: ["18:00","19:00","20:00","21:00"], qui: ["18:00","19:00","20:00","21:00"], sex: ["18:00","19:00","20:00","21:00"], sab: ["09:00","10:00","11:00"], dom: [] } },
  { nome: "Bruno", sobrenome: "Silva", sexo: "masculino", email: "bruno.s@teste.com", telefone: "(11) 91001-0015", cpf: "111.111.111-15", cref: "012359-G/SP", modalidades: ["Musculação", "Hipertrofia", "Funcional"], regioes: ["Itaim Bibi, São Paulo - SP", "Brooklin, São Paulo - SP"], disponibilidade: { seg: ["06:00","07:00","08:00","09:00","10:00"], ter: ["06:00","07:00","08:00","09:00","10:00"], qua: ["06:00","07:00","08:00","09:00","10:00"], qui: ["06:00","07:00","08:00","09:00","10:00"], sex: ["06:00","07:00","08:00","09:00","10:00"], sab: ["07:00","08:00","09:00"], dom: [] } },
  { nome: "Diego", sobrenome: "Nascimento", sexo: "masculino", email: "diego.n@teste.com", telefone: "(11) 91001-0016", cpf: "111.111.111-16", cref: "012360-G/SP", modalidades: ["Yoga", "Pilates", "Reabilitação", "Alongamento"], regioes: ["Perdizes, São Paulo - SP", "Pompeia, São Paulo - SP"], disponibilidade: { seg: ["07:00","08:00","09:00","10:00","11:00"], ter: ["07:00","08:00","09:00","10:00","11:00"], qua: ["07:00","08:00","09:00","10:00","11:00"], qui: ["07:00","08:00","09:00","10:00","11:00"], sex: ["07:00","08:00","09:00","10:00","11:00"], sab: ["08:00","09:00","10:00"], dom: ["08:00","09:00"] } },
  { nome: "Felipe", sobrenome: "Martins", sexo: "masculino", email: "felipe.m@teste.com", telefone: "(11) 91001-0017", cpf: "111.111.111-17", cref: "012361-G/SP", modalidades: ["Natação", "Funcional", "Corrida"], regioes: ["Santana, São Paulo - SP", "Tucuruvi, São Paulo - SP"], disponibilidade: { seg: ["05:00","06:00","16:00","17:00","18:00"], ter: ["05:00","06:00","16:00","17:00","18:00"], qua: ["05:00","06:00","16:00","17:00","18:00"], qui: ["05:00","06:00","16:00","17:00","18:00"], sex: ["05:00","06:00","16:00","17:00","18:00"], sab: ["06:00","07:00","08:00"], dom: [] } },
  { nome: "Gustavo", sobrenome: "Barbosa", sexo: "masculino", email: "gustavo.b@teste.com", telefone: "(11) 91001-0018", cpf: "111.111.111-18", cref: "012362-G/SP", modalidades: ["Musculação", "Emagrecimento", "Funcional", "Corrida"], regioes: ["Alphaville, Barueri - SP", "Aldeia da Serra, Santana de Parnaíba - SP"], disponibilidade: { seg: ["06:00","07:00","08:00","09:00","10:00","18:00","19:00","20:00"], ter: ["06:00","07:00","08:00","09:00","10:00","18:00","19:00","20:00"], qua: ["06:00","07:00","08:00","09:00","10:00","18:00","19:00","20:00"], qui: ["06:00","07:00","08:00","09:00","10:00","18:00","19:00","20:00"], sex: ["06:00","07:00","08:00","09:00","10:00"], sab: ["07:00","08:00","09:00","10:00","11:00"], dom: ["08:00","09:00","10:00"] } },
  { nome: "Henrique", sobrenome: "Moreira", sexo: "masculino", email: "henrique.m@teste.com", telefone: "(11) 91001-0019", cpf: "111.111.111-19", cref: "012363-G/SP", modalidades: ["Dança", "Funcional", "Alongamento"], regioes: ["Vila Madalena, São Paulo - SP"], disponibilidade: { seg: ["15:00","16:00","17:00","18:00","19:00","20:00"], ter: ["15:00","16:00","17:00","18:00","19:00","20:00"], qua: [], qui: ["15:00","16:00","17:00","18:00","19:00","20:00"], sex: ["15:00","16:00","17:00","18:00","19:00","20:00"], sab: ["10:00","11:00","12:00"], dom: [] } },
  { nome: "Igor", sobrenome: "Teixeira", sexo: "masculino", email: "igor.t@teste.com", telefone: "(11) 91001-0020", cpf: "111.111.111-20", cref: "012364-G/SP", modalidades: ["Crossfit", "Musculação", "Hipertrofia", "Preparação Física"], regioes: ["Alphaville, Barueri - SP", "Tamboré, Barueri - SP", "Granja Viana, Cotia - SP"], disponibilidade: { seg: ["05:00","06:00","07:00","08:00","09:00","10:00","11:00"], ter: ["05:00","06:00","07:00","08:00","09:00","10:00","11:00"], qua: ["05:00","06:00","07:00","08:00","09:00","10:00","11:00"], qui: ["05:00","06:00","07:00","08:00","09:00","10:00","11:00"], sex: ["05:00","06:00","07:00","08:00","09:00","10:00","11:00"], sab: ["06:00","07:00","08:00","09:00","10:00"], dom: ["07:00","08:00","09:00"] } },
];

const PLANOS = ["start", "pro", "elite"];
const FORMACOES = ["Graduado em Educação Física", "Pós-graduado em Educação Física", "Graduado em Fisioterapia"];
const VALORES = ["100", "120", "150", "180", "200"];

async function main() {
  const senha = await bcrypt.hash("Teste@123", 12);

  for (let i = 0; i < PERSONAIS.length; i++) {
    const p = PERSONAIS[i];
    const cpfLimpo = p.cpf.replace(/\D/g, "");

    // Verificar se já existe
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email: p.email }, { cpf: p.cpf }, { telefone: p.telefone }] },
    });
    if (exists) {
      console.log(`⏭  ${p.nome} ${p.sobrenome} já existe, pulando...`);
      continue;
    }

    await prisma.user.create({
      data: {
        tipo: "personal",
        status: "ativo",
        nome: p.nome,
        sobrenome: p.sobrenome,
        email: p.email,
        senha,
        telefone: p.telefone,
        isWhatsapp: true,
        isTelefone: false,
        dataNascimento: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}/${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}/${1985 + Math.floor(Math.random() * 10)}`,
        sexo: p.sexo,
        cpf: p.cpf,
        cep: "06454-000",
        rua: "Alameda Rio Negro",
        bairro: "Alphaville",
        cidade: "Barueri",
        estado: "SP",
        numero: String(100 + i * 10),
        cref: p.cref,
        validadeCref: `12/${2027 + Math.floor(Math.random() * 3)}`,
        formacao: FORMACOES[i % FORMACOES.length],
        rg: `${30 + i}.${100 + i * 3}.${200 + i * 7}-${i}`,
        academias: JSON.stringify([]),
        modalidades: JSON.stringify(p.modalidades),
        regioes: JSON.stringify(p.regioes),
        preferenciaGeneroAluno: "ambos",
        disponivelEmCasa: i % 3 === 0,
        disponibilidade: JSON.stringify(p.disponibilidade),
        valorAproximado: VALORES[i % VALORES.length],
        tipoChavePix: "cpf",
        chavePix: cpfLimpo,
        plano: PLANOS[i % PLANOS.length],
        planoAtivo: true,
        planoInicio: new Date(),
        planoFim: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // +60 dias
        verificado: true,
      },
    });
    console.log(`✅ ${i + 1}/20 — ${p.nome} ${p.sobrenome} (${p.sexo}) criado`);
  }

  console.log("\n🎉 Seed concluído! 20 personais fictícios criados.");
  console.log("   Senha de todos: Teste@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

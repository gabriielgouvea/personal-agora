import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const [
    totalAlunos,
    totalPersonais,
    personaisPendentes,
    alunosMulheres,
    alunosHomens,
    personaisMulheres,
    personaisHomens,
    totalAcademias,
    totalConvites,
    totalCupons,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { tipo: "aluno" } }),
    prisma.user.count({ where: { tipo: "personal" } }),
    prisma.user.count({ where: { tipo: "personal", status: "pendente" } }),
    prisma.user.count({ where: { tipo: "aluno", sexo: "feminino" } }),
    prisma.user.count({ where: { tipo: "aluno", sexo: "masculino" } }),
    prisma.user.count({ where: { tipo: "personal", sexo: "feminino" } }),
    prisma.user.count({ where: { tipo: "personal", sexo: "masculino" } }),
    prisma.academia.count(),
    prisma.convite.count(),
    prisma.cupom.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        tipo: true,
        nome: true,
        sobrenome: true,
        email: true,
        status: true,
        createdAt: true,
        avatarUrl: true,
      },
    }),
  ]);

  return NextResponse.json({
    totalAlunos,
    totalPersonais,
    personaisPendentes,
    alunosMulheres,
    alunosHomens,
    personaisMulheres,
    personaisHomens,
    totalAcademias,
    totalConvites,
    totalCupons,
    totalUsuarios: totalAlunos + totalPersonais,
    recentUsers,
    // Faturamento placeholder
    faturamentoTotal: 0,
    faturamentoMes: 0,
  });
}

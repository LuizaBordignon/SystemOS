import { prisma } from '../src/config/database';
import { TipoUsuario } from '../src/generated/prisma/enums';
import bcrypt from 'bcrypt';

async function main() {
  const emailAdmin = 'admin@sistemaos.com';

  // Evita criar o admin duas vezes se você rodar o seed mais de uma vez
  const jaExiste = await prisma.usuario.findUnique({ where: { email: emailAdmin } });
  if (jaExiste) {
    console.log('Usuário admin já existe, nada a fazer.');
    return;
  }

  // Nunca salvamos a senha em texto puro — o bcrypt gera um hash irreversível.
  // O "10" é o número de "rounds" de criptografia (padrão de mercado).
  const senhaHash = await bcrypt.hash('admin123', 10);

  await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: emailAdmin,
      senhaHash,
      tipo: TipoUsuario.ADMIN,
    },
  });

  console.log('Usuário admin criado com sucesso! Login: admin@sistemaos.com / Senha: admin123');
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
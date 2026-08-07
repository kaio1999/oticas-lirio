/** Traduz mensagens comuns do Supabase Auth / Postgres para português. */
export function translateAdminError(raw: string | null | undefined): string {
  if (!raw) return "Ocorreu um erro. Tente novamente.";

  const msg = raw.trim();
  const lower = msg.toLowerCase();

  // Códigos internos do app
  const codes: Record<string, string> = {
    campos: "Preencha todos os campos obrigatórios corretamente.",
    foto: "Adicione ao menos uma foto do produto.",
    config:
      "Configuração do servidor incompleta (chave secret do Supabase ausente).",
    dono: "A dona não pode remover o próprio papel de owner.",
    falha: "Não foi possível concluir a operação.",
    id: "Produto não encontrado.",
    "id-invalido":
      "ID inválido. Use apenas letras, números e hífens (sem espaços).",
    "sem-permissao": "Você não tem permissão para essa ação.",
    "sem-acesso":
      "Conta sem acesso ao admin. Confira se o perfil foi criado no banco.",
    credenciais: "E-mail ou senha incorretos.",
  };
  if (codes[msg]) return codes[msg];

  if (lower.includes("duplicate key") && lower.includes("sku")) {
    return "Já existe um produto com este SKU.";
  }
  if (lower.includes("user already registered")) {
    return "Este e-mail já está cadastrado.";
  }
  if (lower.includes("email address") && lower.includes("invalid")) {
    return "E-mail inválido.";
  }
  if (lower.includes("password") && lower.includes("at least")) {
    return "A senha precisa ter no mínimo 6 caracteres (use 8 ou mais).";
  }
  if (lower.includes("password") && lower.includes("weak")) {
    return "Senha muito fraca. Use letras e números.";
  }
  if (
    lower.includes("invalid login") ||
    lower.includes("invalid credentials")
  ) {
    return "E-mail ou senha incorretos.";
  }
  if (lower.includes("email not confirmed")) {
    return "E-mail ainda não confirmado. No Auth do Supabase, marque como confirmado.";
  }
  if (lower.includes("user not found")) {
    return "Usuário não encontrado.";
  }
  if (lower.includes("signup is disabled")) {
    return "Cadastro de novos usuários está desativado no Supabase.";
  }

  // Database / RLS
  if (lower.includes("duplicate key") || lower.includes("unique constraint")) {
    return "Já existe um registro com esses dados (e-mail ou id duplicado).";
  }
  if (lower.includes("row-level security") || lower.includes("rls")) {
    return "Sem permissão no banco (RLS). Confira se seu perfil tem acesso.";
  }
  if (lower.includes("permission denied")) {
    return "Permissão negada no banco. Rode o admin-schema.sql e os grants.";
  }
  if (lower.includes("foreign key")) {
    return "Referência inválida (usuário ou produto relacionado não existe).";
  }
  if (lower.includes("violates check constraint")) {
    return "Algum campo está com valor inválido.";
  }
  if (lower.includes("maximum size") || lower.includes("payload too large") || lower.includes("8 mb")) {
    return "Arquivo muito grande. Use fotos de até 8 MB.";
  }
  if (lower.includes("mime type") || lower.includes("invalid content")) {
    return "Formato de imagem não suportado. Use JPG, PNG ou WebP.";
  }
  if (lower.includes("bucket") && lower.includes("not found")) {
    return "Bucket de fotos não encontrado. Confira o Storage 'products' no Supabase.";
  }

  // Fallback: se parecer inglês genérico
  if (/^[A-Za-z0-9 ,.'"_:()\-/]+$/.test(msg) && /[A-Za-z]{4,}/.test(msg)) {
    return `Erro: ${msg}`;
  }

  return msg;
}

/** Redireciona com erro já em código curto ou mensagem traduzível. */
export function adminErrorQuery(message: string): string {
  return encodeURIComponent(message);
}

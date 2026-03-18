// ============================================================
//  AdotaDF — Apps Script
//  Cole este código em: script.google.com → novo projeto
//  Depois configure as variáveis abaixo e siga o GUIA.md
// ============================================================

// ======== CONFIGURE AQUI ========
const CONFIG = {
  // Seu repositório GitHub (onde o site está hospedado)
  GITHUB_USER:  "SEU_USUARIO_GITHUB",      // ex: "joaosilva"
  GITHUB_REPO:  "adotadf",                  // nome do repositório
  GITHUB_TOKEN: "SEU_TOKEN_GITHUB",         // veja GUIA.md → Passo 3
  GITHUB_FILE:  "animais.json",             // nome do arquivo gerado

  // E-mail que recebe aviso de novo cadastro
  EMAIL_ADMIN:  "seu@email.com",

  // WhatsApp via CallMeBot (gratuito) — veja GUIA.md → Passo 4
  CALLMEBOT_PHONE: "5561999999999",         // seu número com DDI (sem +)
  CALLMEBOT_KEY:   "SUA_API_KEY_CALLMEBOT", // chave gerada pelo bot

  // Aba da planilha onde ficam os cadastros do Google Forms
  ABA_ANIMAIS: "Respostas ao formulário 1",
};
// =================================


/**
 * TRIGGER AUTOMÁTICO
 * Esta função roda automaticamente toda vez que alguém
 * submete o formulário de cadastro de animal.
 * Configure em: Gatilhos (relógio) → aoEnviarFormulario → Envio de formulário
 */
function aoEnviarFormulario(e) {
  try {
    const linha = obterUltimaLinha();
    if (!linha) return;

    // 1. Atualiza o JSON no GitHub (site exibe automaticamente)
    atualizarGitHub();

    // 2. Notifica a equipe por WhatsApp
    enviarWhatsApp(linha);

    // 3. Envia e-mail de confirmação
    enviarEmail(linha);

    Logger.log("✅ Animal cadastrado com sucesso: " + linha.nome);
  } catch (erro) {
    Logger.log("❌ Erro: " + erro.toString());
    // Envia e-mail de erro para o admin
    GmailApp.sendEmail(
      CONFIG.EMAIL_ADMIN,
      "⚠️ AdotaDF — Erro no cadastro",
      "Ocorreu um erro ao processar um cadastro:\n\n" + erro.toString()
    );
  }
}


/**
 * Lê a última linha da planilha (cadastro mais recente)
 */
function obterUltimaLinha() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(CONFIG.ABA_ANIMAIS);
  const dados = aba.getDataRange().getValues();

  if (dados.length < 2) return null; // só cabeçalho, sem dados

  const cabecalho = dados[0];
  const ultimaLinha = dados[dados.length - 1];

  // Monta objeto com os dados do animal
  // Ajuste os índices abaixo conforme a ordem das perguntas no seu Forms
  return {
    timestamp:  ultimaLinha[0] || "",
    nome:       ultimaLinha[1] || "Sem nome",   // pergunta 1
    tipo:       ultimaLinha[2] || "",            // pergunta 2 (cachorro/gato)
    idade:      ultimaLinha[3] || "",            // pergunta 3
    porte:      ultimaLinha[4] || "",            // pergunta 4
    cidade:     ultimaLinha[5] || "",            // pergunta 5
    descricao:  ultimaLinha[6] || "",            // pergunta 6
    contato:    ultimaLinha[7] || "",            // pergunta 7
    foto:       ultimaLinha[8] || "",            // pergunta 8 (link da foto)
    id:         "animal_" + new Date().getTime(),
    status:     "disponivel",
  };
}


/**
 * Lê TODOS os animais da planilha e gera o JSON completo
 */
function gerarJsonTodosAnimais() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(CONFIG.ABA_ANIMAIS);
  const dados = aba.getDataRange().getValues();

  if (dados.length < 2) return [];

  const animais = [];
  for (let i = 1; i < dados.length; i++) {
    const linha = dados[i];
    if (!linha[1]) continue; // pula linhas vazias

    animais.push({
      id:        "animal_" + i,
      timestamp: linha[0] ? linha[0].toString() : "",
      nome:      linha[1] || "Sem nome",
      tipo:      linha[2] || "",
      idade:     linha[3] || "",
      porte:     linha[4] || "",
      cidade:    linha[5] || "",
      descricao: linha[6] || "",
      contato:   linha[7] || "",
      foto:      linha[8] || "",
      status:    linha[9] || "disponivel",
    });
  }

  return animais;
}


/**
 * Atualiza o arquivo animais.json no GitHub
 * O site lê este arquivo e exibe os cards automaticamente
 */
function atualizarGitHub() {
  const animais = gerarJsonTodosAnimais();
  const conteudo = JSON.stringify(animais, null, 2);
  const conteudoBase64 = Utilities.base64Encode(
    Utilities.newBlob(conteudo).getBytes()
  );

  const url = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/contents/${CONFIG.GITHUB_FILE}`;

  // Precisa do SHA atual do arquivo para poder atualizar
  let sha = "";
  try {
    const respGet = UrlFetchApp.fetch(url, {
      headers: {
        Authorization: "token " + CONFIG.GITHUB_TOKEN,
        Accept: "application/vnd.github.v3+json",
      },
      muteHttpExceptions: true,
    });
    if (respGet.getResponseCode() === 200) {
      sha = JSON.parse(respGet.getContentText()).sha;
    }
  } catch (e) {
    // Arquivo ainda não existe, será criado
  }

  const payload = {
    message: "🐾 Novo animal cadastrado via AdotaDF",
    content: conteudoBase64,
    ...(sha ? { sha } : {}),
  };

  const resp = UrlFetchApp.fetch(url, {
    method: "PUT",
    headers: {
      Authorization: "token " + CONFIG.GITHUB_TOKEN,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const codigo = resp.getResponseCode();
  if (codigo !== 200 && codigo !== 201) {
    throw new Error("GitHub retornou " + codigo + ": " + resp.getContentText());
  }

  Logger.log("✅ GitHub atualizado. Total de animais: " + animais.length);
}


/**
 * Envia notificação no WhatsApp via CallMeBot (gratuito)
 * Cadastro em: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 */
function enviarWhatsApp(animal) {
  if (!CONFIG.CALLMEBOT_KEY || CONFIG.CALLMEBOT_KEY === "SUA_API_KEY_CALLMEBOT") {
    Logger.log("WhatsApp não configurado, pulando...");
    return;
  }

  const mensagem = encodeURIComponent(
    `🐾 *Novo animal cadastrado no AdotaDF!*\n\n` +
    `*Nome:* ${animal.nome}\n` +
    `*Tipo:* ${animal.tipo}\n` +
    `*Cidade:* ${animal.cidade}\n` +
    `*Contato:* ${animal.contato}\n\n` +
    `Acesse a planilha para revisar.`
  );

  const url = `https://api.callmebot.com/whatsapp.php?phone=${CONFIG.CALLMEBOT_PHONE}&text=${mensagem}&apikey=${CONFIG.CALLMEBOT_KEY}`;

  UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  Logger.log("✅ WhatsApp enviado");
}


/**
 * Envia e-mail de aviso para o admin
 */
function enviarEmail(animal) {
  if (!CONFIG.EMAIL_ADMIN || CONFIG.EMAIL_ADMIN === "seu@email.com") {
    Logger.log("E-mail não configurado, pulando...");
    return;
  }

  const assunto = `🐾 AdotaDF — Novo animal: ${animal.nome}`;
  const corpo = `
Olá!

Um novo animal foi cadastrado na plataforma AdotaDF.

━━━━━━━━━━━━━━━━━━━━━
Nome:       ${animal.nome}
Tipo:       ${animal.tipo}
Idade:      ${animal.idade}
Porte:      ${animal.porte}
Cidade:     ${animal.cidade}
Contato:    ${animal.contato}
━━━━━━━━━━━━━━━━━━━━━

Descrição:
${animal.descricao}

${animal.foto ? "Foto: " + animal.foto : ""}

O site já foi atualizado automaticamente. ✅

—
AdotaDF · Sistema automático
  `.trim();

  GmailApp.sendEmail(CONFIG.EMAIL_ADMIN, assunto, corpo);
  Logger.log("✅ E-mail enviado para " + CONFIG.EMAIL_ADMIN);
}


// ============================================================
//  FUNÇÕES UTILITÁRIAS (rode manualmente quando precisar)
// ============================================================

/**
 * Rode esta função UMA VEZ para fazer o upload inicial do JSON.
 * Depois o trigger automático cuida de tudo.
 */
function uploadInicial() {
  atualizarGitHub();
  Logger.log("✅ Upload inicial concluído!");
}

/**
 * Teste rápido: simula um cadastro sem precisar do Forms.
 * Rode para verificar se tudo está funcionando.
 */
function testarSistema() {
  const animalTeste = {
    nome: "Teste",
    tipo: "Cachorro",
    idade: "2 anos",
    porte: "Médio",
    cidade: "Asa Sul - DF",
    descricao: "Animal de teste para verificar o sistema.",
    contato: "(61) 99999-9999",
    foto: "",
    id: "teste_" + new Date().getTime(),
    status: "disponivel",
  };

  Logger.log("🧪 Testando atualização do GitHub...");
  atualizarGitHub();

  Logger.log("🧪 Testando WhatsApp...");
  enviarWhatsApp(animalTeste);

  Logger.log("🧪 Testando e-mail...");
  enviarEmail(animalTeste);

  Logger.log("✅ Teste concluído! Verifique seu WhatsApp e e-mail.");
}
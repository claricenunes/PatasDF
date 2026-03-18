# 🐾 AdotaDF — Guia de Configuração
## Do zero ao 100% automático em ~30 minutos

---

## O que vai acontecer depois que configurar

1. Pessoa preenche o formulário no site
2. Dados vão pro Google Sheets automaticamente
3. Apps Script detecta o cadastro em segundos
4. Site atualiza os cards de animais sozinho
5. Você recebe aviso no WhatsApp + e-mail

**Custo: R$ 0,00**

---

## Passo 1 — Criar o Google Forms

1. Acesse **forms.google.com** e crie um novo formulário
2. Adicione as perguntas **nessa ordem exata**:

| # | Pergunta | Tipo |
|---|----------|------|
| 1 | Nome do animal | Resposta curta |
| 2 | Tipo (cachorro / gato / outro) | Múltipla escolha |
| 3 | Idade aproximada | Múltipla escolha |
| 4 | Porte | Múltipla escolha |
| 5 | Cidade / Bairro | Resposta curta |
| 6 | Descrição | Parágrafo |
| 7 | Seu contato (WhatsApp) | Resposta curta |
| 8 | Link da foto | Resposta curta |

3. Clique em **Respostas → ícone de planilha** (verde) → **Criar planilha**
4. Anote o nome da aba que aparecer (ex: "Respostas ao formulário 1")
5. Copie o link de resposta do Forms — você vai colocar no site

> 💡 Se a ordem das perguntas for diferente, ajuste os índices
> no arquivo `Codigo.gs` (linha 68–76, onde está `linha[1]`, `linha[2]`, etc.)

---

## Passo 2 — Abrir o Apps Script

1. Na planilha que foi criada, clique em **Extensões → Apps Script**
2. Delete o código padrão que aparece
3. Cole todo o conteúdo do arquivo `Codigo.gs`
4. Clique em **Salvar** (ícone de disquete)

---

## Passo 3 — Criar Token do GitHub

> O Apps Script precisa de permissão para atualizar o arquivo `animais.json` no repositório.

1. Acesse **github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Clique em **Generate new token (classic)**
3. Nome: `AdotaDF`
4. Validade: **No expiration** (sem prazo)
5. Marque apenas: ✅ `repo` (acesso completo ao repositório)
6. Clique em **Generate token**
7. **COPIE o token agora** — ele só aparece uma vez!

Coloque o token em `Codigo.gs` na linha:
```
GITHUB_TOKEN: "ghp_seu_token_aqui",
```

---

## Passo 4 — Configurar WhatsApp (opcional mas recomendado)

O **CallMeBot** envia mensagens no seu WhatsApp gratuitamente.

1. Salve o número `+34 644 80 05 93` na sua agenda como "CallMeBot"
2. Mande a mensagem: `I allow callmebot to send me messages`
3. Em alguns minutos você recebe uma resposta com sua **API Key**
4. Coloque a chave em `Codigo.gs`:
```
CALLMEBOT_PHONE: "5561999999999",  // seu número com 55 + DDD, sem espaços
CALLMEBOT_KEY:   "123456",         // chave que o bot enviou
```

---

## Passo 5 — Configurar as variáveis no Codigo.gs

Abra o Apps Script e edite o bloco `CONFIG` no topo:

```javascript
const CONFIG = {
  GITHUB_USER:  "seu_usuario_github",
  GITHUB_REPO:  "adotadf",
  GITHUB_TOKEN: "ghp_SeuTokenAqui",
  GITHUB_FILE:  "animais.json",

  EMAIL_ADMIN:  "seu@email.com",

  CALLMEBOT_PHONE: "5561999999999",
  CALLMEBOT_KEY:   "sua_api_key",

  ABA_ANIMAIS: "Respostas ao formulário 1",
};
```

---

## Passo 6 — Criar o gatilho automático

1. No Apps Script, clique no ícone de **relógio** (Gatilhos) no menu lateral
2. Clique em **+ Adicionar gatilho**
3. Configure assim:

| Campo | Valor |
|-------|-------|
| Função | `aoEnviarFormulario` |
| Origem do evento | `Do planilha` |
| Tipo de evento | `Ao enviar formulário` |

4. Clique em **Salvar** → autorize as permissões quando pedir
5. Pronto! O gatilho está ativo.

---

## Passo 7 — Testar o sistema

1. No Apps Script, selecione a função `testarSistema`
2. Clique em **Executar**
3. Verifique:
   - ✅ O arquivo `animais.json` apareceu no seu repositório GitHub
   - ✅ Você recebeu mensagem no WhatsApp
   - ✅ Você recebeu e-mail

Se der erro, clique em **Execuções** no menu lateral para ver o log.

---

## Passo 8 — Conectar o site ao JSON

O site precisa ler o `animais.json` do GitHub para exibir os animais.
A URL do arquivo vai ser:

```
https://raw.githubusercontent.com/SEU_USUARIO/adotadf/main/animais.json
```

No `index.html`, procure o comentário:
```
// ✅ SUBSTITUA PELA URL DO SEU animais.json
```
E cole a URL acima.

---

## Passo 9 — Subir o site no GitHub Pages

1. Crie um repositório chamado `adotadf` no GitHub
2. Faça upload do `index.html` e do `animais.json` (pode estar vazio: `[]`)
3. Vá em **Settings → Pages → Branch: main → Save**
4. Aguarde ~2 minutos
5. Seu site estará em: `https://seu_usuario.github.io/adotadf`

---

## Resumo da arquitetura

```
Formulário → Sheets → Apps Script → GitHub (animais.json)
                               ↓              ↓
                          WhatsApp       Site exibe
                          E-mail         os cards
```

---

## Dúvidas frequentes

**O site não atualiza na hora?**
O GitHub Pages tem cache de ~1–2 minutos. É normal demorar um pouco.

**Posso marcar um animal como adotado?**
Sim! Na planilha, adicione uma coluna "Status" e coloque "adotado".
O Apps Script já lê esse campo — animais com status "adotado" não aparecem no site.

**Quantos animais posso cadastrar?**
Sem limite. Google Sheets suporta até 10 milhões de células.

**Precisa de servidor?**
Não. Tudo roda no Google e no GitHub, sem custo e sem servidor.
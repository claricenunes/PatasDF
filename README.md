# Give&Grow + PatasDF

> Comunidade gratuita de troca, aprendizado e voluntariado no Distrito Federal — com o PatasDF como uma das causas dentro do ecossistema.

---

## Sobre o projeto

O **Give&Grow** é uma plataforma comunitária e 100% gratuita que conecta pessoas do Distrito Federal que querem **aprender**, **ensinar** e **fazer voluntariado**. Sem burocracia, sem cadastro obrigatório, sem custo.

O **PatasDF** nasceu dentro desse ecossistema como uma causa dedicada à proteção animal: ajuda a reencontrar animais perdidos no DF, lista animais encontrados aguardando o dono e reúne ONGs da causa animal.

Ambos os projetos foram criados por **Clarice Nunes**, estudante de Engenharia de Software no CEUB, como uma forma de usar tecnologia para gerar impacto social real na comunidade do DF.

---

## Estrutura de arquivos

```
give-grow/
│
├── index.html          # Página principal do Give&Grow
├── patasdf.html        # Página principal do PatasDF
├── animais.html        # Listagem de animais disponíveis para adoção
├── causas.html         # Todas as áreas de interesse da comunidade
├── sobre.html          # Sobre a criadora (Clarice Nunes)
├── voluntariado.html   # Página de interesse em voluntariado
├── styles.css          # Folha de estilos unificada
├── animais.json        # Base de dados dos animais (atualizada automaticamente pelo Apps Script)
├── google1236bb8b8d7e0cfb.html
├── sitemap.xml
│
└── fotos/
    ├── clarice2.jpg
    ├── bolt.jpg
    └── max.jpg
```

---

## Como rodar localmente

O projeto é 100% estático — sem back-end, sem dependências externas, sem build.

**1. Clone o repositório:**
```bash
git clone https://github.com/claricenunes/Give-and-Grow.git
cd Give-and-Grow
```

**2. Abra no navegador:**

Abra o `index.html` diretamente ou use o **Live Server** no VS Code:

```bash
# Com Python:
python3 -m http.server 3000
# Acesse: http://localhost:3000
```

---

## Configuração dos formulários

O projeto utiliza **um único Google Form** para coletar os dados dos usuários.

As respostas são automaticamente organizadas em diferentes abas do **Google Sheets** através do **Google Apps Script**, de acordo com o tipo de participação:

* Aprender → aba `Aprendizes`
* Ensinar → aba `Instrutores`
* Voluntariado → aba `Voluntariado`

No front-end, os botões de participação apontam para o **mesmo formulário**, variando apenas parâmetros (quando necessário) ou o contexto da ação.

### Onde configurar

Substitua o placeholder nos arquivos HTML:

| Placeholder                       | Arquivo        | Descrição                                              |
| --------------------------------- | -------------- | ------------------------------------------------------ |
| `SEU_LINK_GOOGLE_FORMS_CADASTRO`  | `index.html`   | Formulário único para aprender, ensinar e voluntariado |
| `SEU_LINK_GOOGLE_FORMS_PERDI`     | `patasdf.html` | Formulário de animal perdido                           |
| `SEU_LINK_GOOGLE_FORMS_ENCONTREI` | `patasdf.html` | Formulário de animal encontrado                        |

> 💡 A separação dos dados não é feita pelo formulário, mas sim pelo **Apps Script**, que direciona cada resposta para a aba correta.

---


## Google Apps Script

Todo o back-end do projeto roda via **Google Apps Script**, conectado a uma única planilha do Google Sheets.
O script principal (`Código.gs`) centraliza toda a automação: processamento de formulários, envio de e-mails, controle de eventos e publicação de dados.

---

## Estrutura da planilha

O sistema utiliza **uma única fonte de entrada (Google Form)** para os cadastros da comunidade (aprender, ensinar e voluntariado).

O **Apps Script é responsável por processar cada resposta e direcionar os dados para as abas corretas**, mantendo a organização da base.

## Google Apps Script

Todo o back-end do projeto roda via **Google Apps Script**, conectado a uma única planilha do Google Sheets.
O script principal (`Código.gs`) centraliza toda a automação: processamento de formulários, envio de e-mails, controle de eventos e publicação de dados.

---

## Estrutura da planilha

O sistema utiliza **um único Google Form principal** para cadastros da comunidade (aprender, ensinar e voluntariado).

Todas as respostas chegam primeiro em uma aba central, e o **Apps Script é responsável por processar e redistribuir os dados automaticamente** para as abas corretas.

### Abas utilizadas

| Aba                   | Descrição                                                                 |
| --------------------- | ------------------------------------------------------------------------- |
| `Cadastro`            | Aba principal que recebe todas as respostas do formulário (entrada bruta) |
| `Aprendizes`          | Pessoas que querem aprender                                               |
| `Instrutores`         | Pessoas que querem ensinar                                                |
| `Voluntariado`        | Interessados em ações voluntárias                                         |
| `Eventos`             | Eventos cadastrados manualmente via formulário (admin)                    |
| `Confirmacoes`        | Registro de confirmações, cancelamentos e lista de espera                 |
| `Animais Perdidos`    | Cadastros de animais perdidos (formulário específico)                     |
| `Animais Encontrados` | Cadastros de animais encontrados (formulário específico)                  |

---

## Como funciona na prática

1. Usuário preenche o formulário principal

2. A resposta é registrada na aba `Cadastro`

3. O Apps Script (`onFormSubmit`) analisa o tipo de interesse da pessoa

4. Os dados são automaticamente copiados para a aba correspondente:

   * `Aprendizes`
   * `Instrutores`
   * `Voluntariado`

5. Eventos são cadastrados separadamente (via formulário próprio do admin)

> 💡 Essa arquitetura centraliza a entrada de dados em um único formulário e usa o Apps Script como camada de inteligência para organização e automação.

### Configuração inicial

1. Abra o Apps Script vinculado à planilha (**Extensões → Apps Script**)
2. Cole o conteúdo do `Código.gs`
3. Em **Configurações do projeto → Propriedades do script**, adicione:

| Chave | Valor |
|---|---|
| `HMAC_SECRET` | Uma string secreta qualquer (ex: `minha-chave-secreta-123`) |
| `GITHUB_TOKEN` | Token de acesso pessoal do GitHub com permissão de escrita no repositório |

4. Faça o deploy: **Implantar → Nova implantação → Aplicativo da Web**
   - Executar como: **Você**
   - Quem pode acessar: **Qualquer pessoa**
5. Copie a URL gerada e atualize `URL_WEBAPP` e `EMAIL_ADMIN` no topo do script

### Gatilhos (Triggers)

Configure os seguintes gatilhos em **Gatilhos → Adicionar gatilho**:

| Função | Evento | Frequência |
|---|---|---|
| `onFormSubmit` | Ao enviar formulário | — (vinculado à planilha) |
| `resumoDiario` | Baseado em tempo | Todo dia às 22h |
| `enviarLembretes` | Baseado em tempo | Todo dia às 8h |
| `encerrarEventosAutomatico` | Baseado em tempo | Todo dia à meia-noite |
| `verificarStatusAnimais` | Baseado em tempo | Todo dia às 10h |
| `verificarInscritosSuficientes` | Baseado em tempo | Toda semana |

### Funções disponíveis para rodar manualmente

| Função | O que faz |
|---|---|
| `dispararConvitesPorInteresse('EVT-...')` | Envia convites para o evento com o ID informado |
| `gerarAnimaisJSON()` | Regenera o `animais.json` e publica no GitHub |
| `encerrarEvento('EVT-...')` | Encerra manualmente um evento específico |
| `resumoDiario()` | Envia o e-mail de resumo para o admin imediatamente |
| `verificarStatusAnimais()` | Dispara verificação de animais sem resposta há 30+ dias |

---

## Fluxo do PatasDF

### Cadastro de animal
1. Usuário preenche o formulário (perdido ou encontrado)
2. `onFormSubmit` envia e-mail de confirmação ao tutor
3. Admin recebe o **resumo diário** com botões de **Aprovar** ou **Reprovar**
4. Ao aprovar, o animal é publicado automaticamente no site via `animais.json`
5. Ao reprovar, o tutor é notificado com os motivos

### Contato protegido (sem expor dados pessoais)
O link de contato no site abre uma **página pública** com:
- Foto do animal
- Nome, tipo, raça, cor, região e data do desaparecimento/encontro
- **Formulário intermediado**: quem quer ajudar preenche nome, mensagem e contato
- O Apps Script encaminha a mensagem ao e-mail do tutor nos bastidores
- **Nenhum dado pessoal (e-mail ou WhatsApp) fica visível no HTML**

### Verificação automática de cadastros (30 dias)
- Após 30 dias no site, o tutor recebe um e-mail perguntando se o animal ainda está perdido
- Se confirmar que sim: cadastro é mantido e contador reinicia
- Se confirmar que foi encontrado: cadastro é removido automaticamente
- Se não responder em 7 dias: cadastro é removido e tutor é notificado

### Confirmação de presença em eventos
1. Convite enviado por e-mail com botão de confirmar/cancelar
2. Ao confirmar: presença registrada, e-mail de confirmação enviado
3. Se vagas cheias: pessoa entra na lista de espera automaticamente
4. Se alguém cancela: primeiro da lista de espera é promovido e notificado
5. 24h antes do evento: lembrete automático para confirmados
6. Após o evento: e-mail de agradecimento e encerramento automático

---

## Configuração do `animais.json`

O arquivo é gerado e publicado automaticamente pelo Apps Script a cada aprovação ou mudança de status. A estrutura dos animais é:

```json
[
  {
    "id": "P-1-1234567890",
    "status": "perdido",
    "nome": "Bolinha",
    "tipo": "cachorro",
    "raca": "Vira-lata",
    "cor": "Caramelo",
    "porte": "Médio",
    "idade": "2 anos",
    "cidade": "Asa Sul",
    "referencia": "Próximo ao Parque da Cidade",
    "caracteristicas": "Tem mancha branca no peito",
    "dataDesaparecimento": "2025-03-01",
    "foto": "https://lh3.googleusercontent.com/d/...",
    "linkContato": "https://script.google.com/.../exec?acao=contato&id=...",
    "dataCadastro": "01/03/2025"
  }
]
```

**Valores válidos para `status`:** `perdido` · `encontrado`

> O campo `linkContato` aponta para a página intermediada — nunca expõe e-mail ou WhatsApp do tutor.

---

## Segurança dos links

Todos os links de ação (confirmar, cancelar, aprovar, reprovar, status) são protegidos por **HMAC-SHA256**. Cada link contém um token gerado a partir de uma chave secreta armazenada nas propriedades do script. Links inválidos ou adulterados são rejeitados com uma página de erro amigável.

---

## Tecnologias utilizadas

| Tecnologia | Uso |
|---|---|
| HTML5 + CSS3 | Estrutura e estilo de todas as páginas |
| JavaScript (vanilla) | Interatividade, modais, filtros, IntersectionObserver |
| Google Fonts | Playfair Display + DM Sans |
| Google Forms | Coleta de dados dos participantes |
| Google Sheets | Armazenamento das respostas |
| Google Apps Script | Toda a automação, e-mails, aprovações e geração do JSON |
| GitHub Pages | Hospedagem estática gratuita |
| GitHub API | Publicação automática do `animais.json` via Apps Script |

---

## Páginas do projeto

### Give&Grow

| Página | Descrição |
|---|---|
| `index.html` | Hero, causas, eventos, seção de participação, PatasDF e sobre |
| `causas.html` | Todas as 20+ áreas de interesse com filtros por categoria |
| `voluntariado.html` | Página de interesse em voluntariado com formulário e seção para ONGs |
| `sobre.html` | Perfil da criadora, história do projeto e tecnologias |

### PatasDF

| Página | Descrição |
|---|---|
| `patasdf.html` | Hero, formulários de perdi/encontrei, listagem de animais e ONGs |
| `animais.html` | Listagem completa de animais com busca e filtros |

---

## Funcionalidades

- **Contato protegido** — Página pública com formulário intermediado que nunca expõe e-mail ou WhatsApp do tutor
- **Aprovação de animais** — Admin recebe resumo diário com botões de aprovar/reprovar direto no e-mail
- **Publicação automática** — Aprovação atualiza o `animais.json` e o site em segundos via GitHub API
- **Verificação de cadastros** — E-mail automático após 30 dias perguntando se o animal ainda está perdido
- **Lista de espera** — Eventos lotados gerenciam fila automaticamente
- **Carona** — Participantes com carro podem se cadastrar para oferecer carona
- **Lembretes automáticos** — 24h antes de cada evento
- **Encerramento automático** — Eventos passados são encerrados e participantes agradecidos
- **Links seguros com HMAC** — Todas as ações sensíveis são autenticadas
- **Modais de redirecionamento** — Antes do formulário, o usuário vê o que será coletado e para quê
- **Filtros dinâmicos** — Nas páginas de causas e animais
- **Design responsivo** — Funciona em mobile, tablet e desktop

---

## Como testar o Apps Script

### Testar cadastros (onFormSubmit)
```javascript
function testeOnFormSubmit() {
  const sheet = SS.getSheetByName('Aprendizes'); // troque a aba conforme o teste
  const e = {
    range: { getSheet: () => sheet, getRow: () => 2 }
  };
  onFormSubmit(e);
}
```

### Testar página de contato
```javascript
function testeUrlContato() {
  const idAnimal = 'Animais Perdidos-1';
  const url = CONFIG.URL_WEBAPP + '?acao=contato&id=' + encodeURIComponent(idAnimal);
  Logger.log(url); // cole no navegador
}
```

### Testar formulário intermediado (doPost)
```javascript
function testeDoPost() {
  const eFalso = {
    parameter: { id: 'Animais Perdidos-1' },
    postData: {
      contents: JSON.stringify({
        remetente: 'Teste Silva',
        mensagem:  'Vi o animal perto do parque!',
        contato:   '61999999999'
      })
    }
  };
  Logger.log(doPost(eFalso).getContent()); // deve retornar "ok"
}
```

### Testar geração do JSON
```javascript
function testeGerarJSON() {
  const json = gerarAnimaisJSON();
  Logger.log(json.substring(0, 500));
}
```

### Testar aprovação de animal
```javascript
function testeAprovar() {
  const idAnimal = 'Animais Perdidos-1';
  const eFalso = {
    parameter: {
      acao: 'aprovar',
      id:   idAnimal,
      tk:   _gerarToken('aprovar', idAnimal)
    }
  };
  Logger.log(doGet(eFalso).getContent().substring(0, 200));
}
```

### Testar convites para evento
```javascript
function testeConvites() {
  dispararConvitesPorInteresse('EVT-XXXXXXXXXX'); // ID real da planilha
}
```

### Testar resumo diário
```javascript
function testeResumoDiario() {
  resumoDiario();
}
```

---

## Criadora

**Clarice Nunes**  
Estudante de Engenharia de Software · Brasília, DF

[![Instagram](https://img.shields.io/badge/Instagram-%40claricesnunes-E1306C?style=flat&logo=instagram&logoColor=white)](https://instagram.com/claricesnunes)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-claricesnunes-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/claricesnunes)
[![GitHub](https://img.shields.io/badge/GitHub-claricenunes-333?style=flat&logo=github&logoColor=white)](https://github.com/claricenunes)
[![Email](https://img.shields.io/badge/Email-euclaricenunes%40gmail.com-EA4335?style=flat&logo=gmail&logoColor=white)](mailto:euclaricenunes@gmail.com)

> *"Queria usar a tecnologia para gerar impacto social de verdade. Vejo gente querendo ajudar, mas sem saber como. Vejo gente querendo aprender, mas sem acesso. Então decidi criar um lugar que conecta essas duas partes."*

---

## Licença

Este projeto é de uso pessoal e educacional.

---

<div align="center">
  Feito por <a href="https://github.com/claricenunes">Clarice Nunes</a> · Brasília, DF · 2026
</div>

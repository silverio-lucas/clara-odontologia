# Clara Odontologia

Projeto conceitual de uma clínica odontológica para o portfólio de Lucas Silvério.

## Experiência

- Layout responsivo em português do Brasil.
- Apresentação da clínica, tratamentos e primeira visita.
- Perguntas frequentes expansíveis.
- Agenda demonstrativa com seleção de cuidado, dia e horário.
- Fotografias ilustrativas e fontes hospedadas no próprio projeto.

A clínica é fictícia. O agendamento é uma simulação: não reserva consultas reais, não coleta dados pessoais e não envia mensagens.

## Tecnologias

React, TypeScript, Next.js (App Router), Tailwind CSS, CSS personalizado, Shadcn/Radix e Lucide.

A versão original usava Vinext. Esta edição foi adaptada para Next.js e hospedagem na Vercel, preservando o conteúdo e as interações.

## Executar localmente

Requisitos: Node.js 22 e pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abra o endereço exibido no terminal, normalmente http://localhost:3000.

## Validar e compilar

```sh
pnpm typecheck
pnpm build
```

## Publicar na Vercel

1. Importe este repositório no painel da Vercel.
2. Use o preset Next.js e a pasta raiz do repositório.
3. Use Node.js 22.
4. Publique. O projeto não precisa de variáveis de ambiente para a demonstração.

O arquivo `vercel.json` declara o framework e os comandos de instalação e compilação, fixando pnpm 11.25.0.

## Arquivos principais

| Arquivo | Finalidade |
| --- | --- |
| `app/page.tsx` | Conteúdo e agenda demonstrativa |
| `app/globals.css` | Estilos e responsividade |
| `app/layout.tsx` | Idioma e metadados |
| `public/images/` | Fotografias ilustrativas |
| `public/fonts/` | Fontes locais |
| `components/ui/` | Componentes de interface |

Os metadados mantêm a página fora dos resultados de busca, por representar uma clínica fictícia. Isso não impede seu acesso pelo link de portfólio.

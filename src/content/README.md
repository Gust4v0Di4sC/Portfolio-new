# Conteúdo editável e internacionalização

O idioma padrão (`pt-BR`) continua dividido nos arquivos desta pasta. A tradução inglesa fica em `en/`, com a mesma divisão por seção. Os dois pacotes são registrados em `locales.ts` e validados pelos contratos de `types.ts`.

Cada arquivo desta pasta representa um bloco textual da interface:

- `site.ts`: título, descrição, idioma e link de acessibilidade.
- `navigation.ts`: marca e links do menu.
- `hero.ts`: apresentação, botões e descrição da imagem.
- `experience.ts`: experiências e tecnologias.
- `projects.ts`: textos da seção, projetos e rótulos do carrossel.
- `skills.ts`: grupos, habilidades, provas e rótulos do diálogo.
- `about.ts`, `contact.ts` e `footer.ts`: seções finais da página.
- `splash.ts`: mensagens da tela de inicialização.
- `menu.ts`: menu principal, Configuração do Sistema, seletor de idioma e controles.

Ao alterar ou adicionar texto, mantenha a mesma chave no arquivo equivalente de `en/`. Nomes próprios, URLs, IDs e caminhos de mídia devem permanecer consistentes entre os idiomas.

Edite somente os valores de texto, links e listas. Os componentes importam esses blocos pelo `index.ts`.

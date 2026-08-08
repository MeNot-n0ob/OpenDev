<p align="center">
  <a href="https://opencode.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="Logo OpenDev">
    </picture>
  </a>
</p>
<p align="center">OpenDev — une variante de l'agent de codage IA open source.</p>

---

> [!IMPORTANT]
> OpenDev n'est **pas** développé par l'équipe OpenCode et n'a **aucune** affiliation avec elle.
> Ce projet est un fork/variante d'[OpenCode](https://github.com/anomalyco/opencode) par
> [anomalyco](https://github.com/anomalyco), l'agent de codage IA open source original.
> Tout le mérite du code en amont revient aux auteurs et contributeurs d'OpenCode.

---

### Qu'est-ce qu'OpenDev ?

OpenDev est une variante personnelle d'OpenCode, un agent de codage IA open source qui s'exécute dans votre
terminal. Il s'appuie sur le code d'OpenCode avec des modifications locales et une configuration adaptée
à ma façon de travailler.

Pour l'ensemble des fonctionnalités d'origine, la documentation et la communauté, consultez
[**OpenCode**](https://github.com/anomalyco/opencode) et sa documentation sur [**opencode.ai**](https://opencode.ai/docs).

### Installation

OpenDev s'exécute à partir du code source avec [Bun](https://bun.sh).

```bash
# Installer les dépendances
bun install

# Lancer le serveur de développement
bun dev
```

Pour les installations binaires d'origine (OpenCode non modifié), consultez l'[installeur officiel](https://opencode.ai/install).

### Agents intégrés

Comme OpenCode, cette variante comprend deux agents intégrés entre lesquels vous pouvez basculer avec la touche `Tab`.

- **build** - Agent par défaut avec accès complet pour le travail de développement
- **plan** - Agent en lecture seule pour l'analyse et l'exploration du code

En savoir plus sur les agents d'OpenCode sur [opencode.ai/docs/agents](https://opencode.ai/docs/agents).

### Documentation

Pour savoir comment OpenCode est configuré, consultez la documentation d'origine sur
[**opencode.ai/docs**](https://opencode.ai/docs).

### Contribuer

C'est un projet personnel, mais les contributions au projet d'origine sont les bienvenues sur
[**anomalyco/opencode**](https://github.com/anomalyco/opencode).

---

**Crédits :** Développé sur [OpenCode](https://github.com/anomalyco/opencode) par [anomalyco](https://github.com/anomalyco).

---
title:  "Extension Pack for VSCode & Code Server"
date:   2021-07-30 11:30:00 +0530
tags: [vscode, code-server, github, ci-cd, travis]
header:
  teaser: https://res.cloudinary.com/adisakshya/image/upload/v1627494025/weblog/extension-pack-for-vscode-and-codeserver/meta/teaser_zn6rdm.png
  image: https://res.cloudinary.com/adisakshya/image/upload/v1627494023/weblog/extension-pack-for-vscode-and-codeserver/meta/banner_ccueds.png
excerpt: Creating extension pack for VS Code & Code Server and publishing on GitHub release using Travis CI
comments: true
---

In this article, we'll create a common extension pack for VS Code and code-server, explore the involved compatibility issue and Travis Workspaces. Finally, we'll build a CI/CD pipeline to publish our extension pack to a GitHub release.

> Extension packs in VS Code are useful when we want to bundle and install a set of extensions together. It also provides us with a way to share and organize our favourite extensions.

## Prerequisites

If you've never built an extension before, you'll need [VS Code](https://code.visualstudio.com/download) and [NodeJS](https://nodejs.org/en/download/) installed.

We'll create a versioned extension pack, so a [git repository](https://docs.github.com/en/get-started/quickstart/create-a-repo) is needed where we can maintain the source code of our extension pack. Also on this repository, a CI/CD pipeline will be built later in the article. The extension pack will be published on the repository release page by the pipeline, from where anyone can install and use it.

The source code of the extension pack created for this article can be found at my GitHub repository - [adisakshya/extension-pack](https://github.com/adisakshya/extension-pack).

Once NodeJS is installed, the git repository is created and cloned we can move forward to get started.

## Installing Yeoman & Code Generator

To get started creating an extension pack,

We'll need to install the [Yeoman](https://www.npmjs.com/package/yo) scaffolding CLI tools as well as the [generator](https://www.npmjs.com/package/generator-code).

Yeoman can be installed using the following command -

```
npm install -g yo
```

Then we can install the generator tools like so -

```
npm install -g generator-code
```

## Generating a New Extension Project

With the correct tools installed, we are now ready to generate a new extension pack project. This is pretty easy as all of the scaffolding is already provided. So all we have to do is add to the list of extensions to be included.

We can start this process by running the following command in our git project directory (extension-pack) -

```bash
yo code
```

<video width="100%" height="auto" controls muted>
    <source src="https://res.cloudinary.com/adisakshya/video/upload/v1627494509/weblog/extension-pack-for-vscode-and-codeserver/yo-code-main_awwy0t.webm" type="video/mp4">
</video>

### Understanding the generated code

The following directory structure will be created inside the project directory by the generator -

```
+-- .vscode
|   +-- launch.json
+-- .vscodeignore
+-- CHANGELOG.md
+-- package.json
+-- README.md
+-- vsc-extension-quickstart.md
```

Let’s explore everything in it -

- `vscode/launch.json` is a file used to configure the debugger in VS Code.
- The `.vscodeignore` file excludes some files from being included in your extension's package.
- Record of all notable changes made to the project is maintained in `CHANGELOG.md`.
- `README.md` is the project readme file, it'll also be used in the extension packs page in the VS Code marketplace.
- Every VS Code extension needs a manifest file `package.json` at the root of the project directory structure. Most of the time we'll find ourselves tweaking the manifest file. A great reference can be found here at [VS Code API Reference](https://code.visualstudio.com/api/references/extension-manifest).
- `vsc-extension-quickstart.md` feature some quick-start tips.

## Make it yours

Cool, so now that we understand (hopefully 😅) what everything means! We can move forward to update the `package.json` manifest to customize our extension pack. The field names are quite clear with their meaning.

First things first - Let’s name, describe and version our package.

```json
"name": "adisakshya-extension-pack",
"displayName": "adisakshya-extension-pack",
"description": "Adisakshya's extension-pack for VS Code & Code Server",
"version": "1.0.0"
```

Second things second - Update the list of extensions in our pack.

The `extensionPack` field is a list of `extension-ids`. The ID of the extension can be obtained from VS Code Marketplace.

```json
"extensionPack": [
    "cssho.vscode-svgviewer",
    "docsmsft.docs-markdown",
    "eamodio.gitlens",
    "EditorConfig.EditorConfig",
    "esbenp.prettier-vscode",
    "formulahendry.code-runner",
    "GitHub.github-vscode-theme",
    "GrapeCity.gc-excelviewer",
    "humao.rest-client",
    "johnpapa.vscode-peacock",
    "ms-azuretools.vscode-docker",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "ms-vscode-remote.vscode-remote-extensionpack",
    "ms-vscode.cpptools",
    "ms-vscode.vscode-typescript-next",
    "ritwickdey.LiveServer",
    "VisualStudioExptTeam.vscodeintellicode",
    "vscode-icons-team.vscode-icons",
    "vsls-contrib.codetour"
]
```

Third things third - Specify an icon

We can specify an icon for our extension pack by placing our icon-file.png in our project directory. Its path has to be mentioned in the `package.json` manifest like -

```json
"icon": "path/to/icon-file.png"
```

Now that we've specified what extensions need to be included and other associated information. We can pack the extensions in a file that can be used to install the extension pack on VS Code and code-server.

## Packing the extensions

Visual Studio Code Extensions (aka [vsce](https://www.npmjs.com/package/vsce)) is a command-line tool for packing, publishing and managing VS Code extensions. It can be installed using the following command -

```
npm install --global vsce
```

We'll choose to pack our extension into a `VSIX` file, using which people who wish to use the same pack can install it.

We can package the extensions in a VSIX file using the following command in our project directory -

```
vsce package
```

For users who receive the `VSIX` file, they can install the extension pack on VS Code and code-server like so -

```
# VS Code
code --install-extension adisakshya-extension-pack-1.0.0.vsix

# Code Server
code-server --install-extension adisakshya-extension-pack-1.0.0.vsix
```

A handy NPM script can be included in `package.json` -

```json
"scripts": {
    "pack": "vsce package"
}
```

This can be used as an `npm run pack` or `yarn run pack` in CI.

## Understanding the VS Code compatibility

This is one of the most important things we (or at least I) unconsciously ignored.

I packed the extensions in a VSIX file and tried installing it on my local system with VS Code installed. Great, it worked as expected.

I took the same VSIX file and tried installing it on a code-server setup in Windows Subsystem for Linux (WSL). And... saw the below message -

![VS Code Compatibility Error Message](https://res.cloudinary.com/adisakshya/image/upload/v1627132554/weblog/extension-pack-for-vscode-and-codeserver/compatibility-issue_vjuq9p.png)

Okay... so it said - **Unable to install extension 'adisakshya-extension-pack' as it is not compatible with VS Code '1.53.2'**. I figured out that it had something to do with the version of VS Code for which the extension pack was created.

One thing that looked SUS was the `engines.vscode` field inside `package.json`, which was the only thing I left as default. I went through the VS Code Extension API Reference to find out what this field really is and what I found was -

> When authoring an extension, you will need to describe what is the extension's compatibility to Visual Studio Code itself. — [API Reference](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#visual-studio-code-compatibility)

The `engines.vscode` field is an object that contains a key matching the versions of VS Code that the extension or extension pack is compatible with. If I'm generating the scaffolding code on my system then this field is set to the version of VS Code I'm using by default.

```json
"engines": {
    "vscode": "^1.56.0"
}
```

I was using the `1.56.0` version of VS Code and generated the VSIX file with this configuration. `1.53.0` was the version of VS Code associated with the code-server release that I was using.

Okay, the extension pack that I created was meant to be compatible with version `1.56.0` and above. While the code-server was using `1.53.0` — this was the reason for that incompatibility message!

I updated the `engines.vscode` field to `^1.53.0` to make it work, but still, the installation failed on code-server as some extensions inside the pack were not compatible with this version of VS Code. So next possible solution was to upgrade the code-server.

I installed the `3.10.2` version of code-server which used VS Code `1.56.0` and tried installing my extension pack with `engines.vscode` field set to `1.56.0`. Great, it worked!

So, 
> Before packing our extension we must ensure that we’ve mentioned the `engines.vscode` field correctly according to our use.

To find out what version of VS Code engine is our code-server setup using, see the Welcome Screen -

![Code Server Welcome Screen](https://res.cloudinary.com/adisakshya/image/upload/v1627132525/weblog/extension-pack-for-vscode-and-codeserver/code-server-welcome-screen_vbiiw6.png)

## Publishing the extension pack

We'll be publishing the `VSIX` file of our extension pack to a GitHub Release using Travis CI. Let’s define our expectations — The CI workflow should do the following -

1. Pack the extensions in a VSIX file
2. Publish the VSIX file to GitHub release
3. We should be able to download the latest release of the extension pack (using a single terminal command so that we don’t have to install it from the marketplace every time and can use this command in automation scripts)

While writing the Travis YML file I came across a much-awaited (at least for me) beta feature - [Workspaces](https://docs.travis-ci.com/user/using-workspaces).

> Workspaces allow jobs within a build to share files. They are useful when you want to use build artefacts from a previous job. — Travis Workspaces Docs

Cool, this means we can have two stages where the first stage would pack the extensions in the VSIX file and upload it to a workspace. Then the second stage would use the same workspace to get the VSIX file and publish it to a GitHub release.

Now once released how we’ll use our extension pack’s VSIX file?

VSIX files uploaded to a GitHub release can be downloaded using the `curl command`. Then we can use the `code [or code-server] --install-extension` command to install the extension pack. If you use an automation script to set up VS Code or code-server then this way you can write a single line in the script to install the extension pack as well.

Cool, now we’ve defined what each stage in the pipeline should do -

✅ What do we release?

✅ How do we release?

✅ How are we using, what we are releasing?

So, let’s write the Travis CI configuration `.travis.yml` -

```yaml
# Language and Node Engine
language: node_js
node_js: 12

# Environment Variables
env:
  global:
    - PACK_NAME=adisakshya-extension-pack
    - VERSION=$(node assets/version.js -p)

# Jobs
jobs:
  include:
    # STAGE 1
    - stage: build
      name: "Build"
      install:
        # Install VSCE
        - npm install --global vsce
      script:
        # Pack extensions
        - npm run pack
      # Create a workspace
      workspaces:
        create:
          name: ws1
          # Upload artifact to the workspace
          paths:
            - ${PACK_NAME}-${VERSION}.vsix
    # STAGE 2
    - stage: GitHub Release
      name: "Publish VSIX file on GitHub Release"
      # Use an existing workspace
      workspaces:
        use: ws1
      install: skip
      script: skip
      # Publish VSIX file to GitHub release
      deploy:
        provider: releases
        api_key: ${GITHUB_SECURE_TOKEN} # The GitHub Access Token
        name: ${VERSION} # Name of release is set as the version of extension pack
        file: ${PACK_NAME}-${VERSION}.vsix # Attach VSIX file with the release
        skip_cleanup: true
        on:
          tags: true
```

Let's push all our changes to the GitHub repository of the project and check the [build stages status](https://travis-ci.com/github/adisakshya/extension-pack/builds/226340367).

![CI Build Stages](https://res.cloudinary.com/adisakshya/image/upload/v1627132522/weblog/extension-pack-for-vscode-and-codeserver/ci-build-stages_otyii9.png)

On success, the VSIX file will be published to a [GitHub release](https://github.com/adisakshya/extension-pack/releases).

![GitHub Release Page](https://res.cloudinary.com/adisakshya/image/upload/v1627132531/weblog/extension-pack-for-vscode-and-codeserver/github-release-page_pgtdf7.png)

The following command will download and install the VSIX file from the latest GitHub release -

```bash
curl https://github.com/adisakshya/extension-pack/releases/latest/download/adisakshya-extension-pack.vsix -O -L && \
code --install-extension adisakshya-extension-pack.vsix
```

The format of the URL to download VSIX file from a specific GitHub release is -

```bash
https://github.com/adisakshya/extension-pack/releases/download/<GIT_TAG>/adisakshya-extension-pack.vsix
```

## Voila!

_Let’s use what we’ve created!_

<video width="100%" height="auto" controls muted>
    <source src="https://res.cloudinary.com/adisakshya/video/upload/v1627494262/weblog/extension-pack-for-vscode-and-codeserver/installing-extension-pack-on-code-server_tpoevc.webm" type="video/mp4">
</video>

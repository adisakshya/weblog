import type { CSSProperties } from "react";
import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import capturedCSS from "../styles/pages/weblog.2021.07.30.extension-pack-for-vscode-and-code-serverhtml-e4fac4dfb04abe88.css?raw";

export const Route = createFileRoute("/baseline/weblog_/2021_/07_/30_/extension-pack-for-vscode-and-code-serverhtml-e4fac4dfb04abe88")({
  head: () => ({ meta: [{ title: "Extension Pack for VSCode \u0026 Code Server - The blog of Adisakshya Chauhan" }] }),
  staticData: { importedDocument: { html: { "lang": "en" }, body: { "className": "layout--single" } } },
  component: Index,
});

function Index() {
  useImportedLayout();
  return (
    <>
      <style>{capturedCSS}</style>
      <nav>
        <h2 className={"screen-reader-text [&:focus]:[box-shadow:rgba(0,0,0,0.6)_0px_0px_2px_2px] [&:focus]:[padding:15px_23px_14px] [&:focus]:[z-index:100000]"}>Skip links</h2>
        <ul className="[margin:0px] [padding:0px]">
          <li className="list-none">
            <a className={"screen-reader-shortcut [&:focus]:[box-shadow:rgba(0,0,0,0.6)_0px_0px_2px_2px] [&:focus]:[padding:15px_23px_14px] [&:focus]:[z-index:100000]"} href="#site-nav">Skip to primary navigation</a>
          </li>
          <li className="list-none">
            <a className={"screen-reader-shortcut [&:focus]:[box-shadow:rgba(0,0,0,0.6)_0px_0px_2px_2px] [&:focus]:[padding:15px_23px_14px] [&:focus]:[z-index:100000]"} href="#main">Skip to content</a>
          </li>
          <li className="list-none">
            <a className={"screen-reader-shortcut [&:focus]:[box-shadow:rgba(0,0,0,0.6)_0px_0px_2px_2px] [&:focus]:[padding:15px_23px_14px] [&:focus]:[z-index:100000]"} href="#footer">Skip to footer</a>
          </li>
        </ul>
      </nav>
      <div className="masthead [animation:0.3s_ease_0.15s_1_normal_both_running_intro] [border-bottom:1px_solid_rgb(242,243,243)] [border-bottom-color:currentcolor] [border-bottom-style:none] [border-bottom-width:medium] [z-index:20]" style={{ opacity: "1" }}>
        <div className="masthead__inner-wrap justify-between p-[1em] [-webkit-box-pack:justify] [margin-left:auto] [margin-right:auto]">
          <div className="masthead__menu clear-both float-left [margin-left:0px] [margin-right:0px] [width:100%]">
            <nav className="greedy-nav items-center min-h-[2em] relative [-webkit-box-align:center] [z-index:10]" id="site-nav"><a className="site-title self-center [margin:0px_1rem] [margin-left:0px]!" href="/">
                The blog of Adisakshya Chauhan
                
              </a><ul className={"\x76isible-links clear-both flex-1 justify-end list-none [-webkit-box-flex:1] [-webkit-box-pack:end] [margin:0px] [overflow:hidden] [padding:0px]"} /><button className="search__toggle [border:0px] [height:2rem] [transition:0.2s]" type="button">{"\n          "}<span className="visually-hidden">Toggle search</span>{"\n          "}<svg className="icon h-[1.1em] relative top-[-0.1em] align-middle w-[1em] [fill:currentcolor] [line-height:1] [overflow:hidden]" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.99 16">{"\n            "}<path d="M15.5,13.12L13.19,10.8a1.69,1.69,0,0,0-1.28-.55l-0.06-.06A6.5,6.5,0,0,0,5.77,0,6.5,6.5,0,0,0,2.46,11.59a6.47,6.47,0,0,0,7.74.26l0.05,0.05a1.65,1.65,0,0,0,.5,1.24l2.38,2.38A1.68,1.68,0,0,0,15.5,13.12ZM6.4,2A4.41,4.41,0,1,1,2,6.4,4.43,4.43,0,0,1,6.4,2Z" transform="translate(-.01)" />{"\n          "}</svg>{"\n        "}</button><button className={"greedy-nav__toggle \x68idden self-center [border:0px]"} type="button" {...({ count: "0" } as any)}>{"\n          "}<span className="visually-hidden">Toggle menu</span>{"\n          "}<div className="navicon [margin:auto]" />{"\n        "}</button><ul className={"hidden-links \x68idden clear-both list-none p-[5px] [box-shadow:rgba(0,0,0,0.16)_0px_2px_4px_0px,rgba(0,0,0,0.12)_0px_2px_10px_0px] [margin:0px] [margin-top:15px]!"} /></nav>
          </div>
        </div>
      </div>
      <div className="dark--toggle items-center h-[2.5em] justify-center fixed top-[9.5em] w-[2.5em] [border-radius:5px_0px_0px_5px] [box-shadow:rgba(0,0,0,0.1)_-4px_7px_10px] [right:0px] [z-index:10]">
        <img className="align-middle [animation:3s_linear_0s_infinite_normal_forwards_running_rotate] [width:60%] [@media_print]:break-inside-avoid [@media_print]:align-middle [@media_print]:[break-after:auto] [@media_print]:[break-before:auto]" alt="sun" src="/site-assets/d367b5c275fcdcf6.webp" />
      </div>
      <div className="flex-[1_0_auto]">
        <div className="[animation:0.3s_ease_0.15s_1_normal_both_running_intro] [margin-left:auto] [margin-right:auto]" style={{ opacity: "1" }} id="main" role="main">
          <ImportedArticleExtensionPackForVSCode />
        </div>
      </div>
      <div className="search-content flex-[1_0_auto] pb-[1em] pt-[1em] invisible">
        <div className="pl-[1em] pr-[1em] [animation:0.3s_ease_0.15s_1_normal_both_running_intro] [margin-left:auto] [margin-right:auto] [width:100%] [@media(min-width:80em)]:max-w-[1280px]">
          <form className="search-content__form p-[1em] [margin:0px_0px_5px]"><label className="absolute [border:0] [clip:rect(0,0,0,0)] [height:1px] [margin:-1px] [overflow:hidden] [padding:0] [width:1px]" htmlFor="search">
            Enter your search term...
          </label><input className="search-input" type="search" id="search" tabIndex={-1} placeholder="Enter your search term..." /></form>
          <div id="results" />
        </div>
      </div>
      <div className="page__footer float-left [animation:0.3s_ease_0.45s_1_normal_both_running_intro] [margin-left:0px] [margin-right:0px] [margin-top:0px] [width:100%]" style={{ opacity: "1" }} id="footer">
        <ImportedFooter />
      </div>
    </>
  );
}

function ImportedArticleExtensionPackForVSCode() {
  return (
    <article className="page [@media(min-width:64em)]:float-right [@media_print]:[margin:0px]" itemScope itemType="https://schema.org/CreativeWork">
      <div className="page__inner-wrap clear-both float-left mt-[1em] [margin-left:0px] [margin-right:0px] [width:100%]">
        <header className="text-center [@media(max-width:830px)]:pl-[1em] [@media(max-width:830px)]:pr-[1em]">
          <h1 className="page__title" id="page-title" itemProp="headline">Extension Pack for VSCode &amp; Code Server
    </h1>
          <p className="page__meta [font-size:0.75em] [@media_print]:[break-before:avoid]"><span>{"\n        "}<i className="far fa-calendar-alt" aria-hidden="true" />{"\n        "}<time dateTime="2021-07-30T06:00:00+00:00">July 30, 2021</time>{"\n      "}</span><span className="page__meta-sep" /><span>{"\n        "}<i className="far fa-clock" aria-hidden="true" />
            
              8 minute read
            
          </span></p>
        </header>
        <div className="tag-list mt-[0.5em] text-center [@media(max-width:830px)]:pl-[1em] [@media(max-width:830px)]:pr-[1em]">
          <div className="tag-container mb-[5px]">
            <a className="tag mr-[5px] p-[5px]" href="/weblog/tags/vscode">#vscode </a>
          </div>
          <div className="tag-container mb-[5px]">
            <a className="tag mr-[5px] p-[5px]" href="/weblog/tags/code-server">#code-server </a>
          </div>
          <div className="tag-container mb-[5px]">
            <a className="tag mr-[5px] p-[5px]" href="/weblog/tags/github">#github </a>
          </div>
          <div className="tag-container mb-[5px]">
            <a className="tag mr-[5px] p-[5px]" href="/weblog/tags/ci-cd">#ci-cd </a>
          </div>
          <div className="tag-container mb-[5px]">
            <a className="tag mr-[5px] p-[5px]" href="/weblog/tags/travis">#travis </a>
          </div>
        </div>
        <hr className="[@media_print]:[height:0px] [@media_print]:[padding:0px]" />
        <div>
          <div className="page__hero mb-[2em] relative [animation:0.3s_ease_0.25s_1_normal_both_running_intro]" style={{ backgroundImage: "url(\"data:,\")", opacity: "1" } as CSSProperties}>
            <img className="page__hero-image align-middle [width:100%] [@media_print]:break-inside-avoid [@media_print]:align-middle [@media_print]:[break-after:auto] [@media_print]:[break-before:auto]" src="/site-assets/00facd6eea28874e.png" alt={"Extension Pack for VSCode & Code Server"} />
          </div>
        </div>
        <section className="page__content [@media(max-width:830px)]:pl-[1em] [@media(max-width:830px)]:pr-[1em]" itemProp="text">
          <p>In this article, we’ll create a common extension pack for VS Code and code-server, explore the involved compatibility issue and Travis Workspaces. Finally, we’ll build a CI/CD pipeline to publish our extension pack to a GitHub release.</p>
          <blockquote className="italic [border-left:6px_solid_var(--font-color)] [border-left-width:0.25rem] [font-weight:500] [margin:2em_1em_2em_0px] [margin-bottom:1.6em]! [margin-top:1.6em]! [padding:10px_15px] [padding-left:1em]!">
            <p>Extension packs in VS Code are useful when we want to bundle and install a set of extensions together. It also provides us with a way to share and organize our favourite extensions.</p>
          </blockquote>
          <h2 className="pb-[0.5em] [border-bottom:1px_solid_rgb(242,243,243)]" id="prerequisites">Prerequisites<a className="header-link" href="#prerequisites" title="Permalink"><span className="absolute [border:0] [clip:rect(0,0,0,0)] [height:1px] [margin:-1px] [overflow:hidden] [padding:0] [width:1px]">Permalink</span><i className="fas fa-link" /></a></h2>
          <p className="[@media_print]:[break-before:avoid]">If you’ve never built an extension before, you’ll need <a href="https://code.visualstudio.com/download">VS Code</a> and <a href="https://nodejs.org/en/download/">NodeJS</a> installed.</p>
          <p>We’ll create a versioned extension pack, so a <a href="https://docs.github.com/en/get-started/quickstart/create-a-repo">git repository</a> is needed where we can maintain the source code of our extension pack. Also on this repository, a CI/CD pipeline will be built later in the article. The extension pack will be published on the repository release page by the pipeline, from where anyone can install and use it.</p>
          <p>The source code of the extension pack created for this article can be found at my GitHub repository - <a href="https://github.com/adisakshya/extension-pack">adisakshya/extension-pack</a>.</p>
          <p>Once NodeJS is installed, the git repository is created and cloned we can move forward to get started.</p>
          <h2 className="pb-[0.5em] [border-bottom:1px_solid_rgb(242,243,243)]" id="installing-yeoman--code-generator">Installing Yeoman &amp; Code Generator<a className="header-link" href="#installing-yeoman--code-generator" title="Permalink"><span className="absolute [border:0] [clip:rect(0,0,0,0)] [height:1px] [margin:-1px] [overflow:hidden] [padding:0] [width:1px]">Permalink</span><i className="fas fa-link" /></a></h2>
          <p className="[@media_print]:[break-before:avoid]">To get started creating an extension pack,</p>
          <p>We’ll need to install the <a href="https://www.npmjs.com/package/yo">Yeoman</a> scaffolding CLI tools as well as the <a href="https://www.npmjs.com/package/generator-code">generator</a>.</p>
          <p>Yeoman can be installed using the following command -</p>
          <div className="highlighter-rouge">
            <div className="highlight">
              <pre className="highlight [width:100%] [@media_print]:whitespace-pre-wrap!">
                <code>npm install -g yo
    </code>
              </pre>
            </div>
          </div>
          <p>Then we can install the generator tools like so -</p>
          <div className="highlighter-rouge">
            <div className="highlight">
              <pre className="highlight [width:100%] [@media_print]:whitespace-pre-wrap!">
                <code>npm install -g generator-code
    </code>
              </pre>
            </div>
          </div>
          <h2 className="pb-[0.5em] [border-bottom:1px_solid_rgb(242,243,243)]" id="generating-a-new-extension-project">Generating a New Extension Project<a className="header-link" href="#generating-a-new-extension-project" title="Permalink"><span className="absolute [border:0] [clip:rect(0,0,0,0)] [height:1px] [margin:-1px] [overflow:hidden] [padding:0] [width:1px]">Permalink</span><i className="fas fa-link" /></a></h2>
          <p className="[@media_print]:[break-before:avoid]">With the correct tools installed, we are now ready to generate a new extension pack project. This is pretty easy as all of the scaffolding is already provided. So all we have to do is add to the list of extensions to be included.</p>
          <p>We can start this process by running the following command in our git project directory (extension-pack) -</p>
          <div className="highlighter-rouge">
            <div className="highlight">
              <pre className="highlight [width:100%] [@media_print]:whitespace-pre-wrap!">
                <code>yo code
    </code>
              </pre>
            </div>
          </div>
          <video width="100%" height="auto" controls muted preload="auto">
            <source src="/site-assets/9936c32c618ce2ae.webm" type="video/mp4" />
          </video>
          <h3 id="understanding-the-generated-code">Understanding the generated code<a className="header-link" href="#understanding-the-generated-code" title="Permalink"><span className="absolute [border:0] [clip:rect(0,0,0,0)] [height:1px] [margin:-1px] [overflow:hidden] [padding:0] [width:1px]">Permalink</span><i className="fas fa-link" /></a></h3>
          <p className="[@media_print]:[break-before:avoid]">The following directory structure will be created inside the project directory by the generator -</p>
          <div className="highlighter-rouge">
            <div className="highlight">
              <pre className="highlight [width:100%] [@media_print]:whitespace-pre-wrap!">
                <code>+-- .vscode
    |   +-- launch.json
    +-- .vscodeignore
    +-- CHANGELOG.md
    +-- package.json
    +-- README.md
    +-- vsc-extension-quickstart.md
    </code>
              </pre>
            </div>
          </div>
          <p>Let’s explore everything in it -</p>
          <ul>
            <li><code className="highlighter-rouge">vscode/launch.json</code> is a file used to configure the debugger in VS Code.</li>
            <li>The <code className="highlighter-rouge">.vscodeignore</code> file excludes some files from being included in your extension’s package.</li>
            <li>Record of all notable changes made to the project is maintained in <code className="highlighter-rouge">CHANGELOG.md</code>.</li>
            <li><code className="highlighter-rouge">README.md</code> is the project readme file, it’ll also be used in the extension packs page in the VS Code marketplace.</li>
            <li>Every VS Code extension needs a manifest file <code className="highlighter-rouge">package.json</code> at the root of the project directory structure. Most of the time we’ll find ourselves tweaking the manifest file. A great reference can be found here at <a href="https://code.visualstudio.com/api/references/extension-manifest">VS Code API Reference</a>.</li>
            <li><code className="highlighter-rouge">vsc-extension-quickstart.md</code> feature some quick-start tips.</li>
          </ul>
          <h2 className="pb-[0.5em] [border-bottom:1px_solid_rgb(242,243,243)]" id="make-it-yours">Make it yours<a className="header-link" href="#make-it-yours" title="Permalink"><span className="absolute [border:0] [clip:rect(0,0,0,0)] [height:1px] [margin:-1px] [overflow:hidden] [padding:0] [width:1px]">Permalink</span><i className="fas fa-link" /></a></h2>
          <p className="[@media_print]:[break-before:avoid]">Cool, so now that we understand (hopefully 😅) what everything means! We can move forward to update the <code className="highlighter-rouge">package.json</code> manifest to customize our extension pack. The field names are quite clear with their meaning.</p>
          <p>First things first - Let’s name, describe and version our package.</p>
          <div className="highlighter-rouge">
            <div className="highlight">
              <pre className="highlight [width:100%] [@media_print]:whitespace-pre-wrap!">
                <code>
                  <span className="nl">"name"</span>
                  <span className="p">:</span>
                  <span className="w">{" "}</span>
                  <span className="s2">"adisakshya-extension-pack"</span>
                  <span className="err">,</span>
                  <span className="w">{"\n"}</span>
                  <span className="nl">"displayName"</span>
                  <span className="p">:</span>
                  <span className="w">{" "}</span>
                  <span className="s2">"adisakshya-extension-pack"</span>
                  <span className="err">,</span>
                  <span className="w">{"\n"}</span>
                  <span className="nl">"description"</span>
                  <span className="p">:</span>
                  <span className="w">{" "}</span>
                  <span className="s2">"Adisakshya's extension-pack for VS Code &amp; Code Server"</span>
                  <span className="err">,</span>
                  <span className="w">{"\n"}</span>
                  <span className="nl">"version"</span>
                  <span className="p">:</span>
                  <span className="w">{" "}</span>
                  <span className="s2">"1.0.0"</span>
                  <span className="w">{"\n"}</span>
                </code>
              </pre>
            </div>
          </div>
          <p>Second things second - Update the list of extensions in our pack.</p>
          <p>The <code className="highlighter-rouge">extensionPack</code> field is a list of <code className="highlighter-rouge">extension-ids</code>. The ID of the extension can be obtained from VS Code Marketplace.</p>
          <div className="highlighter-rouge">
            <div className="highlight">
              <pre className="highlight [width:100%] [@media_print]:whitespace-pre-wrap!">
                <code>
                  <span className="nl">"extensionPack"</span>
                  <span className="p">:</span>
                  <span className="w">{" "}</span>
                  <span className="p">[</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"cssho.vscode-svgviewer"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"docsmsft.docs-markdown"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"eamodio.gitlens"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"EditorConfig.EditorConfig"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"esbenp.prettier-vscode"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"formulahendry.code-runner"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"GitHub.github-vscode-theme"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"GrapeCity.gc-excelviewer"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"humao.rest-client"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"johnpapa.vscode-peacock"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"ms-azuretools.vscode-docker"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"ms-python.python"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"ms-python.vscode-pylance"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"ms-vscode-remote.vscode-remote-extensionpack"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"ms-vscode.cpptools"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"ms-vscode.vscode-typescript-next"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"ritwickdey.LiveServer"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"VisualStudioExptTeam.vscodeintellicode"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"vscode-icons-team.vscode-icons"</span>
                  <span className="p">,</span>
                  <span className="w">{"\n    "}</span>
                  <span className="s2">"vsls-contrib.codetour"</span>
                  <span className="w">{"\n"}</span>
                  <span className="p">]</span>
                  <span className="w">{"\n"}</span>
                </code>
              </pre>
            </div>
          </div>
          <p>Third things third - Specify an icon</p>
          <p>We can specify an icon for our extension pack by placing our icon-file.png in our project directory. Its path has to be mentioned in the <code className="highlighter-rouge">package.json</code> manifest like -</p>
          <div className="highlighter-rouge">
            <div className="highlight">
              <pre className="highlight [width:100%] [@media_print]:whitespace-pre-wrap!">
                <code>
                  <span className="nl">"icon"</span>
                  <span className="p">:</span>
                  <span className="w">{" "}</span>
                  <span className="s2">"path/to/icon-file.png"</span>
                  <span className="w">{"\n"}</span>
                </code>
              </pre>
            </div>
          </div>
          <p>Now that we’ve specified what extensions need to be included and other associated information. We can pack the extensions in a file that can be used to install the extension pack on VS Code and code-server.</p>
          <h2 className="pb-[0.5em] [border-bottom:1px_solid_rgb(242,243,243)]" id="packing-the-extensions">Packing the extensions<a className="header-link" href="#packing-the-extensions" title="Permalink"><span className="absolute [border:0] [clip:rect(0,0,0,0)] [height:1px] [margin:-1px] [overflow:hidden] [padding:0] [width:1px]">Permalink</span><i className="fas fa-link" /></a></h2>
          <p className="[@media_print]:[break-before:avoid]">Visual Studio Code Extensions (aka <a href="https://www.npmjs.com/package/vsce">vsce</a>) is a command-line tool for packing, publishing and managing VS Code extensions. It can be installed using the following command -</p>
          <div className="highlighter-rouge">
            <div className="highlight">
              <pre className="highlight [width:100%] [@media_print]:whitespace-pre-wrap!">
                <code>npm install --global vsce
    </code>
              </pre>
            </div>
          </div>
          <p>We’ll choose to pack our extension into a <code className="highlighter-rouge">VSIX</code> file, using which people who wish to use the same pack can install it.</p>
          <p>We can package the extensions in a VSIX file using the following command in our project directory -</p>
          <div className="highlighter-rouge">
            <div className="highlight">
              <pre className="highlight [width:100%] [@media_print]:whitespace-pre-wrap!">
                <code>vsce package
    </code>
              </pre>
            </div>
          </div>
          <p>For users who receive the <code className="highlighter-rouge">VSIX</code> file, they can install the extension pack on VS Code and code-server like so -</p>
          <div className="highlighter-rouge">
            <div className="highlight">
              <pre className="highlight [width:100%] [@media_print]:whitespace-pre-wrap!">
                <code># VS Code
    code --install-extension adisakshya-extension-pack-1.0.0.vsix

    # Code Server
    code-server --install-extension adisakshya-extension-pack-1.0.0.vsix
    </code>
              </pre>
            </div>
          </div>
          <p>A handy NPM script can be included in <code className="highlighter-rouge">package.json</code> -</p>
          <div className="highlighter-rouge">
            <div className="highlight">
              <pre className="highlight [width:100%] [@media_print]:whitespace-pre-wrap!">
                <code>
                  <span className="nl">"scripts"</span>
                  <span className="p">:</span>
                  <span className="w">{" "}</span>
                  <span className="p">&#123;</span>
                  <span className="w">{"\n    "}</span>
                  <span className="nl">"pack"</span>
                  <span className="p">:</span>
                  <span className="w">{" "}</span>
                  <span className="s2">"vsce package"</span>
                  <span className="w">{"\n"}</span>
                  <span className="p">&#125;</span>
                  <span className="w">{"\n"}</span>
                </code>
              </pre>
            </div>
          </div>
          <p>This can be used as an <code className="highlighter-rouge">npm run pack</code> or <code className="highlighter-rouge">yarn run pack</code> in CI.</p>
          <h2 className="pb-[0.5em] [border-bottom:1px_solid_rgb(242,243,243)]" id="understanding-the-vs-code-compatibility">Understanding the VS Code compatibility<a className="header-link" href="#understanding-the-vs-code-compatibility" title="Permalink"><span className="absolute [border:0] [clip:rect(0,0,0,0)] [height:1px] [margin:-1px] [overflow:hidden] [padding:0] [width:1px]">Permalink</span><i className="fas fa-link" /></a></h2>
          <p className="[@media_print]:[break-before:avoid]">This is one of the most important things we (or at least I) unconsciously ignored.</p>
          <p>I packed the extensions in a VSIX file and tried installing it on my local system with VS Code installed. Great, it worked as expected.</p>
          <p>I took the same VSIX file and tried installing it on a code-server setup in Windows Subsystem for Linux (WSL). And… saw the below message -</p>
          <p>
            <img className="align-middle [@media_print]:break-inside-avoid [@media_print]:align-middle [@media_print]:[break-after:auto] [@media_print]:[break-before:auto]" src="/site-assets/fdc219c17c819a01.png" alt="VS Code Compatibility Error Message" />
          </p>
          <p>Okay… so it said - <strong>Unable to install extension ‘adisakshya-extension-pack’ as it is not compatible with VS Code ‘1.53.2’</strong>. I figured out that it had something to do with the version of VS Code for which the extension pack was created.</p>
          <p>One thing that looked SUS was the <code className="highlighter-rouge">engines.vscode</code> field inside <code className="highlighter-rouge">package.json</code>, which was the only thing I left as default. I went through the VS Code Extension API Reference to find out what this field really is and what I found was -</p>
          <blockquote className="italic [border-left:6px_solid_var(--font-color)] [border-left-width:0.25rem] [font-weight:500] [margin:2em_1em_2em_0px] [margin-bottom:1.6em]! [margin-top:1.6em]! [padding:10px_15px] [padding-left:1em]!">
            <p>When authoring an extension, you will need to describe what is the extension’s compatibility to Visual Studio Code itself. — <a href="https://code.visualstudio.com/api/working-with-extensions/publishing-extension#visual-studio-code-compatibility">API Reference</a></p>
          </blockquote>
          <p>The <code className="highlighter-rouge">engines.vscode</code> field is an object that contains a key matching the versions of VS Code that the extension or extension pack is compatible with. If I’m generating the scaffolding code on my system then this field is set to the version of VS Code I’m using by default.</p>
          <div className="highlighter-rouge">
            <div className="highlight">
              <pre className="highlight [width:100%] [@media_print]:whitespace-pre-wrap!">
                <code>
                  <span className="nl">"engines"</span>
                  <span className="p">:</span>
                  <span className="w">{" "}</span>
                  <span className="p">&#123;</span>
                  <span className="w">{"\n    "}</span>
                  <span className="nl">"vscode"</span>
                  <span className="p">:</span>
                  <span className="w">{" "}</span>
                  <span className="s2">"^1.56.0"</span>
                  <span className="w">{"\n"}</span>
                  <span className="p">&#125;</span>
                  <span className="w">{"\n"}</span>
                </code>
              </pre>
            </div>
          </div>
          <p>I was using the <code className="highlighter-rouge">1.56.0</code> version of VS Code and generated the VSIX file with this configuration. <code className="highlighter-rouge">1.53.0</code> was the version of VS Code associated with the code-server release that I was using.</p>
          <p>Okay, the extension pack that I created was meant to be compatible with version <code className="highlighter-rouge">1.56.0</code> and above. While the code-server was using <code className="highlighter-rouge">1.53.0</code> — this was the reason for that incompatibility message!</p>
          <p>I updated the <code className="highlighter-rouge">engines.vscode</code> field to <code className="highlighter-rouge">^1.53.0</code> to make it work, but still, the installation failed on code-server as some extensions inside the pack were not compatible with this version of VS Code. So next possible solution was to upgrade the code-server.</p>
          <p>I installed the <code className="highlighter-rouge">3.10.2</code> version of code-server which used VS Code <code className="highlighter-rouge">1.56.0</code> and tried installing my extension pack with <code className="highlighter-rouge">engines.vscode</code> field set to <code className="highlighter-rouge">1.56.0</code>. Great, it worked!</p>
          <p>So,</p>
          <blockquote className="italic [border-left:6px_solid_var(--font-color)] [border-left-width:0.25rem] [font-weight:500] [margin:2em_1em_2em_0px] [margin-bottom:1.6em]! [margin-top:1.6em]! [padding:10px_15px] [padding-left:1em]!">
            <p>Before packing our extension we must ensure that we’ve mentioned the <code className="highlighter-rouge">engines.vscode</code> field correctly according to our use.</p>
          </blockquote>
          <p>To find out what version of VS Code engine is our code-server setup using, see the Welcome Screen -</p>
          <p>
            <img className="align-middle [@media_print]:break-inside-avoid [@media_print]:align-middle [@media_print]:[break-after:auto] [@media_print]:[break-before:auto]" src="/site-assets/4fe68a95b47f7dca.png" alt="Code Server Welcome Screen" />
          </p>
          <h2 className="pb-[0.5em] [border-bottom:1px_solid_rgb(242,243,243)]" id="publishing-the-extension-pack">Publishing the extension pack<a className="header-link" href="#publishing-the-extension-pack" title="Permalink"><span className="absolute [border:0] [clip:rect(0,0,0,0)] [height:1px] [margin:-1px] [overflow:hidden] [padding:0] [width:1px]">Permalink</span><i className="fas fa-link" /></a></h2>
          <p className="[@media_print]:[break-before:avoid]">We’ll be publishing the <code className="highlighter-rouge">VSIX</code> file of our extension pack to a GitHub Release using Travis CI. Let’s define our expectations — The CI workflow should do the following -</p>
          <ol>
            <li>Pack the extensions in a VSIX file</li>
            <li>Publish the VSIX file to GitHub release</li>
            <li>We should be able to download the latest release of the extension pack (using a single terminal command so that we don’t have to install it from the marketplace every time and can use this command in automation scripts)</li>
          </ol>
          <p>While writing the Travis YML file I came across a much-awaited (at least for me) beta feature - <a href="https://docs.travis-ci.com/user/using-workspaces">Workspaces</a>.</p>
          <blockquote className="italic [border-left:6px_solid_var(--font-color)] [border-left-width:0.25rem] [font-weight:500] [margin:2em_1em_2em_0px] [margin-bottom:1.6em]! [margin-top:1.6em]! [padding:10px_15px] [padding-left:1em]!">
            <p>Workspaces allow jobs within a build to share files. They are useful when you want to use build artefacts from a previous job. — Travis Workspaces Docs</p>
          </blockquote>
          <p>Cool, this means we can have two stages where the first stage would pack the extensions in the VSIX file and upload it to a workspace. Then the second stage would use the same workspace to get the VSIX file and publish it to a GitHub release.</p>
          <p>Now once released how we’ll use our extension pack’s VSIX file?</p>
          <p>VSIX files uploaded to a GitHub release can be downloaded using the <code className="highlighter-rouge">curl command</code>. Then we can use the <code className="highlighter-rouge">code [or code-server] --install-extension</code> command to install the extension pack. If you use an automation script to set up VS Code or code-server then this way you can write a single line in the script to install the extension pack as well.</p>
          <p>Cool, now we’ve defined what each stage in the pipeline should do -</p>
          <p>✅ What do we release?</p>
          <p>✅ How do we release?</p>
          <p>✅ How are we using, what we are releasing?</p>
          <p>So, let’s write the Travis CI configuration <code className="highlighter-rouge">.travis.yml</code> -</p>
          <div className="highlighter-rouge">
            <div className="highlight">
              <pre className="highlight [width:100%] [@media_print]:whitespace-pre-wrap!">
                <code><span className="c1"># Language and Node Engine</span>{"\n"}<span className="na">language</span><span className="pi">:</span>{" "}<span className="s">node_js</span>{"\n"}<span className="na">node_js</span><span className="pi">:</span>{" "}<span className="m">12</span>{"\n\n"}<span className="c1"># Environment Variables</span>{"\n"}<span className="na">env</span><span className="pi">:</span>{"\n  "}<span className="na">global</span><span className="pi">:</span>{"\n    "}<span className="pi">-</span>{" "}<span className="s">PACK_NAME=adisakshya-extension-pack</span>{"\n    "}<span className="pi">-</span>{" "}<span className="s">VERSION=$(node assets/version.js -p)</span>{"\n\n"}<span className="c1"># Jobs</span>{"\n"}<span className="na">jobs</span><span className="pi">:</span>{"\n  "}<span className="na">include</span><span className="pi">:</span>{"\n    "}<span className="c1"># STAGE 1</span>{"\n    "}<span className="pi">-</span>{" "}<span className="na">stage</span><span className="pi">:</span>{" "}<span className="s">build</span>{"\n      "}<span className="na">name</span><span className="pi">:</span>{" "}<span className="s2">"</span><span className="s">Build"</span>{"\n      "}<span className="na">install</span><span className="pi">:</span>{"\n        "}<span className="c1"># Install VSCE</span>{"\n        "}<span className="pi">-</span>{" "}<span className="s">npm install --global vsce</span>{"\n      "}<span className="na">script</span><span className="pi">:</span>{"\n        "}<span className="c1"># Pack extensions</span>{"\n        "}<span className="pi">-</span>{" "}<span className="s">npm run pack</span>{"\n      "}<span className="c1"># Create a workspace</span>{"\n      "}<span className="na">workspaces</span><span className="pi">:</span>{"\n        "}<span className="na">create</span><span className="pi">:</span>{"\n          "}<span className="na">name</span><span className="pi">:</span>{" "}<span className="s">ws1</span>{"\n          "}<span className="c1"># Upload artifact to the workspace</span>{"\n          "}<span className="na">paths</span><span className="pi">:</span>{"\n            "}<span className="pi">-</span>{" "}<span className="s">$&#123;PACK_NAME&#125;-$&#123;VERSION&#125;.vsix</span>{"\n    "}<span className="c1"># STAGE 2</span>{"\n    "}<span className="pi">-</span>{" "}<span className="na">stage</span><span className="pi">:</span>{" "}<span className="s">GitHub Release</span>{"\n      "}<span className="na">name</span><span className="pi">:</span>{" "}<span className="s2">"</span><span className="s">Publish</span><span className="nv">{" "}</span><span className="s">VSIX</span><span className="nv">{" "}</span><span className="s">file</span><span className="nv">{" "}</span><span className="s">on</span><span className="nv">{" "}</span><span className="s">GitHub</span><span className="nv">{" "}</span><span className="s">Release"</span>{"\n      "}<span className="c1"># Use an existing workspace</span>{"\n      "}<span className="na">workspaces</span><span className="pi">:</span>{"\n        "}<span className="na">use</span><span className="pi">:</span>{" "}<span className="s">ws1</span>{"\n      "}<span className="na">install</span><span className="pi">:</span>{" "}<span className="s">skip</span>{"\n      "}<span className="na">script</span><span className="pi">:</span>{" "}<span className="s">skip</span>{"\n      "}<span className="c1"># Publish VSIX file to GitHub release</span>{"\n      "}<span className="na">deploy</span><span className="pi">:</span>{"\n        "}<span className="na">provider</span><span className="pi">:</span>{" "}<span className="s">releases</span>{"\n        "}<span className="na">api_key</span><span className="pi">:</span>{" "}<span className="s">$&#123;GITHUB_SECURE_TOKEN&#125;</span>{" "}<span className="c1"># The GitHub Access Token</span>{"\n        "}<span className="na">name</span><span className="pi">:</span>{" "}<span className="s">$&#123;VERSION&#125;</span>{" "}<span className="c1"># Name of release is set as the version of extension pack</span>{"\n        "}<span className="na">file</span><span className="pi">:</span>{" "}<span className="s">$&#123;PACK_NAME&#125;-$&#123;VERSION&#125;.vsix</span>{" "}<span className="c1"># Attach VSIX file with the release</span>{"\n        "}<span className="na">skip_cleanup</span><span className="pi">:</span>{" "}<span className="no">true</span>{"\n        "}<span className="na">on</span><span className="pi">:</span>{"\n          "}<span className="na">tags</span><span className="pi">:</span>{" "}<span className="no">true</span>{"\n"}</code>
              </pre>
            </div>
          </div>
          <p>Let’s push all our changes to the GitHub repository of the project and check the <a href="https://travis-ci.com/github/adisakshya/extension-pack/builds/226340367">build stages status</a>.</p>
          <p>
            <img className="align-middle [@media_print]:break-inside-avoid [@media_print]:align-middle [@media_print]:[break-after:auto] [@media_print]:[break-before:auto]" src="/site-assets/0ab5004849ec9ff2.png" alt="CI Build Stages" />
          </p>
          <p>On success, the VSIX file will be published to a <a href="https://github.com/adisakshya/extension-pack/releases">GitHub release</a>.</p>
          <p>
            <img className="align-middle [@media_print]:break-inside-avoid [@media_print]:align-middle [@media_print]:[break-after:auto] [@media_print]:[break-before:auto]" src="/site-assets/f318ab6b9fc69f79.png" alt="GitHub Release Page" />
          </p>
          <p>The following command will download and install the VSIX file from the latest GitHub release -</p>
          <div className="highlighter-rouge">
            <div className="highlight">
              <pre className="highlight [width:100%] [@media_print]:whitespace-pre-wrap!">
                <code>curl https://github.com/adisakshya/extension-pack/releases/latest/download/adisakshya-extension-pack.vsix <span className="nt">-O</span>{" "}<span className="nt">-L</span>{" "}<span className="o">&amp;&amp;</span>{" "}<span className="se">\</span>
    code <span className="nt">--install-extension</span> adisakshya-extension-pack.vsix
    </code>
              </pre>
            </div>
          </div>
          <p>The format of the URL to download VSIX file from a specific GitHub release is -</p>
          <div className="highlighter-rouge">
            <div className="highlight">
              <pre className="highlight [width:100%] [@media_print]:whitespace-pre-wrap!">
                <code>https://github.com/adisakshya/extension-pack/releases/download/&lt;GIT_TAG&gt;/adisakshya-extension-pack.vsix
    </code>
              </pre>
            </div>
          </div>
          <h2 className="pb-[0.5em] [border-bottom:1px_solid_rgb(242,243,243)]" id="voila">Voila!<a className="header-link" href="#voila" title="Permalink"><span className="absolute [border:0] [clip:rect(0,0,0,0)] [height:1px] [margin:-1px] [overflow:hidden] [padding:0] [width:1px]">Permalink</span><i className="fas fa-link" /></a></h2>
          <p className="[@media_print]:[break-before:avoid]">
            <em>Let’s use what we’ve created!</em>
          </p>
          <video width="100%" height="auto" controls muted preload="auto">
            <source src="/site-assets/82f90aa60176532f.webm" type="video/mp4" />
          </video>
          <hr className="[@media_print]:[height:0px] [@media_print]:[padding:0px]" />
          <h2 className="pb-[0.5em] [border-bottom:1px_solid_rgb(242,243,243)]">Contribution</h2>
          <p className="[@media_print]:[break-before:avoid]">
        Enjoyed the article, found it useful or learned something new? Consider sharing it so more people can benefit from it! 
        Also, feel free to @ me on <a href="https://twitter.com/adisakshya" rel="nofollow noopener noreferrer">Twitter</a> with your opinions.
        <br /><br />
        Found a mistake? Feel free to report it at
        <a href="https://github.com/adisakshya/weblog/issues" rel="nofollow noopener noreferrer">GitHub issues</a>
        or fix it using a 
        <a href="https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests" rel="nofollow noopener noreferrer">PR</a>
        at
        <a href="https://github.com/adisakshya/weblog" rel="nofollow noopener noreferrer">adisakshya/weblog</a>.
    </p>
        </section>
        <div className="page__comments clear-both float-left pl-[1em] pr-[1em] [margin-left:0px] [margin-right:0px] [width:100%]">
          <section id="static-comments">
            <div>
              <h4 className="page__comments-title uppercase [padding-top:2rem]">Comments</h4>
              <article className="comment [margin:1em_0px]" id="comment1" itemProp="comment" itemScope itemType="https://schema.org/Comment">
                <div className="comment__avatar-wrapper float-left">
                  <img className="comment__avatar align-middle [@media(min-width:64em)]:p-[5px] [@media_print]:break-inside-avoid [@media_print]:align-middle [@media_print]:[break-after:auto] [@media_print]:[break-before:auto]" src="/site-assets/666b91264d042b2e.png" alt="Antoinette" />
                </div>
                <div className="comment__content-wrapper float-none"><h3 className="comment__author" itemProp="author" itemScope itemType="https://schema.org/Person"><span itemProp="name"><a className="capitalize" rel="external nofollow">Antoinette</a></span></h3>
        on
        <p className="comment__date [font-size:1.125em] [@media_print]:[break-before:avoid]"><a href="#comment1" itemProp="url">{"\n        "}<time dateTime="2021-10-04T22:54:50+00:00" itemProp="datePublished">October 4, 2021</time>{"\n        "}</a></p><hr className="comment-separator [@media_print]:[height:0px] [@media_print]:[padding:0px]" /><div className="[@media(min-width:370px)_and_(max-width:1000px)]:float-right [@media(min-width:370px)_and_(max-width:1000px)]:w-[calc(100%_-_60px)]" itemProp="text"><p>Touche. Great arguments. Keep up the amazing effort.</p><p>Here is my site - <a href="https://toshangrilainn.com/" title="https://toshangrilainn.com/">https://toshangrilainn.com/</a></p></div></div>
              </article>
            </div>
            <div className="page__comments-form [transition:0.2s_ease-in-out]">
              <h4 className="page__comments-title uppercase [padding-top:2rem]">Leave a Comment</h4>
              <form className="page__comments-form form p-[1em] [margin:0px_0px_5px] [transition:0.2s_ease-in-out]" id="new_comment" method="post">
                <input name="options[redirect]" type="hidden" defaultValue="https://adisakshya.github.io/weblog//2021/07/30/extension-pack-for-vscode-and-code-server.html" />
                <div className="form__spinner absolute [left:50%] [top:50%] [z-index:11]"><i className="fas fa-spinner fa-3x text-center w-[1.25em] [-webkit-animation:fa-spin_2s_linear_infinite] [animation:fa-spin_2s_linear_infinite]" /><span className="absolute [border:0] [clip:rect(0,0,0,0)] [height:1px] [margin:-1px] [overflow:hidden] [padding:0] [width:1px]">Loading...</span></div>
                <div className="form-group mb-[5px] [border-width:0px] [padding:0px]" id="comment-form-message-container"><label className="mb-[0.25em]" htmlFor="comment-form-message">Comment <small className="required [font-size:0.75em] [font-weight:bold]">*</small></label><textarea className="resize-y [height:auto] [overflow:auto]" rows={3} id="comment-form-message" name="fields[message]" tabIndex={1} {...({ type: "text" } as any)} /></div>
                <div className="form-group mb-[5px] [border-width:0px] [padding:0px] [@media(min-width:540px)]:mr-[3%] [@media(min-width:540px)]:w-[48%]" id="comment-form-name-container"><label className="mb-[0.25em]" htmlFor="comment-form-name">Name <small className="required [font-size:0.75em] [font-weight:bold]">*</small></label><input type="text" id="comment-form-name" name="fields[name]" tabIndex={2} /></div>
                <div className="form-group mb-[5px] [border-width:0px] [padding:0px] [@media(min-width:540px)]:w-[48%]" id="comment-form-email-container"><label className="mb-[0.25em]" htmlFor="comment-form-email">Email address <small className="required [font-size:0.75em] [font-weight:bold]">*</small></label><input type="email" id="comment-form-email" name="fields[email]" tabIndex={3} /></div>
                <div className={"form-group \x68idden mb-[5px] [border-width:0px] [padding:0px]"} style={{ display: "none" }}><input type="hidden" name="options[slug]" defaultValue="extension-pack-for-vscode-and-code-server" /><label className="mb-[0.25em]" htmlFor="comment-form-location">Not used. Leave blank if you are a human.</label><input type="text" id="comment-form-location" name="fields[hidden]" autoComplete="off" /></div>
                <p className={"\x68idden"}>
                  <strong />
                </p>
                <div className="form-group mb-[5px] [border-width:0px] [padding:0px]">
                  <button className="btn btn--primary btn--large" type="submit" id="comment-form-submit" tabIndex={5}>Submit Comment</button>
                </div>
              </form>
              <p className="small [font-size:0.75em]">
                    All comments are held for moderation so there can be a delay until they appear. <br />
                    Comments may be written in <a href="https://daringfireball.net/projects/markdown/">Markdown</a>. <br />
                    Your email address is not published or stored in any way, it's used to get your Globally Recognised Avatar (<a href="https://gravatar.com/">Gravatar</a>).
                  </p>
            </div>
          </section>
        </div>
        <nav className="pagination float-left text-center [width:100%] [@media(max-width:830px)]:pl-[1em] [@media(max-width:830px)]:pr-[1em]"><a className="pagination--pager float-left p-[1em] text-left" href="#" rel="prev">{"\n        "}{"\n        "}<span className={"[&:hover]:underline"}>Top</span>{"\n      "}</a><a className="pagination--pager float-left p-[1em] text-right [margin-left:-1px]" href="/weblog/2022/02/01/introduction-to-api-gatewayhtml-15c5567b947ce157" rel="next">{"\n        "}<span className={"[&:hover]:underline"}>Introduction to API Gateway
    </span>{"\n        "}<br />{"\n        "}<span className="m-[0.1em] [font-size:2em]">→</span>{"\n      "}</a></nav>
      </div>
    </article>
  );
}

function ImportedFooter() {
  return (
    <footer className="mt-[2em] [margin-left:auto] [margin-right:auto] [padding:0px_1em_2em] [@media(max-width:730px)]:text-center">
      <div className="page__footer-follow row">
        <div className="footer-pages row">
          <ul className="footer-pages-list list-none [margin:0px] [padding:0px]">
            <li className="pb-[5px] pt-[5px] uppercase [font-size:0.7em]">
              <a className="page-link p-[5px]" href="/" rel="nofollow noopener noreferrer">
              Home
            </a>
            </li>
            <li className="pb-[5px] pt-[5px] uppercase [font-size:0.7em]">
              <a className="page-link p-[5px]" href="/weblog/contact" rel="nofollow noopener noreferrer">
              Contact
            </a>
            </li>
            <li className="pb-[5px] pt-[5px] uppercase [font-size:0.7em]">
              <a className="page-link p-[5px]" href="/weblog/terms" rel="nofollow noopener noreferrer">
            Terms &amp; policies
            </a>
            </li>
          </ul>
        </div>
        <div className="social-icons row [@media(min-width:740px)]:float-right">
          <ul className="list-none [margin:0px] [padding:0px]">
            <li className="pb-[5px] pt-[5px] uppercase [font-size:0.75em]">
              <a className="icon-button twitter whitespace-nowrap [padding-right:0px]" href="https://twitter.com/adisakshya" rel="nofollow noopener noreferrer" title="Connect on Twitter">
                <i className="fab fa-twitter rounded-[1.4rem] h-[1.4rem] relative text-center select-none w-[1.4rem] [cursor:pointer] [margin:0px_5px_10px]" aria-hidden="true" />
              </a>
            </li>
            <li className="pb-[5px] pt-[5px] uppercase [font-size:0.75em]">
              <a className="icon-button github whitespace-nowrap [padding-right:0px]" href="https://github.com/adisakshya" rel="nofollow noopener noreferrer" title="Follow on GitHub">
                <i className="fab fa-github rounded-[1.4rem] h-[1.4rem] relative text-center select-none w-[1.4rem] [cursor:pointer] [margin:0px_5px_10px]" aria-hidden="true" />
              </a>
            </li>
            <li className="pb-[5px] pt-[5px] uppercase [font-size:0.75em]">
              <a className="icon-button website whitespace-nowrap [padding-right:0px]" href="/" rel="nofollow noopener noreferrer" title="Adisakshya's personal website">
                <i className="fab fa-firefox rounded-[1.4rem] h-[1.4rem] relative text-center select-none w-[1.4rem] [cursor:pointer] [margin:0px_5px_10px]" aria-hidden="true" />
              </a>
            </li>
            <li className="pb-[5px] pt-[5px] uppercase [font-size:0.75em]">
              <a className="icon-button linkedin whitespace-nowrap [padding-right:0px]" href="https://www.linkedin.com/in/adisakshya/" rel="nofollow noopener noreferrer" title="Connect on LinkedIn">
                <i className="fab fa-linkedin rounded-[1.4rem] h-[1.4rem] relative text-center select-none w-[1.4rem] [cursor:pointer] [margin:0px_5px_10px]" aria-hidden="true" />
              </a>
            </li>
            <li className="pb-[5px] pt-[5px] uppercase [font-size:0.75em]">
              <a className="icon-button google whitespace-nowrap [padding-right:0px]" href="mailto:adisakshya98@gmail.com" rel="nofollow noopener noreferrer" title="Drop an email">
                <i className="fab fa-google rounded-[1.4rem] h-[1.4rem] relative text-center select-none w-[1.4rem] [cursor:pointer] [margin:0px_5px_10px]" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="page__footer-copyright text-center [font-size:0.6875em]">
      © <span id="current-year">2026</span> Adisakshya Chauhan
      <br />
      Built in New Delhi, India
      (<a href="https://github.com/adisakshya/weblog" rel="nofollow">view source</a>)
    </div>
    </footer>
  );
}


function useImportedLayout() {
  useEffect(() => {
    const loopingVideos = Array.from(
      document.querySelectorAll<HTMLVideoElement>("video[loop]:not([autoplay]):not([controls])"),
    )
      .filter((video) => video.muted && !video.closest("[data-site-import-carousel-store]"))
      .slice(0, 32);
    const videoObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      }
    });
    loopingVideos.forEach((video) => videoObserver.observe(video));
    return () => {
      videoObserver.disconnect();
      loopingVideos.forEach((video) => video.pause());
    };
  }, []);
}

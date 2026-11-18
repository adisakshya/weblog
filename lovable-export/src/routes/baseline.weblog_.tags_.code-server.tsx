import { createFileRoute } from "@tanstack/react-router";
import capturedCSS from "../styles/pages/weblog.tags.code-server.css?raw";

export const Route = createFileRoute("/baseline/weblog_/tags_/code-server")({
  head: () => ({ meta: [{ title: "Code Server - The blog of Adisakshya Chauhan" }] }),
  staticData: { importedDocument: { html: { "lang": "en" }, body: { "className": "layout--tag" } } },
  component: Index,
});

function Index() {
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
        <img className="align-middle [animation:3s_linear_0s_infinite_normal_forwards_running_rotate] [height:auto] [width:60%] [@media_print]:break-inside-avoid [@media_print]:align-middle [@media_print]:[break-after:auto] [@media_print]:[break-before:auto]" alt="sun" src="/site-assets/d367b5c275fcdcf6.webp" />
      </div>
      <div className="flex-[1_0_auto]">
        <div className="pl-[1em] pr-[1em] [animation:0.3s_ease_0.15s_1_normal_both_running_intro] [margin-left:auto] [margin-right:auto]" style={{ opacity: "1" }} id="main" role="main">
          <div className="archive mb-[2em] mt-[1em] [@media(min-width:64em)]:float-right">
            <div className="mt-[1em]">
              <div className="list__item">
                <article className="archive__item cards tag_head rounded-[5px] p-[0.8rem] relative [gap:1rem] [margin-bottom:1rem] [@media(min-width:600px)]:grid-cols-[repeat(2,1fr)]" itemScope itemType="https://schema.org/CreativeWork">
                  <div className="card [padding:0.5rem]">
            TAG
            <h2 className="archive__item-title text-ellipsis [overflow:hidden]" itemProp="headline">
              Code Server
            </h2><p className="archive__item-excerpt mt-[0.5em] [font-size:0.75em]" itemProp="description">
                Post listing for the tag code-server.

              </p></div>
                  <div className="archive__item-teaser card rounded-[4px] relative [overflow:hidden] [padding:0.5rem]">
                    <img className="align-middle [box-shadow:rgba(0,0,0,0.19)_3px_9px_6px_-1px] [height:auto] [width:100%] [@media_print]:break-inside-avoid [@media_print]:align-middle [@media_print]:[break-after:auto] [@media_print]:[break-before:auto]" src="/site-assets/6442c24fe07c4900.png" alt="" />
                  </div>
                </article>
              </div>
              <div className="separator items-center mb-[2em] text-center">Articles associated with this tag</div>
              <div className="list__item">
                <ImportedArticleExtensionPackForVSCode />
              </div>
            </div>
          </div>
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
    <article className="archive__item cards rounded-[5px] p-[0.8rem] relative [gap:1rem] [margin-bottom:1rem] [@media(min-width:600px)]:grid-cols-[repeat(2,1fr)]" itemScope itemType="https://schema.org/CreativeWork">
      <div className="card [padding:0.5rem]">
        <h2 className="archive__item-title text-ellipsis [overflow:hidden]" itemProp="headline">
          <a className="[z-index:10]" href="/weblog/2021/07/30/extension-pack-for-vscode-and-code-serverhtml-e4fac4dfb04abe88" rel="permalink">Extension Pack for VSCode &amp; Code Server
    </a>
        </h2>
        <p className="page__meta"><span>{"\n        "}<i className="far fa-calendar-alt" aria-hidden="true" />{"\n        "}<time dateTime="2021-07-30T06:00:00+00:00">July 30, 2021</time>{"\n      "}</span><span className="page__meta-sep" /><span>{"\n        "}<i className="far fa-clock" aria-hidden="true" />
            
              8 minute read
            
          </span></p>
        <p className="archive__item-excerpt mt-[0.5em] [font-size:0.75em]" itemProp="description">Creating extension pack for VS Code &amp; Code Server and publishing on GitHub release using Travis CI
    </p>
        <div className="tag-container mb-[5px]">
          <a className="tag mr-[5px] p-[5px] [z-index:10]" href="/weblog/tags/vscode">#vscode </a>
        </div>
        <div className="tag-container mb-[5px]">
          <a className="tag mr-[5px] p-[5px] [z-index:10]" href="#">#code-server </a>
        </div>
        <div className="tag-container mb-[5px]">
          <a className="tag mr-[5px] p-[5px] [z-index:10]" href="/weblog/tags/github">#github </a>
        </div>
        <div className="tag-container mb-[5px]">
          <a className="tag mr-[5px] p-[5px] [z-index:10]" href="/weblog/tags/ci-cd">#ci-cd </a>
        </div>
        <div className="tag-container mb-[5px]">
          <a className="tag mr-[5px] p-[5px] [z-index:10]" href="/weblog/tags/travis">#travis </a>
        </div>
      </div>
      <div className="archive__item-teaser card rounded-[4px] relative [overflow:hidden] [padding:0.5rem]">
        <img className="align-middle [box-shadow:rgba(0,0,0,0.19)_3px_9px_6px_-1px] [height:auto] [width:100%] [@media_print]:break-inside-avoid [@media_print]:align-middle [@media_print]:[break-after:auto] [@media_print]:[break-before:auto]" src="/site-assets/c7af7a0d152ca214.png" alt="" />
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

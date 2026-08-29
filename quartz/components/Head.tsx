import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
import { CustomOgImagesEmitterName } from "../../.quartz/plugins"
export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")
    const commentsCssPath = joinSegments(baseDir, "static/comments.css")
    const commentsJsPath = joinSegments(baseDir, "static/comments.js")
    const homeGlowJsPath = joinSegments(baseDir, "static/home-glow.js")
    const mobileMenuCssPath = joinSegments(baseDir, "static/mobile-menu.css")
    const mobileMenuJsPath = joinSegments(baseDir, "static/mobile-menu.js")

    // Url of current page
    const socialUrl =
      fileData.slug === "404" ? url.toString() : joinSegments(url.toString(), fileData.slug!)

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some(
      (e) => e.name === CustomOgImagesEmitterName,
    )
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`

    // --- SEO framework: canonical, locale, structured data (JSON-LD) ---
    const localeUnderscore = (cfg.locale ?? "fa-IR").replace("-", "_")
    const isHome = fileData.slug === "index"
    const isPost = !isHome && fileData.slug !== "404" && !!fileData.dates
    const authorName = cfg.pageTitle
    const siteUrl = url.toString().replace(/\/$/, "")
    // Home is served at "/", not "/index"; 404 has no canonical URL of its own.
    const canonicalUrl = isHome
      ? `${siteUrl}/`
      : fileData.slug === "404"
        ? url.toString()
        : socialUrl
    // Prefer the per-page OG image (emitted as `<slug>-og-image.webp`) over the static default.
    const ogImage =
      usesCustomOgImage && fileData.slug
        ? `https://${cfg.baseUrl}/${fileData.slug}-og-image.webp`
        : ogImageDefaultPath
    const datePublished = fileData.dates?.created?.toISOString()
    const dateModified = fileData.dates?.modified?.toISOString()
    const person = { "@type": "Person", name: authorName, url: siteUrl }
    const structuredData = isHome
      ? {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              name: cfg.pageTitle,
              url: siteUrl,
              inLanguage: cfg.locale ?? "fa-IR",
              description,
            },
            person,
          ],
        }
      : isPost
        ? {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BlogPosting",
                headline: title,
                description,
                url: canonicalUrl,
                mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
                inLanguage: cfg.locale ?? "fa-IR",
                image: ogImage,
                author: person,
                publisher: person,
                ...(datePublished ? { datePublished } : {}),
                ...(dateModified ? { dateModified } : {}),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "خانه", item: `${siteUrl}/` },
                  { "@type": "ListItem", position: 2, name: title, item: canonicalUrl },
                ],
              },
            ],
          }
        : {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: title,
            description,
            url: canonicalUrl,
            inLanguage: cfg.locale ?? "fa-IR",
            isPartOf: { "@type": "WebSite", name: cfg.pageTitle, url: siteUrl },
          }

    const coreStylesheet = css[0]?.content
    const coreScript = js.find(
      (r) => r.loadTime === "beforeDOMReady" && r.contentType === "external",
    )

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {coreStylesheet && <link rel="preload" href={coreStylesheet} as="style" />}
        {coreScript && coreScript.contentType === "external" && (
          <link rel="preload" href={coreScript.src} as="script" />
        )}
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta property="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content={isPost ? "article" : "website"} />
        <meta property="og:locale" content={localeUnderscore} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImageDefaultPath) ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={canonicalUrl}></meta>
            <meta property="twitter:url" content={canonicalUrl}></meta>
          </>
        )}

        {/* SEO framework: canonical + article meta + robots + structured data */}
        <link rel="canonical" href={canonicalUrl} />
        <meta name="theme-color" content="#0A72BD" />
        {isPost && datePublished && (
          <meta property="article:published_time" content={datePublished} />
        )}
        {isPost && dateModified && (
          <meta property="article:modified_time" content={dateModified} />
        )}
        {isPost && <meta property="article:author" content={authorName} />}
        {fileData.slug === "404" && <meta name="robots" content="noindex, follow" />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <link rel="icon" href={iconPath} />
        <link rel="stylesheet" href={commentsCssPath} />
        {fileData.slug !== "404" &&
          (() => {
            // Page addresses this note answers to: canonical slug first, then any
            // aliases (old slugs). Lets the comment system follow a renamed note so
            // old comments stay reachable without manual migration.
            const rawAliases = (fileData.frontmatter as Record<string, unknown> | undefined)
              ?.aliases
            const aliases = Array.isArray(rawAliases)
              ? rawAliases
              : typeof rawAliases === "string"
                ? [rawAliases]
                : []
            const slugs = [fileData.slug, ...aliases].filter(Boolean) as string[]
            return <meta name="comment-slugs" content={slugs.join("\n")} />
          })()}
        <link rel="stylesheet" href={mobileMenuCssPath} />
        <script src={commentsJsPath} defer data-persist></script>
        <script src={homeGlowJsPath} defer></script>
        <script src={mobileMenuJsPath} defer data-persist></script>
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor

/**
 * Build Service
 * Section 2.11: Service Layer Implementation
 *
 * Requirements #9-11: BuildService class for static site generation
 */

import { PortfolioNotFoundError, TemplateNotFoundError } from '@/lib/errors';
import { PortfolioService, Portfolio } from './portfolio.service';
import { TemplateService, Template } from './template.service';

/**
 * Build result
 */
export interface BuildResult {
  html: string;
  css: string;
  js: string;
  assets: BuildAsset[];
  sizeInBytes: number;
}

export interface BuildAsset {
  path: string;
  content: Buffer | string;
  mimeType: string;
  sizeInBytes: number;
}

/**
 * Image optimization options
 */
export interface ImageOptimizationOptions {
  compress: boolean;
  generateResponsiveSizes: boolean;
  convertToWebP: boolean;
  quality: number;
  sizes: number[];
}

/**
 * Build Service
 * Requirement #9: Create BuildService class with buildStaticSite method
 */
export class BuildService {
  private portfolioService: PortfolioService;
  private templateService: TemplateService;

  constructor() {
    this.portfolioService = new PortfolioService();
    this.templateService = new TemplateService();
  }

  /**
   * Requirement #10: Build static site
   * - Fetch portfolio and template
   * - Render HTML
   * - Minify HTML/CSS/JS using terser or similar
   */
  async buildStaticSite(portfolioId: string): Promise<BuildResult> {
    // Fetch portfolio
    const portfolio = await this.portfolioService.findById(portfolioId);
    if (!portfolio) {
      throw new PortfolioNotFoundError(portfolioId);
    }

    // Fetch template
    let template: Template | null = null;
    if (portfolio.templateId) {
      template = await this.templateService.findById(portfolio.templateId);
      if (!template) {
        throw new TemplateNotFoundError(portfolio.templateId);
      }
    }

    // Render HTML
    const html = template
      ? await this.templateService.render(template, portfolio.data)
      : this.generateDefaultHtml(portfolio);

    // Extract and minify CSS
    const css = this.extractAndMinifyCss(html, template);

    // Extract and minify JS
    const js = this.extractAndMinifyJs(html);

    // Get assets (images, fonts, etc.)
    const assets = await this.extractAssets(portfolio, template);

    // Minify HTML
    const minifiedHtml = this.minifyHtml(html);

    // Calculate total size
    const sizeInBytes =
      Buffer.byteLength(minifiedHtml) +
      Buffer.byteLength(css) +
      Buffer.byteLength(js) +
      assets.reduce((sum, asset) => sum + asset.sizeInBytes, 0);

    return {
      html: minifiedHtml,
      css,
      js,
      assets,
      sizeInBytes,
    };
  }

  /**
   * Requirement #11: Optimize images
   * - Compress images
   * - Generate responsive sizes
   * - Convert to WebP
   */
  async optimizeImages(
    images: BuildAsset[],
    options: ImageOptimizationOptions = {
      compress: true,
      generateResponsiveSizes: true,
      convertToWebP: true,
      quality: 80,
      sizes: [320, 640, 1024, 1920],
    }
  ): Promise<BuildAsset[]> {
    const optimizedAssets: BuildAsset[] = [];

    for (const image of images) {
      // TODO: In production, use sharp for image processing
      // import sharp from 'sharp';

      if (options.compress) {
        // Requirement #11: Compress image
        const compressed = await this.compressImage(image, options.quality);
        optimizedAssets.push(compressed);
      }

      if (options.generateResponsiveSizes) {
        // Requirement #11: Generate responsive sizes
        for (const size of options.sizes) {
          const resized = await this.resizeImage(image, size);
          optimizedAssets.push(resized);
        }
      }

      if (options.convertToWebP) {
        // Requirement #11: Convert to WebP
        const webp = await this.convertToWebP(image, options.quality);
        optimizedAssets.push(webp);
      }
    }

    return optimizedAssets;
  }

  /**
   * Generate deployment package
   */
  async generateDeploymentPackage(portfolioId: string): Promise<{
    files: Map<string, string | Buffer>;
    manifest: {
      portfolioId: string;
      buildTime: string;
      fileCount: number;
      totalSize: number;
    };
  }> {
    const buildResult = await this.buildStaticSite(portfolioId);

    const files = new Map<string, string | Buffer>();

    // Add main files
    files.set('index.html', buildResult.html);
    files.set('styles.css', buildResult.css);
    files.set('script.js', buildResult.js);

    // Add assets
    for (const asset of buildResult.assets) {
      files.set(asset.path, asset.content);
    }

    // Create manifest
    const manifest = {
      portfolioId,
      buildTime: new Date().toISOString(),
      fileCount: files.size,
      totalSize: buildResult.sizeInBytes,
    };

    return { files, manifest };
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  /**
   * Generate default HTML (when no template)
   */
  private generateDefaultHtml(portfolio: Portfolio): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${portfolio.data.about?.fullName || portfolio.name} - Portfolio</title>
          <link rel="stylesheet" href="styles.css">
        </head>
        <body>
          <header>
            <h1>${portfolio.data.about?.fullName || portfolio.name}</h1>
            <p>${portfolio.data.about?.title || ''}</p>
          </header>
          <main>
            <section id="about">
              <h2>About</h2>
              <p>${portfolio.data.about?.bio || ''}</p>
            </section>
            <section id="contact">
              <h2>Contact</h2>
              <p>Email: ${portfolio.data.contact?.email || ''}</p>
            </section>
          </main>
          <script src="script.js"></script>
        </body>
      </html>
    `;
  }

  /**
   * Extract and minify CSS
   * Requirement #10: Minify CSS
   */
  private extractAndMinifyCss(html: string, template: Template | null): string {
    let css = '';

    // Extract inline styles
    const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/g);
    if (styleMatches) {
      css = styleMatches
        .map((match) => match.replace(/<\/?style[^>]*>/g, ''))
        .join('\n');
    }

    // Add template custom CSS
    if (template?.customCss) {
      css += '\n' + template.customCss;
    }

    // Minify CSS
    // TODO: In production, use cssnano or clean-css
    // import postcss from 'postcss';
    // import cssnano from 'cssnano';
    // const result = await postcss([cssnano]).process(css);
    // return result.css;

    // Simple minification (remove comments, whitespace)
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around punctuation
      .trim();
  }

  /**
   * Extract and minify JS
   * Requirement #10: Minify JS using terser
   */
  private extractAndMinifyJs(html: string): string {
    let js = '';

    // Extract inline scripts
    const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    if (scriptMatches) {
      js = scriptMatches
        .map((match) => match.replace(/<\/?script[^>]*>/g, ''))
        .join('\n');
    }

    // TODO: In production, use terser for minification
    // import { minify } from 'terser';
    // const result = await minify(js, {
    //   compress: { dead_code: true },
    //   mangle: true,
    // });
    // return result.code || '';

    // Simple minification (remove comments, collapse whitespace)
    return js
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim();
  }

  /**
   * Minify HTML
   * Requirement #10: Minify HTML
   */
  private minifyHtml(html: string): string {
    // TODO: In production, use html-minifier-terser
    // import { minify } from 'html-minifier-terser';
    // return await minify(html, {
    //   collapseWhitespace: true,
    //   removeComments: true,
    //   minifyCSS: true,
    //   minifyJS: true,
    // });

    // Simple minification
    return html
      .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/>\s+</g, '><') // Remove spaces between tags
      .trim();
  }

  /**
   * Extract assets from portfolio
   */
  private async extractAssets(
    portfolio: Portfolio,
    template: Template | null
  ): Promise<BuildAsset[]> {
    const assets: BuildAsset[] = [];

    // Extract profile image
    if (portfolio.data.about?.profileImage) {
      assets.push({
        path: 'images/profile.jpg',
        content: Buffer.from(''), // TODO: Fetch actual image
        mimeType: 'image/jpeg',
        sizeInBytes: 0,
      });
    }

    // Extract project images
    if (portfolio.data.projects) {
      for (const project of portfolio.data.projects) {
        if (project.thumbnailUrl) {
          assets.push({
            path: `images/project-${project.id}.jpg`,
            content: Buffer.from(''), // TODO: Fetch actual image
            mimeType: 'image/jpeg',
            sizeInBytes: 0,
          });
        }
      }
    }

    return assets;
  }

  /**
   * Compress image
   * Requirement #11: Image compression
   */
  private async compressImage(
    image: BuildAsset,
    quality: number
  ): Promise<BuildAsset> {
    // TODO: In production, use sharp
    // import sharp from 'sharp';
    // const compressed = await sharp(image.content)
    //   .jpeg({ quality })
    //   .toBuffer();

    // Mock: return same image
    return {
      ...image,
      path: image.path.replace(/\.(jpg|png)$/, '-compressed.$1'),
    };
  }

  /**
   * Resize image
   * Requirement #11: Generate responsive sizes
   */
  private async resizeImage(
    image: BuildAsset,
    width: number
  ): Promise<BuildAsset> {
    // TODO: In production, use sharp
    // import sharp from 'sharp';
    // const resized = await sharp(image.content)
    //   .resize(width)
    //   .toBuffer();

    // Mock: return same image with different path
    const ext = image.path.split('.').pop();
    const baseName = image.path.replace(/\.[^.]+$/, '');

    return {
      ...image,
      path: `${baseName}-${width}w.${ext}`,
    };
  }

  /**
   * Convert to WebP
   * Requirement #11: Convert to WebP format
   */
  private async convertToWebP(
    image: BuildAsset,
    quality: number
  ): Promise<BuildAsset> {
    // TODO: In production, use sharp
    // import sharp from 'sharp';
    // const webp = await sharp(image.content)
    //   .webp({ quality })
    //   .toBuffer();

    // Mock: return same image with .webp extension
    return {
      ...image,
      path: image.path.replace(/\.(jpg|jpeg|png)$/, '.webp'),
      mimeType: 'image/webp',
    };
  }
}

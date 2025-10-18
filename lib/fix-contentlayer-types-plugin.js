const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');

class FixContentlayerTypesPlugin {
  apply(compiler) {
    compiler.hooks.beforeCompile.tapAsync(
      'FixContentlayerTypesPlugin',
      (params, callback) => {
        const typesPath = join(process.cwd(), '.contentlayer', 'generated', 'types.d.ts');
        
        if (existsSync(typesPath)) {
          try {
            let content = readFileSync(typesPath, 'utf8');
            const newContent = content.replace(/images:\s*json/g, 'images: string[]');
            
            if (content !== newContent) {
              writeFileSync(typesPath, newContent, 'utf8');
              console.log('✓ Fixed contentlayer types');
            }
          } catch (error) {
            console.error('Failed to fix contentlayer types:', error.message);
          }
        }
        
        callback();
      }
    );
  }
}

module.exports = FixContentlayerTypesPlugin;

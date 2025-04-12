import { Project, SourceFile, ImportDeclaration } from "ts-morph";
import * as path from "path";
import * as fs from "fs";

/**
 * De-barrels a TypeScript project by replacing imports from barrel files (index.ts)
 * with direct imports to the specific modules.
 *
 * This script:
 * 1. Finds all barrel files (index.ts)
 * 2. Analyzes what they export and from where
 * 3. Finds all imports that use these barrel files
 * 4. Replaces those imports with direct imports to the specific modules
 */

interface ExportInfo {
  exportPath: string;
  isNamespaceExport: boolean;
  exportedNames: string[] | null; // null means '*'
  isDefaultExport: boolean;
  alias?: string;
}

interface BarrelInfo {
  file: SourceFile;
  exports: ExportInfo[];
}

// Create a new ts-morph project
const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
  skipAddingFilesFromTsConfig: false,
  // Only including TypeScript files
  compilerOptions: {
    allowJs: true,
    resolveJsonModule: true,
  },
});

console.log("Project initialized, analyzing files...");
const barrelFiles = new Map<string, BarrelInfo>();

// Find all barrel files (index.ts)
const sourceFiles = project.getSourceFiles();
console.log(`Found ${sourceFiles.length} source files`);

const barrelFilePaths = sourceFiles.filter((file) => {
  const fileName = path.basename(file.getFilePath());
  return fileName === "index.ts" || fileName === "index.tsx";
});

console.log(`Found ${barrelFilePaths.length} barrel files`);

// Analyze each barrel file to determine what it exports and from where
barrelFilePaths.forEach((file) => {
  const exports: ExportInfo[] = [];

  // Get all export declarations
  const exportDeclarations = file.getExportDeclarations();

  exportDeclarations.forEach((exportDecl) => {
    const moduleSpecifier = exportDecl.getModuleSpecifierValue();

    if (moduleSpecifier) {
      // This is an export from another module
      const namedExports = exportDecl.getNamedExports();
      // Use correct method name and check for default export from named exports
      const hasNamespaceExport = exportDecl.getNamespaceExport() !== undefined;
      const isDefaultExport = namedExports.some(
        (ne) => ne.getName() === "default"
      );

      if (namedExports.length > 0) {
        // This is a named export like `export { Button, Input } from './components'`
        exports.push({
          exportPath: moduleSpecifier,
          isNamespaceExport: false,
          exportedNames: namedExports.map((ne) => ne.getName()),
          isDefaultExport: false,
        });
      } else if (hasNamespaceExport) {
        // This is a namespace export like `export * as UI from './components'`
        const namespaceExport = exportDecl.getNamespaceExport();
        if (namespaceExport) {
          exports.push({
            exportPath: moduleSpecifier,
            isNamespaceExport: true,
            exportedNames: null,
            isDefaultExport: false,
            alias: namespaceExport.getText(),
          });
        }
      } else if (isDefaultExport) {
        // This is a default export declaration
        exports.push({
          exportPath: moduleSpecifier,
          isNamespaceExport: false,
          exportedNames: [],
          isDefaultExport: true,
        });
      } else {
        // This is a wildcard export like `export * from './components'`
        exports.push({
          exportPath: moduleSpecifier,
          isNamespaceExport: false,
          exportedNames: null, // null means '*'
          isDefaultExport: false,
        });
      }
    } else {
      // This is a direct export declaration, not from another module
      // We skip these as they don't need to be de-barreled
    }
  });

  // Find star exports (export * from './module') using a different approach
  const fileStatements = file.getStatements();
  const starExports = fileStatements.filter((statement) => {
    const text = statement.getText();
    return text.includes("export *") && text.includes("from");
  });

  starExports.forEach((statement) => {
    const text = statement.getText();
    const match = text.match(/export\s*\*\s*from\s*['"](.+)['"]/);

    if (match && match[1]) {
      exports.push({
        exportPath: match[1],
        isNamespaceExport: false,
        exportedNames: null, // null means '*'
        isDefaultExport: false,
      });
    }
  });

  barrelFiles.set(file.getFilePath(), {
    file,
    exports,
  });
});

// Process each source file to replace barrel imports with direct imports
let totalImportsReplaced = 0;

sourceFiles.forEach((file) => {
  let fileChanged = false;
  const filePath = file.getFilePath();
  const importDeclarations = file.getImportDeclarations();
  const importsToAdd = new Map<string, Set<string>>();
  const importsToDelete: ImportDeclaration[] = [];

  importDeclarations.forEach((importDecl) => {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    if (!moduleSpecifier) return;

    let resolvedPath = "";
    try {
      // Try to resolve the path of the imported module
      resolvedPath = resolveModulePath(filePath, moduleSpecifier);
      
      // Skip non-relative or unresolved imports
      if (resolvedPath.startsWith("non-relative:") || 
          resolvedPath.startsWith("unresolved:")) {
        return;
      }
    } catch (error) {
      // Skip any errors in resolution
      return;
    }

    // Check if this import is for a barrel file
    const barrelInfo = barrelFiles.get(resolvedPath);
    if (!barrelInfo) return;

    // This is an import from a barrel file, we need to replace it
    const namedImports = importDecl.getNamedImports();
    const namespaceImport = importDecl.getNamespaceImport();
    const defaultImport = importDecl.getDefaultImport();

    if (namedImports.length > 0) {
      // This imports specific exports like `import { Button, Input } from './components'`
      const importedNames = namedImports.map((ni) => {
        const name = ni.getName();
        const alias = ni.getAliasNode()?.getText();
        return { name, alias };
      });

      // Find which module each imported name comes from
      importedNames.forEach(({ name, alias }) => {
        // Find the export info that provides this name
        for (const exportInfo of barrelInfo.exports) {
          if (exportInfo.exportedNames === null) {
            // This is a wildcard export (export * from './module')
            // We need to check if the name exists in the target module
            try {
              const targetModulePath = resolveModulePath(
                resolvedPath,
                exportInfo.exportPath
              );
              const targetFile = project.getSourceFile(targetModulePath);

              if (targetFile) {
                const hasExport = targetFile
                  .getExportSymbols()
                  .some((symbol) => symbol.getName() === name);

                if (hasExport) {
                  // Add to imports
                  const relativeModulePath = path.relative(
                    path.dirname(filePath),
                    path.dirname(targetModulePath)
                  );

                  // Ensure the path starts with ./ or ../
                  const normalizedPath = relativeModulePath.startsWith(".")
                    ? relativeModulePath
                    : `./${relativeModulePath}`;

                  // Remove file extension and add module name
                  const targetModuleName = path.join(
                    normalizedPath,
                    path.basename(
                      targetModulePath,
                      path.extname(targetModulePath)
                    )
                  );

                  if (!importsToAdd.has(targetModuleName)) {
                    importsToAdd.set(targetModuleName, new Set());
                  }

                  if (alias) {
                    importsToAdd
                      .get(targetModuleName)
                      ?.add(`${name} as ${alias}`);
                  } else {
                    importsToAdd.get(targetModuleName)?.add(name);
                  }

                  fileChanged = true;
                }
              }
            } catch (error) {
              // Skip if we can't resolve the module
            }
          } else if (
            exportInfo.exportedNames &&
            exportInfo.exportedNames.includes(name)
          ) {
            // This export explicitly includes the name
            // Determine the actual path to import from
            const targetModulePath = resolveModulePath(
              path.dirname(resolvedPath),
              exportInfo.exportPath
            );

            // Get relative path from current file to the target module
            const currentDir = path.dirname(filePath);
            const targetDir = path.dirname(targetModulePath);

            let relativePath = path.relative(currentDir, targetDir);
            // Ensure the path starts with ./ or ../
            if (!relativePath.startsWith(".")) {
              relativePath = `./${relativePath}`;
            }

            // Add target basename without extension
            const baseName = path.basename(
              targetModulePath,
              path.extname(targetModulePath)
            );
            const importPath = path.join(relativePath, baseName);
            const normalizedImportPath = importPath.replace(/\\/g, "/");

            if (!importsToAdd.has(normalizedImportPath)) {
              importsToAdd.set(normalizedImportPath, new Set());
            }

            if (alias) {
              importsToAdd
                .get(normalizedImportPath)
                ?.add(`${name} as ${alias}`);
            } else {
              importsToAdd.get(normalizedImportPath)?.add(name);
            }

            fileChanged = true;
          }
        }
      });

      // Mark this import for deletion
      importsToDelete.push(importDecl);
    } else if (namespaceImport) {
      // This is a namespace import like `import * as UI from './components'`
      // Since we can't easily split this up, we'll keep it as is
      // but we might be able to optimize further in future versions
    } else if (defaultImport) {
      // This is a default import like `import Button from './components'`
      // Handle default imports by finding which module provides the default export
      const defaultName = defaultImport.getText();

      for (const exportInfo of barrelInfo.exports) {
        if (exportInfo.isDefaultExport) {
          // This export provides a default export
          const targetModulePath = resolveModulePath(
            path.dirname(resolvedPath),
            exportInfo.exportPath
          );

          // Get relative path from current file to the target module
          const currentDir = path.dirname(filePath);
          const targetDir = path.dirname(targetModulePath);

          let relativePath = path.relative(currentDir, targetDir);
          // Ensure the path starts with ./ or ../
          if (!relativePath.startsWith(".")) {
            relativePath = `./${relativePath}`;
          }

          // Add target basename without extension
          const baseName = path.basename(
            targetModulePath,
            path.extname(targetModulePath)
          );
          const importPath = path.join(relativePath, baseName);
          const normalizedImportPath = importPath.replace(/\\/g, "/");

          file.addImportDeclaration({
            defaultImport: defaultName,
            moduleSpecifier: normalizedImportPath,
          });

          fileChanged = true;
          break;
        }
      }

      // Mark this import for deletion
      importsToDelete.push(importDecl);
    }
  });

  // Delete the old imports
  importsToDelete.forEach((importDecl) => {
    importDecl.remove();
    totalImportsReplaced++;
  });

  // Add the new direct imports
  importsToAdd.forEach((names, modulePath) => {
    file.addImportDeclaration({
      namedImports: Array.from(names),
      moduleSpecifier: modulePath,
    });
  });

  // Save the file if changes were made
  if (fileChanged) {
    file.saveSync();
  }
});

console.log(
  `Finished de-barreling. Replaced ${totalImportsReplaced} barrel imports.`
);

/**
 * Helper function to resolve the absolute path of a module
 */
function resolveModulePath(
  fromFilePath: string,
  moduleSpecifier: string
): string {
  // For non-relative imports, we return a special marker path to skip them
  if (!moduleSpecifier.startsWith(".")) {
    // Skip external modules but don't throw an error
    return "non-relative:" + moduleSpecifier;
  }

  const fromDir = path.dirname(fromFilePath);
  const resolvedPath = path.resolve(fromDir, moduleSpecifier);

  // Handle cases where the import doesn't have an extension
  if (!path.extname(resolvedPath)) {
    // Try common extensions
    for (const ext of [".ts", ".tsx", ".js", ".jsx"]) {
      const pathWithExt = `${resolvedPath}${ext}`;
      if (fs.existsSync(pathWithExt)) {
        return pathWithExt;
      }
    }

    // Try index files in directories
    for (const ext of [".ts", ".tsx", ".js", ".jsx"]) {
      const indexPath = path.join(resolvedPath, `index${ext}`);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }
  } else if (fs.existsSync(resolvedPath)) {
    return resolvedPath;
  }

  // If we can't resolve the module, return a special path to indicate that
  return "unresolved:" + moduleSpecifier;
}

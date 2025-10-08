#!/usr/bin/env node

/**
 * @fileoverview Automated JSDoc Comment Generator for TypeScript/JavaScript Projects
 * 
 * This script recursively processes TypeScript and JavaScript files in a project,
 * adding JSDoc comments to functions, classes, interfaces, and React components
 * that don't already have them.
 * 
 * @author Sean Dinwiddie
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

/**
 * Configuration object for the JSDoc generator
 * 
 * @typedef {Object} JSDocConfig
 * @property {string[]} extensions - File extensions to process
 * @property {string[]} excludeDirs - Directories to exclude from processing
 * @property {boolean} dryRun - If true, only show what would be changed without modifying files
 * @property {boolean} verbose - If true, show detailed logging
 */

/** @type {JSDocConfig} */
const config = {
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  excludeDirs: ['node_modules', 'dist', 'build', '.git', 'coverage'],
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
};

/**
 * Recursively finds all files with specified extensions in a directory
 * 
 * @param {string} dir - The directory to search
 * @param {string[]} extensions - File extensions to include
 * @param {string[]} excludeDirs - Directories to exclude
 * @returns {string[]} Array of file paths
 */
const findFiles = (dir, extensions, excludeDirs) => {
  const files = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(item)) {
        files.push(...findFiles(fullPath, extensions, excludeDirs));
      }
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
};

/**
 * Checks if a line is part of an existing JSDoc comment
 * 
 * @param {string} line - The line to check
 * @returns {boolean} True if the line is part of a JSDoc comment
 */
const isJSDocComment = (line) => {
  const trimmed = line.trim();
  return trimmed.startsWith('/**') || 
         trimmed.startsWith('*') || 
         trimmed.includes('*/');
};

/**
 * Generates a JSDoc comment for a function
 * 
 * @param {string} functionSignature - The function signature line
 * @param {string} indent - The indentation to use
 * @returns {string} The generated JSDoc comment
 */
const generateFunctionJSDoc = (functionSignature, indent) => {
  const funcName = functionSignature.match(/(?:function|const|let|var)\s+(\w+)/)?.[1] || 'Unknown';
  const params = functionSignature.match(/\(([^)]*)\)/)?.[1] || '';
  
  const paramList = params
    .split(',')
    .map(p => p.trim())
    .filter(p => p && !p.includes('=')) // Exclude default params for brevity
    .map(p => {
      const [name, type] = p.split(':').map(s => s.trim());
      const paramType = type || 'any';
      return `${indent} * @param {${paramType}} ${name}`;
    });
  
  const isAsync = functionSignature.includes('async');
  const returnType = functionSignature.match(/:\s*([^{=]+)/)?.[1]?.trim() || 'void';
  
  return [
    `${indent}/**`,
    `${indent} * ${funcName}`,
    `${indent} * `,
    `${indent} * @function ${funcName}`,
    ...paramList,
    `${indent} * @returns {${isAsync ? `Promise<${returnType}>` : returnType}}`,
    `${indent} */`
  ].join('\n');
};

/**
 * Generates a JSDoc comment for a React component
 * 
 * @param {string} componentSignature - The component signature line
 * @param {string} indent - The indentation to use
 * @returns {string} The generated JSDoc comment
 */
const generateComponentJSDoc = (componentSignature, indent) => {
  const compName = componentSignature.match(/(?:function|const)\s+(\w+)/)?.[1] || 'Component';
  const props = componentSignature.match(/<(\w+)>/)?.[1] || 'any';
  
  return [
    `${indent}/**`,
    `${indent} * ${compName} Component`,
    `${indent} * `,
    `${indent} * @component`,
    props !== 'any' ? `${indent} * @param {${props}} props - Component properties` : '',
    `${indent} * @returns {JSX.Element}`,
    `${indent} */`
  ].filter(Boolean).join('\n');
};

/**
 * Generates a JSDoc comment for an interface or type
 * 
 * @param {string} typeSignature - The type/interface signature line
 * @param {string} indent - The indentation to use
 * @returns {string} The generated JSDoc comment
 */
const generateTypeJSDoc = (typeSignature, indent) => {
  const typeName = typeSignature.match(/(?:interface|type)\s+(\w+)/)?.[1] || 'Type';
  const kind = typeSignature.includes('interface') ? 'interface' : 'type';
  
  return [
    `${indent}/**`,
    `${indent} * ${typeName}`,
    `${indent} * `,
    `${indent} * @${kind === 'interface' ? 'interface' : 'typedef'} {Object} ${typeName}`,
    `${indent} */`
  ].join('\n');
};

/**
 * Processes a single file, adding JSDoc comments where needed
 * 
 * @param {string} filePath - Path to the file to process
 * @returns {Object} Object with stats about changes made
 */
const processFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const newLines = [];
  const stats = { functions: 0, components: 0, types: 0 };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = i > 0 ? lines[i - 1] : '';
    const indent = line.match(/^(\s*)/)[1];
    
    // Skip if previous line is already a JSDoc comment
    if (isJSDocComment(prevLine)) {
      newLines.push(line);
      continue;
    }
    
    // Check for React components
    if (line.match(/^(export\s+)?(default\s+)?function\s+[A-Z]\w+/) || 
        line.match(/^(export\s+)?(const|let)\s+[A-Z]\w+\s*[=:]\s*(\([^)]*\)|<\w+>)\s*=>/)) {
      if (!isJSDocComment(prevLine)) {
        newLines.push(generateComponentJSDoc(line, indent));
        stats.components++;
      }
      newLines.push(line);
      continue;
    }
    
    // Check for regular functions
    if (line.match(/^(export\s+)?(async\s+)?function\s+\w+/) || 
        line.match(/^(export\s+)?(const|let)\s+\w+\s*[=:]\s*(\([^)]*\)|async\s*\([^)]*\))\s*=>/)) {
      if (!isJSDocComment(prevLine)) {
        newLines.push(generateFunctionJSDoc(line, indent));
        stats.functions++;
      }
      newLines.push(line);
      continue;
    }
    
    // Check for interfaces and types
    if (line.match(/^(export\s+)?(interface|type)\s+\w+/)) {
      if (!isJSDocComment(prevLine)) {
        newLines.push(generateTypeJSDoc(line, indent));
        stats.types++;
      }
      newLines.push(line);
      continue;
    }
    
    newLines.push(line);
  }
  
  if (stats.functions > 0 || stats.components > 0 || stats.types > 0) {
    if (!config.dryRun) {
      fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    }
    return { filePath, ...stats, modified: true };
  }
  
  return { filePath, ...stats, modified: false };
};

/**
 * Main execution function
 * 
 * @async
 * @function main
 * @returns {Promise<void>}
 */
const main = async () => {
  const targetDir = process.argv[2] || process.cwd();
  
  console.log('🚀 JSDoc Comment Generator');
  console.log('=' .repeat(50));
  console.log(`📁 Target directory: ${targetDir}`);
  console.log(`🔍 Processing extensions: ${config.extensions.join(', ')}`);
  console.log(`${config.dryRun ? '👀 DRY RUN MODE - No files will be modified' : '✍️  Modifying files'}`);
  console.log('=' .repeat(50));
  console.log('');
  
  const files = findFiles(targetDir, config.extensions, config.excludeDirs);
  console.log(`Found ${files.length} files to process\n`);
  
  const results = [];
  let totalFunctions = 0;
  let totalComponents = 0;
  let totalTypes = 0;
  let filesModified = 0;
  
  for (const file of files) {
    const result = processFile(file);
    results.push(result);
    
    totalFunctions += result.functions;
    totalComponents += result.components;
    totalTypes += result.types;
    
    if (result.modified) {
      filesModified++;
      const relativePath = path.relative(targetDir, file);
      console.log(`✅ ${relativePath}`);
      if (config.verbose) {
        if (result.functions > 0) console.log(`   📝 Functions: ${result.functions}`);
        if (result.components > 0) console.log(`   🎨 Components: ${result.components}`);
        if (result.types > 0) console.log(`   📋 Types: ${result.types}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary');
  console.log('='.repeat(50));
  console.log(`Files processed: ${files.length}`);
  console.log(`Files modified: ${filesModified}`);
  console.log(`Functions documented: ${totalFunctions}`);
  console.log(`Components documented: ${totalComponents}`);
  console.log(`Types documented: ${totalTypes}`);
  console.log('='.repeat(50));
  
  if (config.dryRun) {
    console.log('\n💡 Run without --dry-run to apply changes');
  } else {
    console.log('\n✨ JSDoc comments added successfully!');
  }
};

// Run the script
main().catch(console.error);

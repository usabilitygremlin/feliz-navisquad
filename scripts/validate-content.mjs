#!/usr/bin/env node
// Validates content/exercises.json, content/routines.json and the images they reference.
// Usage: node scripts/validate-content.mjs [repo-root]   (exit code 1 on any error)
// Days without content are listed but allowed until launch.

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { formatDayList, validateContent } from '../js/content.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Reads and validates the content in `root`. Returns { errors, missingDays }. */
export function validateFiles(root = ROOT) {
  const errors = [];
  const read = (name) => {
    try {
      return JSON.parse(readFileSync(join(root, 'content', name), 'utf8'));
    } catch (e) {
      errors.push(`${name}: ${e.message}`);
      return null;
    }
  };
  const exercises = read('exercises.json');
  const routines = read('routines.json');
  if (errors.length) return { errors, missingDays: [] };
  return validateContent({ exercises, routines }, { imageExists: (src) => existsSync(join(root, src)) });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { errors, missingDays } = validateFiles(process.argv[2] || ROOT);
  if (errors.length) {
    console.error(`✖ Content is invalid (${errors.length} problem${errors.length > 1 ? 's' : ''}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log('✔ Content is valid.');
  if (missingDays.length) console.log(`  Days without content yet: ${formatDayList(missingDays)}`);
}

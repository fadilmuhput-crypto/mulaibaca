import { importBooksFromOL } from "../lib/import-books";

async function main() {
  console.log("📚 Importing books from OpenLibrary...\n");

  const result = await importBooksFromOL();

  console.log(`✅ Imported: ${result.imported}`);
  console.log(`⏭️  Skipped (already exist): ${result.skipped}`);

  if (result.errors.length > 0) {
    console.log(`\n⚠️  Errors (${result.errors.length}):`);
    for (const err of result.errors.slice(0, 10)) {
      console.log(`  • ${err}`);
    }
    if (result.errors.length > 10) {
      console.log(`  … and ${result.errors.length - 10} more`);
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);

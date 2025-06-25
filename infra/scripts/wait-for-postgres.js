const { exec } = require('node:child_process');

function checkPostgres() {
  exec('docker exec postgres-dev pg_isready --host localhost', handleReturn);

  function handleReturn(error, stdout) {
    if (error) {
      console.error(`\n❌ Error executing command: ${error.message}`);
      process.exit(1); // Exit the script with a failure code
    }
    if (stdout.search('accepting connections') === -1) {
      process.stdout.write('.');
      checkPostgres();
      return;
    }

    console.log('\n🟢 Postgres está pronto e aceitando conexões!\n');
  }
}

process.stdout.write('\n🔴 Aguardando Postgres aceitar conexões');
checkPostgres();
